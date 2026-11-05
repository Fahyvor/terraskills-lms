import React, { useRef, useState, useEffect } from 'react';
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiRotateCcw,
  FiCheckCircle,
  FiYoutube,
  FiUploadCloud,
} from 'react-icons/fi';
import { Lesson } from '../types';

interface VideoPlayerProps {
  lesson: Lesson;
  onLessonComplete?: () => void;
  isCompleted?: boolean;
}

// Helper to detect genuine YouTube URLs
function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return true;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(trimmed);
}

// Helper to extract clean YouTube Video ID
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // If user passed a bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lesson,
  onLessonComplete,
  isCompleted,
}) => {
  const isYouTube = lesson.videoType === 'youtube' && isYouTubeUrl(lesson.videoUrl);
  const youtubeId = isYouTube ? extractYouTubeId(lesson.videoUrl) : null;

  // State for HTML5 native video player (when uploaded video is used)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);

  // Reset states on lesson change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [lesson.id]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // Auto mark complete when user watches 90% of local video
    if (
      videoRef.current.duration > 0 &&
      videoRef.current.currentTime / videoRef.current.duration >= 0.9 &&
      !isCompleted &&
      onLessonComplete
    ) {
      onLessonComplete();
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      {/* 16:9 Aspect Ratio Container */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {isYouTube ? (
          youtubeId ? (
            <iframe
              key={youtubeId}
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <div className="text-center p-8 text-slate-400">
              <FiYoutube className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <p className="font-semibold text-slate-200">YouTube Video Preview</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Invalid or unparsed YouTube URL ({lesson.videoUrl}). Please verify link in lesson settings.
              </p>
            </div>
          )
        ) : (
          /* HTML5 Video Player for uploaded files */
          <div
            className="relative w-full h-full group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              ref={videoRef}
              src={lesson.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => {
                setIsPlaying(false);
                if (onLessonComplete && !isCompleted) onLessonComplete();
              }}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Custom Video Controls Overlay */}
            <div
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-200 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Progress Scrubber */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#004bbb] mb-3"
              />

              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    {isPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <FiVolumeX className="w-4 h-4 text-slate-400" />
                      ) : (
                        <FiVolume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setVolume(val);
                        setIsMuted(val === 0);
                        if (videoRef.current) {
                          videoRef.current.volume = val;
                          videoRef.current.muted = val === 0;
                        }
                      }}
                      className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  <span className="text-[11px] text-slate-300 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Playback speed buttons */}
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                        playbackRate === rate
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}

                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <FiMaximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Source Badge & Info Strip */}
      <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          {isYouTube ? (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60 font-semibold text-[10px]">
              <FiYoutube className="w-3.5 h-3.5 text-red-500" />
              <span>YouTube Video Lecture</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60 font-semibold text-[10px]">
              <FiUploadCloud className="w-3.5 h-3.5 text-blue-400" />
              <span>Uploaded Media File</span>
            </span>
          )}
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-medium">Duration: {lesson.duration}</span>
        </div>

        {isCompleted && (
          <div className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
            <FiCheckCircle className="w-3.5 h-3.5" />
            <span>Marked Complete</span>
          </div>
        )}
      </div>
    </div>
  );
};

