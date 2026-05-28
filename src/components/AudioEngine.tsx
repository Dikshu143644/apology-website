import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  VolumeX,
  Volume2,
  Download,
  ChevronDown,
  ChevronUp,
  ListMusic,
  Heart,
  Sparkles,
  X,
} from 'lucide-react';
import dikshuPortraitClean from '../assets/images/dikshu_portrait_clean_1779319295919.png';
import listeningSongBg from '../assets/images/Listening-song.png';

const tracks = [
  {
    title: 'Agar Ho Sake Tho',
    src: '/music/Agar-Ho-Sake-tho.mp3',
  },
  {
    title: 'Agar Ho Sake',
    src: '/music/Agar-Ho-Sake.mp3',
  },
  {
    title: 'Forgive Me',
    src: '/music/Forgive-Me.mp3',
  },
];

export default function AudioEngine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [status, setStatus] = useState('Click play to start');
  const [shouldPlay, setShouldPlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const closePlaylist = () => setShowPlaylist(false);
    window.addEventListener('close-music-player', closePlaylist);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('close-music-player', closePlaylist);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.4;
    audio.loop = false;

    const targetSrc = tracks[currentTrackIndex].src;
    const isDifferentTrack =
      audio.src !== window.location.origin + targetSrc &&
      !audio.src.endsWith(targetSrc);

    if (isDifferentTrack) {
      audio.src = targetSrc;
      audio.load();
    }

    let isSubscribed = true;

    if (shouldPlay) {
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (isSubscribed) {
              setIsPlaying(true);
              setStatus(`Now playing: ${tracks[currentTrackIndex].title}`);
            }
          })
          .catch((err) => {
            if (err.name === 'AbortError') return;

            console.error('Audio playback error:', err);

            if (isSubscribed) {
              setStatus('File not found. Check public/music folder.');
              setIsPlaying(false);
              setShouldPlay(false);
            }
          });
      }
    } else {
      audio.pause();
      setIsPlaying(false);
      setStatus('Music paused');
    }

    return () => {
      isSubscribed = false;
    };
  }, [currentTrackIndex, shouldPlay]);

  const togglePlayback = () => {
    setShouldPlay((prev) => !prev);
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setShouldPlay(true);
  };

  const openPlaylist = () => {
    setShowPlaylist((value) => !value);
  };

  const renderPlaylistContent = (isMobileView: boolean) => (
    <>
      <button
        type="button"
        onClick={() => setShowPlaylist(false)}
        className={`absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full border border-pink-300/20 bg-black/40 text-pink-100/80 backdrop-blur-md transition hover:bg-pink-500/20 ${isMobileView ? '' : 'hidden'}`}
        title="Close playlist"
      >
        <X className="h-4 w-4" />
      </button>

      <div
        className="pointer-events-none absolute inset-0 z-0 scale-[1.02] bg-cover bg-center opacity-[0.65]"
        style={{
          backgroundImage: `url(${listeningSongBg})`,
          filter: 'blur(1px) brightness(0.7)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#14021b]/60 via-[#0b0110]/50 to-[#1c0428]/70" />
      <div className="pointer-events-none absolute -right-10 -top-10 z-0 h-32 w-32 animate-pulse rounded-full bg-pink-500/10 blur-2xl" />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            y: [30, -50],
            x: [40, 55],
            opacity: [0, 0.45, 0],
            scale: [0.8, 1.25, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: 5.5,
            ease: 'easeInOut',
          }}
          className="absolute text-xs font-mono text-pink-400/35"
          style={{ bottom: '12%', left: '15%' }}
        >
          ♪
        </motion.div>

        <motion.div
          animate={{
            y: [15, -60],
            x: [240, 215],
            opacity: [0, 0.5, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 6.5,
            delay: 2.2,
            ease: 'easeInOut',
          }}
          className="absolute text-sm font-mono text-fuchsia-300/30"
          style={{ bottom: '18%', left: '55%' }}
        >
          ♫
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            repeat: Infinity,
            duration: 3.2,
            ease: 'easeInOut',
          }}
          className="absolute text-pink-500"
          style={{ top: '12%', right: '12%' }}
        >
          <Heart className="h-4 w-4 fill-pink-500/20" />
        </motion.div>
      </div>

      <div className="relative z-10 mb-4 flex items-center justify-between border-b border-pink-500/20 pb-3 pr-10 sm:pr-0">
        <div className="flex min-w-0 items-center gap-2">
          <ListMusic className="h-4 w-4 shrink-0 animate-pulse text-pink-400" />
          <span className="truncate text-[11px] font-extrabold uppercase tracking-widest text-[#ffd7ed] drop-shadow-[0_0_8px_rgba(236,72,153,0.55)] sm:text-xs">
            Sweet Melody Playlist
          </span>
        </div>
        <Sparkles
          className="hidden h-4 w-4 animate-spin text-pink-300/80 sm:block"
          style={{ animationDuration: '7s' }}
        />
      </div>

      {renderTracksList()}

      <div className="relative z-10 mt-4 flex flex-col gap-2.5 border-t border-pink-500/20 pt-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase leading-none tracking-widest text-pink-300/45">
            Player Status
          </span>

          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
          >
            <Heart className="h-3 w-3 fill-pink-500/40 text-pink-400" />
          </motion.div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-pink-500/15 bg-black/60 px-3 py-2.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
            <span
              className={`absolute h-2 w-2 rounded-full ${
                status.includes('not found')
                  ? 'bg-rose-500'
                  : isPlaying
                    ? 'animate-ping bg-emerald-400'
                    : 'bg-amber-400'
              }`}
            />
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status.includes('not found')
                  ? 'bg-rose-500'
                  : isPlaying
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
              }`}
            />
          </span>

          <span
            className={`truncate text-[10px] font-medium leading-none ${
              status.includes('not found')
                ? 'font-bold text-rose-300'
                : isPlaying
                  ? 'font-semibold text-emerald-300'
                  : 'text-pink-200/70'
            }`}
          >
            {status}
          </span>
        </div>
      </div>
    </>
  );

  const renderTracksList = () => (
    <div className="custom-scrollbar relative z-10 max-h-[48vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[260px]">
      {tracks.map((track, idx) => {
        const isActive = currentTrackIndex === idx;

        return (
          <div
            key={track.src}
            className={`group/item flex min-w-0 items-center justify-between gap-2 rounded-xl border p-2.5 transition-all duration-300 sm:p-3 ${
              isActive
                ? 'border-pink-400/40 bg-pink-500/20 text-white shadow-[0_0_12px_rgba(236,72,153,0.18)]'
                : 'border-white/5 bg-black/25 text-pink-200/60 hover:border-pink-500/20 hover:bg-pink-500/10 hover:text-pink-100'
            }`}
          >
            <button
              type="button"
              onClick={() => handleTrackSelect(idx)}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-0.5 text-left outline-none sm:gap-3"
            >
              <span
                className={`shrink-0 font-mono text-[10px] ${
                  isActive ? 'font-bold text-pink-400' : 'opacity-40'
                }`}
              >
                0{idx + 1}
              </span>

              <span
                className={`block min-w-0 flex-1 truncate text-xs font-semibold tracking-wide ${
                  isActive ? 'font-bold text-pink-100' : ''
                }`}
              >
                {track.title}
              </span>

              {isActive && isPlaying && (
                <span className="flex h-3 w-4 shrink-0 items-end gap-0.5 px-1">
                  <span className="h-2 w-0.5 animate-bounce rounded-full bg-pink-400" />
                  <span
                    className="h-3 w-0.5 animate-bounce rounded-full bg-pink-400"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <span
                    className="h-1.5 w-0.5 animate-bounce rounded-full bg-pink-400"
                    style={{ animationDelay: '0.3s' }}
                  />
                </span>
              )}
            </button>

            <a
              href={track.src}
              download={`${track.title}.mp3`}
              className="ml-1 grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-xl border border-pink-500/15 bg-pink-500/10 text-pink-300 transition-all hover:scale-105 hover:border-pink-500/40 hover:bg-pink-500/35 hover:text-white sm:ml-2"
              title={`Download ${track.title}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative inline-block text-left z-40" id="musicPlayerWrapper">
      <audio
        ref={audioRef}
        preload="auto"
        loop
        onPlay={() => {
          setIsPlaying(true);
          setStatus(`Now playing: ${tracks[currentTrackIndex].title}`);
        }}
        onPause={() => {
          setIsPlaying(false);
          if (status !== 'File not found. Check public/music folder.') {
            setStatus('Music paused');
          }
        }}
        onEnded={() => {
          const nextIndex = (currentTrackIndex + 1) % tracks.length;
          setCurrentTrackIndex(nextIndex);
          setShouldPlay(true);
        }}
        onError={() => {
          if (shouldPlay) {
            setStatus('File not found. Check public/music folder.');
            setIsPlaying(false);
            setShouldPlay(false);
          }
        }}
      />

      <div className="relative z-10 flex items-center gap-1.5">
        <button
          id="musicToggle"
          onClick={togglePlayback}
          className={`relative flex cursor-pointer items-center gap-2 rounded-full border border-pink-500/20 p-2 px-3.5 backdrop-blur-md transition-all duration-300 group sm:px-4 ${
            isPlaying
              ? 'border-pink-400 bg-pink-500/20 text-pink-300 shadow-lg shadow-pink-500/30'
              : 'bg-white/5 text-pink-200/70 hover:bg-white/10 hover:text-white'
          }`}
          title={isPlaying ? 'Pause music' : 'Play Melody'}
        >
          {isPlaying ? (
            <>
              <Volume2 className="h-4 w-4 animate-pulse" />
              <span className="hidden text-[11px] font-mono font-medium uppercase tracking-wider text-pink-300 sm:inline">
                Playing
              </span>
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-pink-300 sm:hidden">
                Play
              </span>
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4" />
              <span className="hidden text-[11px] font-mono font-medium uppercase tracking-wider text-pink-200/50 sm:inline">
                Play Melody
              </span>
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-pink-200/50 sm:hidden">
                Play
              </span>
            </>
          )}
        </button>

        <button
          onClick={openPlaylist}
          className={`cursor-pointer rounded-full border border-pink-500/20 p-2 backdrop-blur-md transition-all duration-300 ${
            showPlaylist
              ? 'border-pink-400 bg-pink-500/30 text-pink-300 shadow-lg shadow-pink-500/20'
              : 'bg-white/5 text-pink-200/70 hover:bg-white/10 hover:text-white'
          }`}
          title="Show Playlist"
        >
          {showPlaylist ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Desktop playlist — rendered inline below the navbar */}
      <AnimatePresence>
        {showPlaylist && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed right-5 top-20 z-[9999] w-[350px] overflow-hidden rounded-[28px] border border-pink-500/30 bg-[#0e0314]/95 p-5 shadow-2xl shadow-pink-500/25 backdrop-blur-3xl"
          >
            {renderPlaylistContent(false)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile playlist — rendered via portal to document.body */}
      {isMounted && isMobile && createPortal(
        <AnimatePresence>
          {showPlaylist && (
            <>
              <motion.div
                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPlaylist(false)}
              />
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, y: 18, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 18, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="pointer-events-auto relative w-full max-w-[365px] max-h-[82vh] overflow-hidden flex flex-col rounded-[28px] border border-pink-500/30 bg-[#0e0314]/95 p-4 shadow-2xl shadow-pink-500/25 backdrop-blur-3xl"
                >
                  {renderPlaylistContent(true)}
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
