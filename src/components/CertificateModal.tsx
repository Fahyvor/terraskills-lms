import React, { useRef } from 'react';
import { FiX, FiPrinter, FiAward, FiCheckCircle, FiShare2 } from 'react-icons/fi';
import { Course } from '../types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  course: Course;
  certificateId?: string | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  course,
  certificateId,
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const issueDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const certCode = certificateId || `TS-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center space-x-2">
            <FiAward className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">
              Official Accredited Terraskills Certificate
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              <FiPrinter className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div
          ref={certRef}
          className="p-8 sm:p-12 bg-gradient-to-b from-amber-50/20 via-white to-amber-50/20 text-slate-900 border-8 border-double border-amber-600/30 m-4 rounded-xl relative"
        >
          {/* Subtle watermark background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
            <img src="/terraskills-logo.png" alt="" className="w-96 h-auto" />
          </div>

          <div className="relative z-10 text-center space-y-6">
            {/* Terraskills Logo Header */}
            <div className="flex flex-col items-center justify-center">
              <img
                src="/terraskills-logo.png"
                alt="Terraskills Learning Systems"
                className="h-16 w-auto object-contain mb-2"
              />
              <p className="text-[11px] font-extrabold tracking-widest uppercase text-[#004bbb]">
                Terraskills Learning Systems Limited
              </p>
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold">
                Accredited Professional Development & Career Excellence
              </p>
            </div>

            {/* Certificate Title */}
            <div className="pt-2">
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
                Certificate of Professional Completion
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#004bbb] via-amber-500 to-[#e5192d] mx-auto mt-2 rounded-full" />
            </div>

            {/* Recipient */}
            <div className="space-y-1 pt-2">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                This document officially certifies that
              </p>
              <h3 className="text-3xl sm:text-4xl font-bold font-serif text-[#004bbb] py-1 border-b border-slate-300 max-w-lg mx-auto">
                {studentName}
              </h3>
              <p className="text-xs text-slate-500 pt-1">
                has demonstrated exceptional dedication and successfully fulfilled all curricular competencies for
              </p>
            </div>

            {/* Course Title */}
            <div className="py-2">
              <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 max-w-2xl mx-auto leading-snug">
                {course.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Duration: {course.duration} • Curriculum Category: {course.category}
              </p>
            </div>

            {/* Signatures & Seal Row */}
            <div className="pt-8 grid grid-cols-3 items-end gap-6 max-w-2xl mx-auto">
              {/* Instructor Signature */}
              <div className="text-center border-t border-slate-400 pt-2">
                <p className="font-serif italic text-lg text-slate-800 leading-none">
                  {course.instructorName}
                </p>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-1">
                  Lead Faculty Instructor
                </p>
              </div>

              {/* Terraskills Gold Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-0.5 shadow-lg flex items-center justify-center text-white ring-4 ring-amber-100">
                  <div className="w-full h-full rounded-full border border-amber-200 flex flex-col items-center justify-center text-center p-1">
                    <FiAward className="w-6 h-6 text-white" />
                    <span className="text-[7px] font-extrabold uppercase tracking-tighter">Verified</span>
                  </div>
                </div>
              </div>

              {/* Date & Verification */}
              <div className="text-center border-t border-slate-400 pt-2">
                <p className="font-mono text-xs text-slate-800 font-bold">{issueDate}</p>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-1">
                  Issue Date
                </p>
              </div>
            </div>

            {/* Certificate ID footer */}
            <div className="pt-4 text-[10px] text-slate-400 font-mono flex items-center justify-center space-x-2">
              <span>Verification Serial:</span>
              <span className="font-bold text-slate-600">{certCode}</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold flex items-center">
                <FiCheckCircle className="w-3 h-3 mr-0.5" /> Authenticated on Terraskills LMS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

