import { Router, Request, Response } from 'express';
import { prisma, withDbRetry } from '../prisma.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';

export const coursesRouter = Router();

// GET /api/courses - List courses with filters
coursesRouter.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { category, level, search, featured } = req.query;

    const where: any = { published: true };

    if (category && typeof category === 'string' && category !== 'All') {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (level && typeof level === 'string' && level !== 'All') {
      where.level = level;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { subtitle: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { instructorName: { contains: term, mode: 'insensitive' } },
      ];
    }

    const courses = await withDbRetry(() =>
      prisma.course.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        include: {
          modules: {
            select: {
              id: true,
              title: true,
              order: true,
              lessons: {
                select: {
                  id: true,
                  title: true,
                  duration: true,
                  order: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      })
    );

    // Check user enrollments if logged in
    let userEnrollmentMap = new Map<string, string>();
    if (req.user) {
      const enrollments = await withDbRetry(() =>
        prisma.enrollment.findMany({
          where: { userId: req.user!.id },
          select: { courseId: true, status: true },
        })
      );
      enrollments.forEach((e) => userEnrollmentMap.set(e.courseId, e.status));
    }

    const formattedCourses = courses.map((course) => {
      let lessonCount = 0;
      course.modules.forEach((m) => {
        lessonCount += m.lessons.length;
      });

      const userStatus = userEnrollmentMap.get(course.id) || 'none';

      return {
        ...course,
        moduleCount: course.modules.length,
        lessonCount,
        isEnrolled: userStatus === 'approved',
        enrollmentStatus: userStatus,
      };
    });

    return res.json({ courses: formattedCourses });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ error: 'Failed to retrieve course catalog.' });
  }
});

// GET /api/courses/:slug - Detailed view with full syllabus and student progress
coursesRouter.get('/:slug', optionalAuth, async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);

    const course = await withDbRetry(() =>
      prisma.course.findUnique({
        where: { slug },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  moduleId: true,
                  title: true,
                  order: true,
                  duration: true,
                  durationSeconds: true,
                  videoType: true,
                  videoUrl: true,
                  description: true,
                  summary: true,
                  resourcesJson: true,
                },
              },
            },
          },
          reviews: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
      })
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    let isEnrolled = false;
    let enrollmentStatus = 'none';
    let completedLessonIds: string[] = [];
    let progressPercent = 0;

    if (req.user) {
      const enrollment = await withDbRetry(() =>
        prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: req.user!.id,
              courseId: course.id,
            },
          },
        })
      );

      if (enrollment) {
        enrollmentStatus = enrollment.status || 'pending';
        isEnrolled = enrollment.status === 'approved';

        if (isEnrolled) {
          const progressRecords = await prisma.lessonProgress.findMany({
            where: {
              userId: req.user!.id,
              completed: true,
              lesson: {
                module: {
                  courseId: course.id,
                },
              },
            },
            select: { lessonId: true },
          });

          completedLessonIds = progressRecords.map((p) => p.lessonId);

          let totalLessons = 0;
          course.modules.forEach((m: any) => {
            totalLessons += m.lessons.length;
          });

          progressPercent =
            totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0;
        }
      }
    }

    return res.json({
      course,
      isEnrolled,
      enrollmentStatus,
      progress: {
        completedLessonIds,
        progressPercent,
      },
    });
  } catch (error: any) {
    console.error('Error fetching course details:', error);
    return res.status(500).json({ error: 'Failed to retrieve course details.' });
  }
});

// POST /api/courses/enroll/:courseId - Apply for course admission (awaiting facilitator approval)
coursesRouter.post('/enroll/:courseId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const courseId = String(req.params.courseId);
    const userId = req.user!.id;

    const course = await withDbRetry(() =>
      prisma.course.findUnique({ where: { id: courseId } })
    );
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existing = await withDbRetry(() =>
      prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      })
    );

    if (existing) {
      if (existing.status === 'approved') {
        return res.json({
          message: 'You already have approved access to this course.',
          enrollment: existing,
          enrollmentStatus: 'approved',
          isEnrolled: true,
        });
      }
      return res.json({
        message: 'Your admission application is currently pending facilitator approval.',
        enrollment: existing,
        enrollmentStatus: existing.status,
        isEnrolled: false,
      });
    }

    const enrollment = await withDbRetry(() =>
      prisma.enrollment.create({
        data: {
          userId,
          courseId,
          status: 'pending',
          enrolledAt: new Date(),
          lastAccessedAt: new Date(),
        },
      })
    );

    return res.status(201).json({
      message: 'Admission application submitted! A Terraskills facilitator will review and grant access.',
      enrollment,
      enrollmentStatus: 'pending',
      isEnrolled: false,
    });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return res.status(500).json({ error: 'Failed to complete admission request.' });
  }
});

