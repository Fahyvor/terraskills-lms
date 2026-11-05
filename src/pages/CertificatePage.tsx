import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiAward,
  FiPrinter,
  FiShare2,
  FiCheckCircle,
  FiArrowLeft,
  FiAlertCircle,
  FiExternalLink,
} from 'react-icons/fi';
import { toast } from 'sleek-toast';

interface CertificateData {
  certificateId: string;
  studentName: string;
  course: {
    id: string;
    title: string;
    slug: string;
    category: string;
    level: string;
    duration: string;
    instructorName: string;
    instructorTitle?: string;
  };
  completedAt: string;
}

export const CertificatePage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [data, setData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!certificateId) return;

    setIsLoading(true);
    fetch(`/api/progress/certificate/${certificateId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Certificate record not found or invalid.');
        return res.json();
      })
      .then((cert) => {
        setData(cert);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Certificate link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#004bbb] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">
          Verifying Terraskills Credential Registry...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <FiAlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Certificate Not Found
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The certificate ID <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{certificateId}</span> could not be verified in the Terraskills registry.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(data.completedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top action header (hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs print:hidden">
        <div className="flex items-center space-x-3">
          <Link
            to={`/courses/${data.course.slug}`}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <FiCheckCircle className="w-3.5 h-3.5 mr-1" />
                Verified Credential
              </span>
              <span className="text-xs text-slate-400 font-mono">
                #{data.certificateId}
              </span>
            </div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white">
              Official Accredited Terraskills Certificate
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <FiShare2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied URL!' : 'Share'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#004bbb] hover:bg-[#083eb3] text-white shadow-sm transition-all cursor-pointer"
          >
            <FiPrinter className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Accredited Certificate Card */}
      <div
        ref={certRef}
        className="bg-white rounded-3xl border-8 border-double border-amber-600/30 p-8 sm:p-14 shadow-2xl relative overflow-hidden text-slate-900"
      >
        {/* Subtle Watermark background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
          <img src="/terraskills-logo.png" alt="" className="w-96 h-auto" />
        </div>

        <div className="relative z-10 text-center space-y-6">
          {/* Terraskills Header */}
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
              This officially certifies that
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#004bbb] tracking-tight">
              {data.studentName}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto pt-1 leading-relaxed">
              has rigorously completed the accredited Terraskills curriculum system, achieving 100% mastery of all competency modules, video demonstrations, and practical assessments.
            </p>
          </div>

          {/* Program Details */}
          <div className="py-4 my-2 border-y border-amber-200/60 max-w-md mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {data.course.category}
            </span>
            <h4 className="text-lg font-bold text-slate-900 mt-1">
              {data.course.title}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Curriculum Duration: {data.course.duration}
            </p>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-4 grid grid-cols-3 items-end w-full mx-auto gap-4">
            {/* Faculty signature */}
            <div className="text-center space-y-1">
              <div className="font-serif italic text-lg text-slate-700 border-b border-slate-300 pb-1">
                {data.course.instructorName}
              </div>
              <p className="text-[10px] font-bold text-slate-700">Lead Faculty Mentor</p>
              <p className="text-[9px] text-slate-400">Terraskills Systems</p>
            </div>

            {/* Official Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500/40 bg-amber-50 flex items-center justify-center shadow-inner">
                <FiAward className="w-8 h-8 text-amber-600" />
              </div>
              <span className="text-[8px] font-bold tracking-widest text-amber-800 uppercase mt-1">
                Accredited Seal
              </span>
            </div>

            {/* Registrar Signature */}
            <div className="text-center space-y-1">
              <div className="font-serif italic text-lg text-slate-700 border-b border-slate-300 pb-1">
                A. Babatunde
              </div>
              <p className="text-[10px] font-bold text-slate-700">Dean of Academic Systems</p>
              <p className="text-[9px] text-slate-400">Issued: {formattedDate}</p>
            </div>
          </div>

          {/* Certificate Code */}
          <div className="pt-4 text-center">
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              Credential Serial: {data.certificateId} • Verified at terraskills.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

