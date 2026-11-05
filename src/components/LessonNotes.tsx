import React, { useState, useEffect } from 'react';
import { FiEdit3, FiTrash2, FiClock, FiPlus, FiSave } from 'react-icons/fi';
import { toast } from 'sleek-toast';
import { Note } from '../types';
import { useAppSelector } from '../store';

interface LessonNotesProps {
  lessonId: string;
}

export const LessonNotes: React.FC<LessonNotesProps> = ({ lessonId }) => {
  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token || !lessonId) return;

    setIsLoading(true);
    fetch(`/api/notes/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.notes) setNotes(data.notes);
      })
      .catch((err) => console.error('Failed to load notes', err))
      .finally(() => setIsLoading(false));
  }, [lessonId, token, isAuthenticated]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !token) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId,
          content: newNoteContent.trim(),
          timestampSeconds: 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.note) {
        setNotes((prev) => [...prev, data.note]);
        setNewNoteContent('');
        toast.success('Study note saved!');
      } else {
        toast.error(data.error || 'Failed to save note');
      }
    } catch (err) {
      toast.error('Network error saving note');
      console.error('Error creating note', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        toast.info('Study note removed');
      }
    } catch (err) {
      console.error('Error deleting note', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <FiEdit3 className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Personal Notebook
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Please sign in to take private study notes and bookmarks on this lesson.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create note form */}
      <form onSubmit={handleAddNote} className="space-y-2">
        <textarea
          rows={3}
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Capture key concepts, questions, or code snippets from this lecture..."
          className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 resize-none transition-all"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newNoteContent.trim() || isSaving}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] disabled:opacity-50 transition-all cursor-pointer"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Add Study Note'}</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-2.5">
        {notes.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4 italic">
            No notes added yet for this lesson.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-start justify-between group"
            >
              <div className="space-y-1 pr-2">
                <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-normal">
                  {note.content}
                </p>
                <p className="text-[10px] text-slate-400">
                  {new Date(note.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <button
                onClick={() => handleDeleteNote(note.id)}
                title="Delete note"
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

