"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { updateLessonProgress } from "@/actions/progress";
import { Button } from "@/components/ui/button";
import { WATCH_COMPLETION_THRESHOLD } from "@/lib/progress/calculate";
import { cn, formatPosition } from "@/lib/utils";

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5];

export interface VideoPlayerProps {
  lessonId: string;
  videoUrl: string | null;
  videoProvider?: string | null;
  captionsUrl?: string | null;
  durationSeconds: number;
  lastPosition?: number;
  completed?: boolean;
  lessonTitle?: string;
  courseTitle?: string;
  className?: string;
  onWatchThresholdReached?: () => void;
}

function isEmbedUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("youtube.com/embed") ||
    lower.includes("youtube.com/watch") ||
    lower.includes("youtu.be/") ||
    lower.includes("player.vimeo.com") ||
    lower.includes("vimeo.com/")
  );
}

function isDirectVideoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg") ||
    lower.includes(".mp4?") ||
    lower.includes(".webm?")
  );
}

function isPlayableVideo(
  videoUrl: string | null,
  videoProvider?: string | null,
): boolean {
  if (!videoUrl || videoProvider === "placeholder") {
    return false;
  }

  return isEmbedUrl(videoUrl) || isDirectVideoUrl(videoUrl);
}

function normalizeEmbedUrl(url: string): string {
  if (url.includes("youtube.com/watch")) {
    const match = url.match(/[?&]v=([^&]+)/);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    if (id) {
      return `https://www.youtube.com/embed/${id}`;
    }
  }

  if (url.includes("vimeo.com/") && !url.includes("player.vimeo.com")) {
    const id = url.split("vimeo.com/")[1]?.split(/[?&]/)[0];
    if (id && !id.includes("/")) {
      return `https://player.vimeo.com/video/${id}`;
    }
  }

  return url;
}

function VideoPlaceholder({
  lessonTitle,
  courseTitle,
  className,
}: {
  lessonTitle?: string;
  courseTitle?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-navy",
        className,
      )}
      role="region"
      aria-label="Lesson video placeholder"
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-navy"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Maxpro Academy
        </p>

        {(courseTitle || lessonTitle) && (
          <div className="mt-3 max-w-md space-y-1">
            {courseTitle && (
              <p className="text-xs font-medium text-white/60">{courseTitle}</p>
            )}
            {lessonTitle && (
              <p className="text-sm font-semibold text-white">{lessonTitle}</p>
            )}
          </div>
        )}

        <div
          className="mt-5 flex size-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
          aria-hidden="true"
        >
          <Play className="ml-1 size-7 text-white/90" />
        </div>

        <p className="mt-4 text-sm font-medium text-white/90">Training video</p>
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-white/55">
          Video will appear here when this lesson is published.
        </p>
      </div>
    </div>
  );
}

