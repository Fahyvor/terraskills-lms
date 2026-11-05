import { Router, Request, Response } from 'express';
import { prisma, withDbRetry } from '../prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const facilitatorRouter = Router();

// GET /api/facilitator/admissions - List all course enrollment applications, students, and courses
facilitatorRouter.get(
  '/admissions',
  authenticateToken,
  requireRole(['instructor', 'admin']),
  async (req: Request, res: Response) => {
    try {
      // 1. Fetch all enrollments with student and course info
      const admissions = await withDbRetry(() =>
        prisma.enrollment.findMany({
          orderBy: [
            { enrolledAt: 'desc' },
          ],
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                whatsapp: true,
                address: true,
                avatar: true,
                role: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                thumbnail: true,
                duration: true,
              },
            },
          },
        })
      );

      // Sort with 'pending' admissions first
      admissions.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
      });

      // 2. Fetch all registered students for quick assignment
      const students = await withDbRetry(() =>
        prisma.user.findMany({
          where: { role: 'student' },
          select: {
            id: true,
            name: true,
            email: true,
            whatsapp: true,
            address: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        })
      );

      // 3. Fetch courses
      const courses = await withDbRetry(() =>
        prisma.course.findMany({
          where: { published: true },
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
          },
          orderBy: { title: 'asc' },
        })
      );

      return res.json({
        admissions,
        students,
        courses,
      });
    } catch (error: any) {
      console.error('Error fetching admissions:', error);
      return res.status(500).json({ error: 'Failed to retrieve course admissions.' });
    }
  }
);

// POST /api/facilitator/grant-access - Approve enrollment or grant access
facilitatorRouter.post(
  '/grant-access',
  authenticateToken,
  requireRole(['instructor', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const { enrollmentId, userId, courseId } = req.body;
      const facilitatorName = req.user?.name || 'Terraskills Facilitator';

      let enrollment;

      if (enrollmentId) {
        enrollment = await withDbRetry(() =>
          prisma.enrollment.update({
            where: { id: enrollmentId },
            data: {
              status: 'approved',
              approvedAt: new Date(),
              approvedBy: facilitatorName,
            },
            include: {
              user: { select: { id: true, name: true, email: true } },
              course: { select: { id: true, title: true } },
            },
          })
        );
      } else if (userId && courseId) {
        enrollment = await withDbRetry(() =>
          prisma.enrollment.upsert({
            where: {
              userId_courseId: { userId, courseId },
            },
            create: {
              userId,
              courseId,
              status: 'approved',
              approvedAt: new Date(),
              approvedBy: facilitatorName,
            },
            update: {
              status: 'approved',
              approvedAt: new Date(),
              approvedBy: facilitatorName,
            },
            include: {
              user: { select: { id: true, name: true, email: true } },
              course: { select: { id: true, title: true } },
            },
          })
        );
      } else {
        return res.status(400).json({ error: 'Provide either enrollmentId or both userId and courseId.' });
      }

      return res.json({
        message: `Course access approved for ${enrollment.user.name || enrollment.user.email} in ${enrollment.course.title}.`,
        enrollment,
      });
    } catch (error: any) {
      console.error('Error granting access:', error);
      return res.status(500).json({ error: 'Failed to grant course access.' });
    }
  }
);

// POST /api/facilitator/revoke-access - Revoke or reset access
facilitatorRouter.post(
  '/revoke-access',
  authenticateToken,
  requireRole(['instructor', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const { enrollmentId } = req.body;
      if (!enrollmentId) {
        return res.status(400).json({ error: 'enrollmentId is required.' });
      }

      const updated = await withDbRetry(() =>
        prisma.enrollment.update({
          where: { id: enrollmentId },
          data: {
            status: 'pending',
            approvedAt: null,
            approvedBy: null,
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            course: { select: { id: true, title: true } },
          },
        })
      );

      return res.json({
        message: `Access revoked for ${updated.user.name || updated.user.email}. Enrollment is now pending.`,
        enrollment: updated,
      });
    } catch (error: any) {
      console.error('Error revoking access:', error);
      return res.status(500).json({ error: 'Failed to revoke access.' });
    }
  }
);

// POST /api/facilitator/direct-enroll - Directly enroll student with approval
facilitatorRouter.post(
  '/direct-enroll',
  authenticateToken,
  requireRole(['instructor', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const { userId, courseId } = req.body;
      if (!userId || !courseId) {
        return res.status(400).json({ error: 'userId and courseId are required.' });
      }

      const facilitatorName = req.user?.name || 'Terraskills Facilitator';

      const enrollment = await withDbRetry(() =>
        prisma.enrollment.upsert({
          where: {
            userId_courseId: { userId, courseId },
          },
          create: {
            userId,
            courseId,
            status: 'approved',
            approvedAt: new Date(),
            approvedBy: facilitatorName,
          },
          update: {
            status: 'approved',
            approvedAt: new Date(),
            approvedBy: facilitatorName,
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            course: { select: { id: true, title: true } },
          },
        })
      );

      return res.json({
        message: `Student successfully admitted to ${enrollment.course.title}.`,
        enrollment,
      });
    } catch (error: any) {
      console.error('Error in direct enrollment:', error);
      return res.status(500).json({ error: 'Failed to complete direct enrollment.' });
    }
  }
);

