import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, withDbRetry } from '../prisma.js';
import { config } from '../config.js';
import { authenticateToken } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/security.js';

export const authRouter = Router();

// Rate limiter for authentication attempts (15 attempts per 15 mins)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  message: 'Too many authentication attempts. Please try again in a few minutes.',
});

// RFC-compliant email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
authRouter.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      name,
      role,
      whatsapp,
      address,
      courseId,
      courseTitle,
      courseCategory,
    } = req.body;

    if (!email || !EMAIL_REGEX.test(email.toLowerCase().trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide your full name (minimum 2 characters).' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await withDbRetry(() =>
      prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
    );

    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Salt rounds 12 for strong security
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const assignedRole = role === 'instructor' ? 'instructor' : 'student';

    const user = await withDbRetry(() =>
      prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: name.trim(),
          role: assignedRole,
          whatsapp: whatsapp ? String(whatsapp).trim() : null,
          address: address ? String(address).trim() : null,
          avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=dbeafe,fde047,fbcfe8`,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          whatsapp: true,
          address: true,
          avatar: true,
          createdAt: true,
        },
      })
    );

    // If registering as an instructor, associate them with their chosen course
    if (assignedRole === 'instructor') {
      if (courseId && typeof courseId === 'string' && courseId !== 'new') {
        const existingCourse = await withDbRetry(() =>
          prisma.course.findUnique({ where: { id: courseId } })
        );

        if (existingCourse) {
          // Update the course with the new faculty lead
          await withDbRetry(() =>
            prisma.course.update({
              where: { id: existingCourse.id },
              data: {
                instructorId: user.id,
                instructorName: user.name,
                instructorAvatar: user.avatar,
              },
            })
          );

          // Grant the instructor approved access
          await withDbRetry(() =>
            prisma.enrollment.upsert({
              where: {
                userId_courseId: {
                  userId: user.id,
                  courseId: existingCourse.id,
                },
              },
              create: {
                userId: user.id,
                courseId: existingCourse.id,
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: 'Assigned Faculty Lead',
              },
              update: {
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: 'Assigned Faculty Lead',
              },
            })
          );
        }
      } else if (courseTitle && typeof courseTitle === 'string' && courseTitle.trim() !== '') {
        const cleanTitle = courseTitle.trim();
        const baseSlug = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${Date.now().toString(36)}`;

        const newCourse = await withDbRetry(() =>
          prisma.course.create({
            data: {
              title: cleanTitle,
              slug,
              subtitle: `Terraskills Professional Program led by ${user.name}`,
              description: `Accredited masterclass curriculum in ${
                courseCategory || 'Software Engineering'
              } authored by ${user.name}.`,
              category: courseCategory || 'Software Engineering',
              level: 'All Levels',
              thumbnail:
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
              instructorId: user.id,
              instructorName: user.name,
              instructorTitle: 'Terraskills Certified Lead Instructor',
              instructorAvatar: user.avatar,
              duration: '6h 30m',
            },
          })
        );

        await withDbRetry(() =>
          prisma.enrollment.create({
            data: {
              userId: user.id,
              courseId: newCourse.id,
              status: 'approved',
              approvedAt: new Date(),
              approvedBy: 'Assigned Faculty Lead',
            },
          })
        );
      }
    }

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account registered successfully',
      user,
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Unable to complete registration. Please try again.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await withDbRetry(() =>
      prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
    );

    if (!user) {
      // Generic message to prevent email enumeration attacks
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        whatsapp: user.whatsapp,
        address: user.address,
        avatar: user.avatar,
        headline: user.headline,
        bio: user.bio,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred while logging in. Please try again.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await withDbRetry(() =>
      prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          whatsapp: true,
          address: true,
          avatar: true,
          headline: true,
          bio: true,
          createdAt: true,
          enrollments: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  thumbnail: true,
                  duration: true,
                  category: true,
                  modules: {
                    include: {
                      lessons: {
                        select: { id: true },
                      },
                    },
                  },
                },
              },
            },
          },
          lessonProgress: {
            select: {
              lessonId: true,
              completed: true,
            },
          },
        },
      })
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Calculate progress for each enrollment
    const completedLessonIds = new Set(
      user.lessonProgress.filter((p) => p.completed).map((p) => p.lessonId)
    );

    const enrichedEnrollments = user.enrollments.map((enr) => {
      let totalLessons = 0;
      let completedInCourse = 0;

      enr.course.modules.forEach((mod) => {
        mod.lessons.forEach((l) => {
          totalLessons += 1;
          if (completedLessonIds.has(l.id)) {
            completedInCourse += 1;
          }
        });
      });

      const progressPercent =
        totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0;

      return {
        id: enr.id,
        courseId: enr.courseId,
        status: enr.status || 'pending',
        approvedAt: enr.approvedAt,
        approvedBy: enr.approvedBy,
        enrolledAt: enr.enrolledAt,
        completed: enr.completed || progressPercent === 100,
        completedAt: enr.completedAt,
        certificateId: enr.certificateId,
        progressPercent,
        completedLessonsCount: completedInCourse,
        totalLessonsCount: totalLessons,
        course: {
          id: enr.course.id,
          title: enr.course.title,
          slug: enr.course.slug,
          thumbnail: enr.course.thumbnail,
          duration: enr.course.duration,
          category: enr.course.category,
        },
      };
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        whatsapp: user.whatsapp,
        address: user.address,
        avatar: user.avatar,
        headline: user.headline,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      enrollments: enrichedEnrollments,
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Unable to fetch user profile.' });
  }
});

