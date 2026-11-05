import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken } from '../middleware/auth.js';

export const notesRouter = Router();

// GET notes for a lesson
notesRouter.get('/:lessonId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const lessonId = String(req.params.lessonId);
    const userId = req.user!.id;

    const notes = await prisma.note.findMany({
      where: { userId, lessonId },
      orderBy: { timestampSeconds: 'asc' },
    });

    return res.json({ notes });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve notes.' });
  }
});

// POST create note
notesRouter.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { lessonId, content, timestampSeconds } = req.body;
    const userId = req.user!.id;

    if (!lessonId || !content || !content.trim()) {
      return res.status(400).json({ error: 'Lesson ID and note content are required.' });
    }

    const note = await prisma.note.create({
      data: {
        userId,
        lessonId: String(lessonId),
        content: content.trim(),
        timestampSeconds: Number(timestampSeconds || 0),
      },
    });

    return res.status(201).json({ note });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to save note.' });
  }
});

// DELETE note
notesRouter.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== userId) {
      return res.status(404).json({ error: 'Note not found or unauthorized.' });
    }

    await prisma.note.delete({ where: { id } });
    return res.json({ message: 'Note deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete note.' });
  }
});
