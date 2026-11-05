import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { prisma, withDbRetry } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';

export const progressRouter = Router();

// POST /api/progress/toggle - Toggle lesson completion status
progressRouter.post('/toggle', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { lessonId, courseId } = req.body;
    const userId = req.user!.id;

    if (!lessonId || !courseId) {
      return res.status(400).json({ error: 'lessonId and courseId are required.' });
    }

    // Verify user has approved course access
    const enrollment = await withDbRetry(() =>
      prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      })
    );

    if (!enrollment || enrollment.status !== 'approved') {
      return res.status(403).json({
        error: 'Access denied. You need facilitator approval to record lesson progress for this course.',
      });
    }

    // Update lastAccessedAt
    await withDbRetry(() =>
      prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { lastAccessedAt: new Date() },
      })
    );

    // Check existing progress
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    const newCompleted = existingProgress ? !existingProgress.completed : true;

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      create: {
        userId,
        lessonId,
        completed: newCompleted,
        completedAt: newCompleted ? new Date() : null,
      },
      update: {
        completed: newCompleted,
        completedAt: newCompleted ? new Date() : null,
      },
    });

    // Recalculate total course progress
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    let allLessonIds: string[] = [];
    course.modules.forEach((m) => {
      m.lessons.forEach((l) => allLessonIds.push(l.id));
    });

    const completedProgresses = await prisma.lessonProgress.findMany({
      where: {
        userId,
        completed: true,
        lessonId: { in: allLessonIds },
      },
      select: { lessonId: true },
    });

    const completedLessonIds = completedProgresses.map((p) => p.lessonId);
    const totalLessons = allLessonIds.length;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0;
    const isCompleted = progressPercent === 100;

    // If 100%, generate verifiable certificate ID
    let certificateId: string | null = null;
    if (isCompleted) {
      certificateId = `TS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          completed: true,
          completedAt: new Date(),
          certificateId,
        },
      });
    }

    return res.json({
      lessonId,
      completed: newCompleted,
      completedLessonIds,
      progressPercent,
      isCourseCompleted: isCompleted,
      certificateId,
    });
  } catch (error: any) {
    console.error('Progress toggle error:', error);
    return res.status(500).json({ error: 'Failed to update lesson progress.' });
  }
});

// POST /api/progress/watch-time - Save last position and watch duration
progressRouter.post('/watch-time', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { lessonId, seconds } = req.body;
    const userId = req.user!.id;

    if (!lessonId || typeof seconds !== 'number') {
      return res.status(400).json({ error: 'lessonId and valid seconds required.' });
    }

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      create: {
        userId,
        lessonId,
        lastPositionSeconds: Math.floor(seconds),
      },
      update: {
        lastPositionSeconds: Math.floor(seconds),
      },
    });

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to record watch time.' });
  }
});

// GET /api/progress/certificate/:certificateId - Public verification of completion certificate
progressRouter.get('/certificate/:certificateId', async (req: Request, res: Response) => {
  try {
    const certificateId = String(req.params.certificateId || '').trim();
    if (!certificateId) {
      return res.status(400).json({ error: 'Valid certificate ID required.' });
    }

    const enrollment = await withDbRetry(() =>
      prisma.enrollment.findFirst({
        where: {
          AND: [
            {
              OR: [
                { certificateId },
                { id: certificateId },
              ],
            },
            { completed: true },
          ],
        },
        include: {
          user: { select: { name: true, email: true } },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
              level: true,
              duration: true,
              instructorName: true,
              instructorTitle: true,
              instructorAvatar: true,
              thumbnail: true,
            },
          },
        },
      })
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Certificate record not found, invalid, or curriculum not yet completed.' });
    }

    return res.json({
      certificateId: enrollment.certificateId || `TS-CERT-${enrollment.id.substring(0, 8).toUpperCase()}`,
      studentName: enrollment.user.name,
      course: enrollment.course,
      completedAt: enrollment.completedAt || enrollment.enrolledAt,
    });
  } catch (error: any) {
    console.error('Certificate verification error:', error);
    return res.status(500).json({ error: 'Failed to verify certificate.' });
  }
});