export function VideoPlayer({
  lessonId,
  videoUrl,
  videoProvider,
  captionsUrl,
  durationSeconds,
  lastPosition = 0,
  completed = false,
  lessonTitle,
  courseTitle,
  className,
  onWatchThresholdReached,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thresholdNotifiedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showResumeBanner, setShowResumeBanner] = useState(
    lastPosition > 0 && !completed,
  );
  const [showCompleteSuggestion, setShowCompleteSuggestion] = useState(false);

  const hasVideo = isPlayableVideo(videoUrl, videoProvider);
  const embedUrl =
    hasVideo && videoUrl && isEmbedUrl(videoUrl)
      ? normalizeEmbedUrl(videoUrl)
      : null;
  const directUrl =
    hasVideo && videoUrl && !embedUrl && isDirectVideoUrl(videoUrl)
      ? videoUrl
      : null;

  const saveProgress = useCallback(
    (position: number, watched: number) => {
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }

      progressTimerRef.current = setTimeout(() => {
        void updateLessonProgress({
          lessonId,
          lastPosition: position,
          watchedSeconds: watched,
        });
      }, 1500);
    },
    [lessonId],
  );

  const checkWatchThreshold = useCallback(
    (watched: number, total: number) => {
      if (thresholdNotifiedRef.current || completed) return;

      const threshold = total > 0 ? (watched / total) * 100 : 0;
      if (threshold >= WATCH_COMPLETION_THRESHOLD) {
        thresholdNotifiedRef.current = true;
        setShowCompleteSuggestion(true);
        onWatchThresholdReached?.();
      }
    },
    [completed, onWatchThresholdReached],
  );

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    setDuration(video.duration || durationSeconds);
    saveProgress(video.currentTime, Math.floor(video.currentTime));
    checkWatchThreshold(video.currentTime, video.duration || durationSeconds);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value;
    setCurrentTime(value);
    saveProgress(value, Math.floor(value));
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = value;
    setVolume(value);
    setMuted(value === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
  };

  const cyclePlaybackRate = () => {
    const video = videoRef.current;
    if (!video) return;

    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextRate =
      PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
    video.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const toggleFullscreen = async () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await container.requestFullscreen();
    }
  };

  const resumeFromLastPosition = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = lastPosition;
    setCurrentTime(lastPosition);
    setShowResumeBanner(false);
    void video.play();
    setIsPlaying(true);
  };

  const startFromBeginning = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setCurrentTime(0);
    setShowResumeBanner(false);
    void video.play();
    setIsPlaying(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !directUrl) return;

    switch (event.key) {
      case " ":
      case "k":
        event.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        event.preventDefault();
        handleSeek(Math.min(duration, currentTime + 5));
        break;
      case "ArrowLeft":
        event.preventDefault();
        handleSeek(Math.max(0, currentTime - 5));
        break;
      case "m":
        event.preventDefault();
        toggleMute();
        break;
      case "f":
        event.preventDefault();
        void toggleFullscreen();
        break;
      default:
        break;
    }
  };

  if (!hasVideo) {
    return (
      <VideoPlaceholder
        lessonTitle={lessonTitle}
        courseTitle={courseTitle}
        className={className}
      />
    );
  }

  if (embedUrl) {
    return (
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black",
          className,
        )}
        role="region"
        aria-label="Lesson video"
      >
        <iframe
          src={embedUrl}
          title={lessonTitle ?? "Lesson video"}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="group relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black"
        role="region"
        aria-label="Lesson video player"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <video
          ref={videoRef}
          src={directUrl!}
          className="size-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            const video = videoRef.current;
            if (video) {
              setDuration(video.duration || durationSeconds);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            checkWatchThreshold(duration, duration);
            saveProgress(duration, Math.floor(duration));
          }}
          playsInline
        >
          {captionsUrl && (
            <track kind="captions" src={captionsUrl} label="Captions" default />
          )}
        </video>

        {showResumeBanner && (
          <div
            className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-center justify-between gap-2 bg-navy/90 px-4 py-2 text-sm text-navy-foreground"
            role="status"
          >
            <span>Resume from {formatPosition(lastPosition)}?</span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={resumeFromLastPosition}
              >
                Resume
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-navy-foreground hover:bg-white/10"
                onClick={startFromBeginning}
              >
                Start from beginning
              </Button>
            </div>
          </div>
        )}

        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
        >
          <input
            type="range"
            min={0}
            max={duration || durationSeconds}
            step={0.1}
            value={currentTime}
            onChange={(event) => handleSeek(Number(event.target.value))}
            aria-label="Video timeline"
            className="mb-2 w-full accent-primary"
          />

          <div className="flex items-center gap-2 text-white">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="rounded-md p-1.5 hover:bg-white/10 focus-ring"
            >
              {isPlaying ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
            </button>

            <span className="min-w-[4.5rem] text-xs tabular-nums">
              {formatPosition(currentTime)} / {formatPosition(duration || durationSeconds)}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                className="rounded-md p-1.5 hover:bg-white/10 focus-ring"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="size-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="size-4" aria-hidden="true" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(event) =>
                  handleVolumeChange(Number(event.target.value))
                }
                aria-label="Volume"
                className="hidden w-20 accent-primary sm:block"
              />

              <button
                type="button"
                onClick={cyclePlaybackRate}
                aria-label={`Playback speed ${playbackRate}x`}
                className="rounded-md px-2 py-1 text-xs font-medium hover:bg-white/10 focus-ring"
              >
                {playbackRate}x
              </button>

              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                aria-label="Fullscreen"
                className="rounded-md p-1.5 hover:bg-white/10 focus-ring"
              >
                <Maximize className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCompleteSuggestion && !completed && (
        <div
          className="rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          You&apos;ve watched most of this lesson. Consider marking it complete
          when you&apos;re ready.
        </div>
      )}
    </div>
  );
}