// POST /api/courses - Create course (Instructors/Admins)
coursesRouter.post('/', authenticateToken, requireRole(['instructor', 'admin']), async (req: Request, res: Response) => {
  try {
    const {
      title,
      subtitle,
      description,
      category,
      level,
      thumbnail,
      duration,
      modules,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required.' });
    }

    // Generate URL-friendly slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const newCourse = await withDbRetry(() =>
      prisma.course.create({
        data: {
          title,
          slug,
          subtitle: subtitle || 'Comprehensive career masterclass by Terraskills',
          description,
          category,
          level: level || 'All Levels',
          thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
          instructorId: req.user!.id,
          instructorName: req.user!.name || 'Terraskills Certified Lead Instructor',
          instructorTitle: 'Terraskills Lead Instructor',
          duration: duration || 'Self-paced',
          reviewsCount: 0,
          rating: 5.0,
          modules: {
            create: (modules || []).map((m: any, mIdx: number) => ({
              title: m.title || `Module ${mIdx + 1}`,
              order: mIdx + 1,
              lessons: {
                create: (m.lessons || []).map((l: any, lIdx: number) => ({
                  title: l.title || `Lesson ${lIdx + 1}`,
                  order: lIdx + 1,
                  duration: l.duration || '15m',
                  durationSeconds: 900,
                  videoType: l.videoType || 'youtube',
                  videoUrl: l.videoUrl || '',
                  description: l.description || '',
                  summary: l.summary || '',
                })),
              },
            })),
          },
        },
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      })
    );

    return res.status(201).json({
      message: 'Course created successfully',
      course: newCourse,
    });
  } catch (error: any) {
    console.error('Course creation error:', error);
    return res.status(500).json({ error: 'Failed to create course.' });
  }
});

// PUT /api/courses/:id - Update course metadata and full syllabus (Instructors/Admins)
coursesRouter.put('/:id', authenticateToken, requireRole(['instructor', 'admin']), async (req: Request, res: Response) => {
  try {
    const courseId = String(req.params.id);
    const {
      title,
      subtitle,
      description,
      category,
      level,
      thumbnail,
      duration,
      badge,
      price,
      modules,
    } = req.body;

    const existingCourse = await withDbRetry(() =>
      prisma.course.findFirst({
        where: {
          OR: [{ id: courseId }, { slug: courseId }],
        },
      })
    );

    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Update course metadata
    await withDbRetry(() =>
      prisma.course.update({
        where: { id: existingCourse.id },
        data: {
          ...(title ? { title } : {}),
          ...(subtitle !== undefined ? { subtitle } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(category ? { category } : {}),
          ...(level ? { level } : {}),
          ...(thumbnail !== undefined ? { thumbnail } : {}),
          ...(duration !== undefined ? { duration } : {}),
          ...(badge !== undefined ? { badge } : {}),
          ...(price !== undefined ? { price: Number(price) || 0 } : {}),
          instructorId: req.user!.id,
          instructorName: req.user!.name || existingCourse.instructorName,
        },
      })
    );

    // If modules array was sent, replace the modules and lessons
    if (Array.isArray(modules)) {
      // Delete existing modules (cascades to lessons)
      await withDbRetry(() =>
        prisma.module.deleteMany({
          where: { courseId: existingCourse.id },
        })
      );

      // Recreate new modules & lessons
      for (let mIdx = 0; mIdx < modules.length; mIdx++) {
        const m = modules[mIdx];
        if (!m.title && (!m.lessons || m.lessons.length === 0)) continue;

        await withDbRetry(() =>
          prisma.module.create({
            data: {
              courseId: existingCourse.id,
              title: m.title || `Module ${mIdx + 1}`,
              order: mIdx + 1,
              lessons: {
                create: (m.lessons || []).map((l: any, lIdx: number) => ({
                  title: l.title || `Lesson ${lIdx + 1}`,
                  order: lIdx + 1,
                  duration: l.duration || '15m',
                  durationSeconds: 900,
                  videoType: l.videoType || 'youtube',
                  videoUrl: l.videoUrl || '',
                  description: l.description || '',
                  summary: l.summary || '',
                })),
              },
            },
          })
        );
      }
    }

    const fullCourse = await withDbRetry(() =>
      prisma.course.findUnique({
        where: { id: existingCourse.id },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      })
    );

    return res.json({
      message: 'Course updated successfully',
      course: fullCourse,
    });
  } catch (error: any) {
    console.error('Course update error:', error);
    return res.status(500).json({ error: 'Failed to update course.' });
  }
});

// DELETE /api/courses/:id - Delete course (Instructors/Admins)
coursesRouter.delete('/:id', authenticateToken, requireRole(['instructor', 'admin']), async (req: Request, res: Response) => {
  try {
    const courseId = String(req.params.id);

    const existingCourse = await withDbRetry(() =>
      prisma.course.findFirst({
        where: {
          OR: [{ id: courseId }, { slug: courseId }],
        },
      })
    );

    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    await withDbRetry(() =>
      prisma.course.delete({
        where: { id: existingCourse.id },
      })
    );

    return res.json({ message: 'Course deleted successfully.' });
  } catch (error: any) {
    console.error('Course deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete course.' });
  }
});
