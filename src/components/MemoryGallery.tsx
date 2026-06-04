import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronLeft, ChevronRight, 
  Sparkles, Heart, Eye, Grid, LayoutDashboard, 
  RefreshCw, Move, Info, HelpCircle,
  Play, Pause, Film, Video, Globe, BookOpen, ExternalLink
} from 'lucide-react';
import albumAccessBg from '../assets/images/optimized/Only-You-Have-My-Access.webp';

type GalleryTab = 'photos' | 'videos' | 'google-photos';

interface MemoryItem {
  src: string;
  cap: string;
  desc: string;
  date?: string;
  type?: 'image' | 'video';
  poster?: string;
  objectPosition?: string;
}

interface MemoryGalleryProps {
  initialTab?: GalleryTab;
  onPhotoClick?: (src: string) => void;
}

interface GooglePhotosAlbum {
  id?: string;
  label: string;
  description?: string;
  url: string;
}

const DEFAULT_GOOGLE_PHOTOS_ALBUMS: GooglePhotosAlbum[] = [
  {
    id: 'album-main',
    label: 'Memory Album',
    description: 'Our saved photos',
    url: 'https://photos.app.goo.gl/tzRAJ8o9uzezd64g8'
  },
  {
    id: 'album-extra',
    label: 'More Memories',
    description: 'Another shared album',
    url: 'https://photos.app.goo.gl/B3Y6wpJCWPKFuPXo6'
  }
];

const IMAGE_AUTOPLAY_MS = 6000;
const AUTOPLAY_STEP_MS = 50;

export default function MemoryGallery({ initialTab = 'photos', onPhotoClick }: MemoryGalleryProps) {
  const [layoutMode, setLayoutMode] = useState<'board' | 'grid'>('board');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; val: string }[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [scatterOffset, setScatterOffset] = useState<number>(0);
  const [showHelp, setShowHelp] = useState<boolean>(true);

  // States for tab switching (Columns) and Google Photos Links
  const [activeTab, setActiveTab] = useState<GalleryTab>(initialTab);
  const [googlePhotosAlbums, setGooglePhotosAlbums] = useState<GooglePhotosAlbum[]>(DEFAULT_GOOGLE_PHOTOS_ALBUMS);

  useEffect(() => {
    setActiveTab(initialTab);
    setSelectedIdx(null);
  }, [initialTab]);

  useEffect(() => {
    // Pull the direct Google Photos link from site settings
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/public');
        const data = await res.json();
        if (res.ok && data.success) {
          const albums = Array.isArray(data.googlePhotosLinks)
            ? data.googlePhotosLinks.filter((album: GooglePhotosAlbum) => album?.label && album?.url)
            : [];

          if (albums.length > 0) {
            setGooglePhotosAlbums(albums);
          } else if (data.googlePhotosUrl) {
            setGooglePhotosAlbums([
              {
                id: 'album-main',
                label: 'Memory Album',
                description: 'Our saved photos',
                url: data.googlePhotosUrl
              },
              DEFAULT_GOOGLE_PHOTOS_ALBUMS[1]
            ]);
          }
        }
      } catch (err) {
        console.error('Error fetching public Settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // States for automatic slideshow and device responsive tracking
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  const [autoplayProgress, setAutoplayProgress] = useState<number>(0);

  const boardRef = useRef<HTMLDivElement>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Active device screen responsiveness check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Our real photos
  const memories: MemoryItem[] = [
    {
      src: '/image/optimized/memory-1.webp',
      cap: 'Mehndi Glow',
      desc: 'A festive frame where your shy smile hides behind mehndi, light, and quiet beauty.',
      date: 'Festive Glow',
      type: 'image'
    },
    {
      src: '/image/optimized/memory-2.webp',
      cap: 'Pink Floral Calm',
      desc: 'That gentle look in pink feels peaceful, soft, and impossible for my heart to forget.',
      date: 'Soft Portrait',
      type: 'image'
    },
    {
      src: '/image/optimized/memory-3.webp',
      cap: 'Flower Frame Smile',
      desc: 'A sweet flower-framed memory carrying the innocent charm that still stays close.',
      date: 'Flower Memory',
      type: 'image'
    },
    {
      src: '/image/optimized/memory-4.webp',
      cap: 'Shy Festive Spark',
      desc: 'Your hand, your earrings, and that hidden smile turn this into pure festive grace.',
      date: 'Shy Glow',
      type: 'image'
    },
    {
      src: '/image/optimized/memory-5.webp',
      cap: 'Red Dress Radiance',
      desc: 'The red outfit and glowing lights make this feel like a memory from a dream.',
      date: 'Radiant Day',
      type: 'image'
    },
    {
      src: '/image/optimized/memory-11.webp',
      cap: 'Polaroid Pink',
      desc: 'A framed pink memory, like a page saved carefully because it still means something.',
      date: 'Polaroid',
      type: 'image',
      objectPosition: '50% 50%'
    },
    {
      src: '/image/optimized/memory-12.webp',
      cap: 'Peach Saree Quietness',
      desc: 'A peaceful seated moment in soft peach, simple, graceful, and full of quiet emotion.',
      date: 'Gentle Grace',
      type: 'image',
      objectPosition: '48% 34%'
    },
    {
      src: '/image/optimized/memory-8.webp',
      cap: 'Evening Table Glow',
      desc: 'A quiet seated moment with warm lights, deep eyes, and a presence that feels real.',
      date: 'Warm Evening',
      type: 'image'
    },
    {
      src: '/image/optimized/memory-9.webp',
      cap: 'School Trip Memory',
      desc: 'A happy school-day group frame with the innocence that time can never bring back.',
      date: 'School Days',
      type: 'image'
    },
    {
      src: '/image/optimized/memory-10.webp',
      cap: 'Yellow Flower Softness',
      desc: 'A soft old frame with a flower by your hair, blurred yet still precious.',
      date: 'Soft Memory',
      type: 'image'
    },
    {
      src: '/image/optimized/memory-20.webp',
      cap: 'Crowned Innocence',
      desc: 'A childhood-style portrait with a tiny crown sparkle, sweet enough to make time pause.',
      date: 'Childhood Glow',
      type: 'image'
    },
  ];

  // Our real video files
  const videoMemories: MemoryItem[] = [
    {
      src: '/video/VID-M-1.mp4',
      poster: '/image/video-thumb-1.jpg',
      cap: 'Night Light Glimpse',
      desc: 'A short moving moment under bright lights, simple but alive with familiar innocence.',
      date: '3 sec clip',
      type: 'video'
    },
    {
      src: '/video/VID-M-2.mp4',
      poster: '/image/video-thumb-2.jpg',
      cap: 'Shy Smile Clip',
      desc: 'A playful black-and-white memory where the hidden smile says more than words.',
      date: '13 sec clip',
      type: 'video'
    },
    {
      src: '/video/VID-M-3.mp4',
      poster: '/image/video-thumb-3.jpg',
      cap: 'School Walk Memory',
      desc: 'A quick school-day step through a quiet place, carrying the feeling of growing up.',
      date: '4 sec clip',
      type: 'video'
    },
    {
      src: '/video/VID-M-4.mp4',
      poster: '/image/video-thumb-4.jpg',
      cap: 'Garden Flower Moment',
      desc: 'A calm outdoor clip with soft colors, flowers, and an everyday beauty that stays.',
      date: '20 sec clip',
      type: 'video'
    },
    {
      src: '/video/VID-M-5.mp4',
      poster: '/image/video-thumb-5.jpg',
      cap: 'Friday Resting Clip',
      desc: 'A casual peaceful frame from an ordinary day that still feels personal and close.',
      date: '25 sec clip',
      type: 'video'
    },
    {
      src: '/video/VID-M-6.mp4',
      poster: '/image/video-thumb-6.jpg',
      cap: 'Chat Memories',
      desc: 'A screen full of little saved conversations, proof that small messages can hold a story.',
      date: '32 sec clip',
      type: 'video'
    },
    {
      src: '/video/VID-M-7.mp4',
      poster: '/image/video-thumb-7.jpg',
      cap: 'Forest Music Memory',
      desc: 'A quiet clip wrapped in nature and music, like a memory replaying softly in the heart.',
      date: '31 sec clip',
      type: 'video'
    },
    {
      src: '/video/VID-M-8.mp4',
      poster: '/image/video-thumb-8.jpg',
      cap: 'Sparkle Edit',
      desc: 'A bright edited moment full of lights and joy, made to feel like celebration around one smile.',
      date: '33 sec clip',
      type: 'video'
    },
    {
      src: '/video/VID-M-9.mp4',
      poster: '/image/video-thumb-9.jpg',
      cap: 'Saved Phone Moment',
      desc: 'A phone-screen memory, small on the display but heavy with feeling in the heart.',
      date: '29 sec clip',
      type: 'video'
    },
    {
      src: '/video/VID-M-10.mp4',
      poster: '/image/video-thumb-10.jpg',
      cap: 'Travel Innocence',
      desc: 'A short travel clip with a calm childhood look, simple and quietly unforgettable.',
      date: '6 sec clip',
      type: 'video'
    }
  ];

  // Coordinates designed for responsive beautiful distribution
  const boardPositions = [
    { desktop: { x: "3%", y: "4%" }, mobile: { x: "4%", y: "1%" }, rotate: -5, bobDur: 6 },
    { desktop: { x: "35%", y: "2%" }, mobile: { x: "50%", y: "2%" }, rotate: 4, bobDur: 5.4 },
    { desktop: { x: "68%", y: "5%" }, mobile: { x: "3%", y: "30%" }, rotate: -7, bobDur: 7 },
    { desktop: { x: "5%", y: "34%" }, mobile: { x: "51%", y: "28%" }, rotate: 6, bobDur: 4.8 },
    { desktop: { x: "36%", y: "36%" }, mobile: { x: "4%", y: "60%" }, rotate: -4, bobDur: 6.2 },
    { desktop: { x: "67%", y: "38%" }, mobile: { x: "50%", y: "58%" }, rotate: 8, bobDur: 5.2 },
    { desktop: { x: "19%", y: "17%" }, mobile: { x: "2%", y: "90%" }, rotate: 3, bobDur: 6.8 },
    { desktop: { x: "52%", y: "16%" }, mobile: { x: "51%", y: "88%" }, rotate: -8, bobDur: 5.9 },
    { desktop: { x: "11%", y: "65%" }, mobile: { x: "3%", y: "120%" }, rotate: -3, bobDur: 6.4 },
    { desktop: { x: "45%", y: "62%" }, mobile: { x: "50%", y: "118%" }, rotate: 9, bobDur: 5.1 },
  ];

  const getBoardPosition = (idx: number) => {
    const base = boardPositions[idx % boardPositions.length];

    if (idx < boardPositions.length) {
      return base;
    }

    const extraIdx = idx - boardPositions.length;
    return {
      desktop: {
        x: `${16 + (extraIdx % 4) * 20}%`,
        y: `${22 + (extraIdx % 3) * 18}%`,
      },
      mobile: {
        x: extraIdx % 2 === 0 ? "4%" : "50%",
        y: `${148 + extraIdx * 28}%`,
      },
      rotate: base.rotate + (extraIdx % 2 === 0 ? 5 : -5),
      bobDur: base.bobDur + 0.4,
    };
  };

  // Floating hearts/sparkles generator for Lightbox
  const triggerSparkle = (x: number, y: number) => {
    const symbols = ['💖', '✨', '🌸', '💝', '⭐', '🎈'];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const id = Date.now() + Math.random();
    setSparkles((prev) => [...prev, { id, x, y, val: randomSymbol }]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== id));
    }, 2000);
  };

  const goToNextLightboxItem = () => {
    const activeItems = activeTab === 'videos' ? videoMemories : memories;
    setSelectedIdx((current) => (current !== null ? (current + 1) % activeItems.length : 0));
    setAutoplayProgress(0);
  };

  const handleLightboxVideoLoaded = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    setAutoplayProgress(0);

    if (isAutoplay) {
      video.currentTime = 0;
      video.play().catch(() => {
        // Browser autoplay rules can still block playback until the visitor taps play.
      });
    }
  };

  const handleLightboxVideoTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;

    if (duration > 0) {
      setAutoplayProgress(Math.min(100, (video.currentTime / duration) * 100));
    }
  };

  const handleLightboxVideoEnded = () => {
    setAutoplayProgress(100);
    if (isAutoplay) {
      goToNextLightboxItem();
    }
  };

  useEffect(() => {
    if (selectedIdx === null || activeTab !== 'videos') return;

    const video = lightboxVideoRef.current;
    if (!video) return;

    if (isAutoplay) {
      if (video.ended && Number.isFinite(video.duration)) {
        video.currentTime = 0;
      }
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isAutoplay, selectedIdx, activeTab]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      const items = activeTab === 'videos' ? videoMemories : memories;
      if (e.key === 'ArrowRight') {
        setSelectedIdx((prev) => (prev !== null ? (prev + 1) % items.length : 0));
        setAutoplayProgress(0); // Reset timer on manual action
      } else if (e.key === 'ArrowLeft') {
        setSelectedIdx((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : 0));
        setAutoplayProgress(0); // Reset timer on manual action
      } else if (e.key === 'Escape') {
        setSelectedIdx(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, activeTab]);

  // Autoplay progression loops inside LigthBox presentation mode
  useEffect(() => {
    if (!isAutoplay || selectedIdx === null) {
      setAutoplayProgress(0);
      return;
    }

    const activeItems = activeTab === 'videos' ? videoMemories : memories;
    const currentItem = activeItems[selectedIdx];

    if (currentItem?.type === 'video') {
      return;
    }

    const totalTicks = IMAGE_AUTOPLAY_MS / AUTOPLAY_STEP_MS;
    const increment = 100 / totalTicks;

    const timer = setInterval(() => {
      setAutoplayProgress((prev) => {
        if (prev >= 100) {
          goToNextLightboxItem();
          return 0;
        }
        return prev + increment;
      });
    }, AUTOPLAY_STEP_MS);

    return () => clearInterval(timer);
  }, [isAutoplay, selectedIdx, activeTab]);

  // Handle Touch Gesture Swipes on Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffSelected = touchStartX.current - touchEndX;
    const activeItems = activeTab === 'videos' ? videoMemories : memories;

    if (diffSelected > 55) {
      // Swiped Left -> Load Next Memory
      setSelectedIdx((prev) => (prev !== null ? (prev + 1) % activeItems.length : 0));
      setAutoplayProgress(0);
    } else if (diffSelected < -55) {
      // Swiped Right -> Load Previous Memory
      setSelectedIdx((prev) => (prev !== null ? (prev - 1 + activeItems.length) % activeItems.length : 0));
      setAutoplayProgress(0);
    }
    touchStartX.current = null;
  };

  const handleScramble = () => {
    setScatterOffset((prev) => prev + 10);
  };

  return (
    <div className="relative flex flex-col w-full h-full min-h-[580px] bg-black/45 rounded-3xl border border-white/5 overflow-hidden text-center justify-between">
      
      {/* 2-Tier Header control bar */}
      <div className="relative z-40 bg-gradient-to-b from-black/90 to-transparent p-4 sm:p-6 pb-2 space-y-4">
        
        {/* Navigation Category columns (Tabs) */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-full border border-pink-200/15 bg-white/[0.055] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-pink-100/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:text-[10px]"
        >
          <HelpCircle className="h-3 w-3 shrink-0 text-pink-300" />
          <span>Choose Section</span>
          <span className="hidden h-1 w-1 rounded-full bg-pink-300/50 sm:block" />
          <span className="hidden text-pink-300/70 sm:inline">Photos / Videos / Albums</span>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('photos');
              setSelectedIdx(null);
            }}
            className={`
              relative
              px-4 py-2 sm:px-6 sm:py-2.5
              rounded-full
              text-[10px] sm:text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              transition-all
              duration-500
              flex items-center gap-2
              cursor-pointer
              ${activeTab === 'photos' ? 'text-white' : 'text-zinc-400 hover:text-white'}
            `}
          >
            {activeTab === 'photos' && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-pink-600/30 border border-pink-500/30 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.3)]"
              />
            )}
            <span className="relative z-10">🌸</span>
            <span className="relative z-10">Living Photos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('videos');
              setSelectedIdx(null);
            }}
            className={`
              relative
              px-4 py-2 sm:px-6 sm:py-2.5
              rounded-full
              text-[10px] sm:text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              transition-all
              duration-500
              flex items-center gap-2
              cursor-pointer
              ${activeTab === 'videos' ? 'text-white' : 'text-zinc-400 hover:text-white'}
            `}
          >
            {activeTab === 'videos' && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-pink-600/30 border border-pink-500/30 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.3)]"
              />
            )}
            <span className="relative z-10">🎥</span>
            <span className="relative z-10">Nostalgic Videos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('google-photos');
              setSelectedIdx(null);
            }}
            className={`
              relative
              px-4 py-2 sm:px-6 sm:py-2.5
              rounded-full
              text-[10px] sm:text-xs
              font-bold
              uppercase
              tracking-[0.16em]
              transition-all
              duration-500
              flex items-center gap-2
              cursor-pointer
              ${activeTab === 'google-photos' ? 'text-white' : 'text-zinc-400 hover:text-white'}
            `}
          >
            {activeTab === 'google-photos' && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-pink-600/30 border border-pink-500/30 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.3)]"
              />
            )}
            <span className="relative z-10">✨</span>
            <span className="relative z-10">Google Photos</span>
          </button>

        </div>

        {/* Dynamic Controls Bar */}
        {activeTab !== 'google-photos' && (
          <div className="flex flex-col items-stretch justify-between gap-2 max-w-5xl mx-auto pt-1 sm:flex-row sm:items-center sm:gap-4 sm:pt-2">
            
            {/* Left Status */}
            <div className="flex items-center gap-2.5 text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#fda4af]/90 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fda4af] animate-pulse" />
                {activeTab === 'photos' ? 'Living Photos' : 'Nostalgic Video Moments'}
              </span>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center justify-end gap-2">
              
              {/* Scramble board layout action */}
              {layoutMode === 'board' && (
                <button
                  type="button"
                  onClick={handleScramble}
                  className="px-2.5 py-1.5 text-[9px] bg-white/5 hover:bg-pink-600/30 border border-white/10 hover:border-pink-500/30 text-pink-200 uppercase font-black tracking-widest rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer sm:px-3 sm:text-[10px]"
                  title="Scramble polaroid arrangements"
                >
                  <RefreshCw className="h-3 w-3 animate-spin duration-3000" />
                  Scramble
                </button>
              )}

              {/* Grid Toggle buttons */}
              <div className="flex bg-black/60 p-0.5 rounded-lg border border-white/10 sm:p-1">
                <button
                  type="button"
                  onClick={() => setLayoutMode('board')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer sm:p-1.5 ${layoutMode === 'board' ? 'bg-pink-600 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
                  title="Dreamscape Board layout"
                >
                  <Move className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer sm:p-1.5 ${layoutMode === 'grid' ? 'bg-pink-600 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
                  title="Classic Polaroid Grid layout"
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Main stage display area */}
      <div className="relative flex-1 w-full min-h-[460px] max-h-[62vh] px-4 md:px-8 pb-4">
        
        <AnimatePresence mode="wait">
          {activeTab === 'google-photos' ? (
            
            // 🌸 DYNAMIC SYNCRONIZED GOOGLE PHOTOS CHANNEL
            <motion.div
              key="google-photo-box"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full min-h-[400px] flex items-center justify-center p-2"
            >
              <div className="max-w-xl w-full p-8 md:p-12 rounded-3xl border border-white/[0.12] bg-white/[0.07] text-center space-y-6 md:space-y-8 shadow-[0_20px_50px_rgba(236,72,153,0.18)] backdrop-blur-md relative overflow-hidden group">
                <img
                  src={albumAccessBg}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-[50%_34%] opacity-[0.42] saturate-[1.08] blur-[0.5px] transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/58 via-[#2b1027]/45 to-black/76" />
                
                {/* Visual back glow pattern */}
                <div className="absolute -inset-10 bg-gradient-to-tr from-pink-500/10 via-purple-500/5 to-transparent blur-[80px] pointer-events-none" />

                {/* Sparkling Icon Shield with micro-animations */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-[#170a24] rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                >
                  <Globe className="h-8 w-8 md:h-10 md:w-10 text-pink-400 group-hover:rotate-12 transition-transform duration-500" />
                </motion.div>

                {/* Typography info */}
                <div className="space-y-3 relative z-10">
                  <h3 className="font-serif text-2xl md:text-3xl font-black tracking-wide text-pink-100">
                    Choose Your Album
                  </h3>
                  <p className="text-zinc-400 text-xs md:text-sm leading-relaxed max-w-sm mx-auto">
                    Open the Google Photos collection you want to see. Both albums open directly in a new tab.
                  </p>
                </div>

                {/* Premium album choices */}
                <div className="relative z-10 grid w-full gap-3 sm:grid-cols-2">
                  {googlePhotosAlbums.map((album, index) => (
                    <motion.a
                      key={album.id || album.url}
                      whileHover={{ scale: 1.03, boxShadow: "0 0 28px rgba(236, 72, 153, 0.28)" }}
                      whileTap={{ scale: 0.97 }}
                      href={album.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/album flex min-h-[82px] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.065] px-5 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-all hover:border-pink-300/35 hover:bg-pink-500/[0.10]"
                    >
                      <span className="min-w-0">
                        <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.22em] text-pink-300/70">
                          Album {index + 1}
                        </span>
                        <span className="block truncate text-xs font-black uppercase tracking-[0.14em] text-white">
                          {album.label}
                        </span>
                        <span className="mt-1 block text-[10px] font-medium text-zinc-400">
                          {album.description || 'Open Google Photos'}
                        </span>
                      </span>
                      <ExternalLink className="h-4 w-4 shrink-0 text-pink-300 transition-transform duration-300 group-hover/album:translate-x-0.5" />
                    </motion.a>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest block leading-loose">
                    Shared Albums: {googlePhotosAlbums.length > 0 ? 'CONNECTED' : 'NOT LINKED'}
                  </span>
                </div>

              </div>
            </motion.div>

          ) : layoutMode === 'board' ? (
            
            // 1. DRAGGABLE DREAMSCAPE SCATTERED BOARD
            <motion.div
              key="board"
              ref={boardRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full min-h-[420px] max-h-[60vh] bg-black/20 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center cursor-crosshair"
            >
              
              {/* Informational helpful overlay */}
              {showHelp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-3 left-3 right-3 z-50 max-w-[270px] bg-neutral-950/88 backdrop-blur-md p-3 rounded-xl border border-white/10 text-left space-y-2 shadow-xl select-none sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-xs sm:p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[9px] text-pink-300 font-bold uppercase tracking-widest flex items-center gap-1.5 sm:text-[10px]">
                      <Info className="h-3 w-3" />
                      Living Board
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowHelp(false)}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-pink-200 transition hover:bg-pink-500/20"
                      title="Hide board tip"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-snug font-medium sm:text-[10px]">
                    Tap a card to open. Drag to move. Swipe fullscreen.
                  </p>
                </motion.div>
              )}

              {/* Render the scattered floating elements */}
              {(activeTab === 'videos' ? videoMemories : memories).map((item, idx) => {
                const pos = getBoardPosition(idx);
                // Introduce slight variance based on scramble count
                const randomRotateOffset = Math.sin(idx + scatterOffset) * 8;
                const finalRotate = pos.rotate + randomRotateOffset;
                
                return (
                  <motion.div
                    key={`${activeTab}-${idx}`}
                    drag
                    dragConstraints={boardRef}
                    dragElastic={0.25}
                    dragTransition={{ bounceStiffness: 140, bounceDamping: 17 }}
                    onDragStart={() => setDraggedIdx(idx)}
                    onDragEnd={() => setDraggedIdx(null)}
                    onHoverStart={() => setHoveredIdx(idx)}
                    onHoverEnd={() => setHoveredIdx(null)}
                    
                    // Choreographed entry from random direction
                    initial={{
                      opacity: 0,
                      scale: 0.1,
                      x: idx % 2 === 0 ? -150 : 150,
                      y: idx % 3 === 0 ? -120 : 120,
                      rotate: finalRotate * 3
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                      y: [0, -6, 0, 6, 0], // Continuous bobbing animation
                      rotate: [finalRotate, finalRotate + 1.5, finalRotate, finalRotate - 1.5, finalRotate]
                    }}
                    transition={{
                      opacity: { duration: 0.8, delay: idx * 0.08 },
                      scale: { type: 'spring', stiffness: 200, damping: 20, delay: idx * 0.08 },
                      // Bobbing/swaying setup (delicate, loop indefinitely, unique speed)
                      y: {
                        duration: pos.bobDur,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                      rotate: {
                        duration: pos.bobDur + 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                    }}
                    style={{
                      position: 'absolute',
                      left: isMobile ? pos.mobile.x : pos.desktop.x,
                      top: isMobile ? pos.mobile.y : pos.desktop.y,
                      zIndex: draggedIdx === idx ? 100 : hoveredIdx === idx ? 50 : 15 + idx,
                    }}
                    className="
                      w-[45%] 
                      sm:w-[32%] 
                      md:w-[200px] 
                      bg-white 
                      p-2.5 
                      pb-4 
                      rounded-none 
                      shadow-[0_12px_28px_rgba(0,0,0,0.65)] 
                      border 
                      border-neutral-200 
                      text-neutral-800 
                      flex 
                      flex-col 
                      group 
                      transition-shadow 
                      duration-300 
                      hover:shadow-[0_15px_35px_rgba(236,72,153,0.3)]
                      select-none
                      cursor-grab
                      active:cursor-grabbing
                    "
                    onClick={() => {
                      if (!isMobile) return;
                      setSelectedIdx(idx);
                      if (onPhotoClick) onPhotoClick(item.src);
                    }}
                    onDoubleClick={() => {
                      setSelectedIdx(idx);
                      if (onPhotoClick) onPhotoClick(item.src);
                    }}
                  >
                    
                    {/* LIVING IMAGE BOX - Ken Burns internal animation */}
                    <div className="relative aspect-square w-full rounded-none bg-neutral-50 overflow-hidden mb-2.5 border border-neutral-100 flex items-center justify-center">
                      
                      {item.type === 'video' ? (
                        <motion.img
                          src={item.poster || item.src}
                          alt={item.cap}
                          loading="lazy"
                          decoding="async"
                          animate={{
                            scale: [1, 1.1, 1.15, 1.1, 1],
                            x: ["0%", "3%", "-2.5%", "1.5%", "0%"],
                            y: ["0%", "-2%", "2.5%", "-1.5%", "0%"],
                            rotate: [0, 0.8, -0.8, 0.4, 0]
                          }}
                          transition={{
                            duration: 16 + idx * 2.5, // desynchronized durations so every portrait moves uniquely!
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                      ) : (
                        <motion.img
                          src={item.src}
                          alt={item.cap}
                          referrerPolicy="no-referrer"
                          style={{ objectPosition: item.objectPosition || '50% 50%' }}
                          loading="lazy"
                          decoding="async"
                          animate={{
                            scale: [1, 1.1, 1.15, 1.1, 1],
                            x: ["0%", "3%", "-2.5%", "1.5%", "0%"],
                            y: ["0%", "-2%", "2.5%", "-1.5%", "0%"],
                            rotate: [0, 0.8, -0.8, 0.4, 0]
                          }}
                          transition={{
                            duration: 16 + idx * 2.5, // desynchronized durations so every portrait moves uniquely!
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-full h-full object-cover select-none pointer-events-none grayscale-[12%] group-hover:grayscale-0 transition-all duration-500"
                        />
                      )}
                      
                      {/* Video custom play button overlays */}
                      {item.type === 'video' && (
                        <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                          <div className="bg-pink-600/95 border border-pink-400 p-2 text-white animate-pulse rounded-full flex items-center justify-center shadow-md">
                            <Play className="h-4 w-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}
                      
                      {/* Soft ambient overlay */}
                      <div className="absolute inset-0 bg-pink-950/[0.04] group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />

                      {/* Top Action Ribbon overlay on hover */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 pointer-events-none">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIdx(idx);
                            if (onPhotoClick) onPhotoClick(item.src);
                          }}
                          className="p-1.5 rounded-md bg-pink-600 text-white shadow-lg border border-pink-500 pointer-events-auto transform active:scale-95 transition-transform"
                          title="View fullscreen"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>

                    </div>

                    {/* Polaroid metadata footer caption */}
                    <div className="space-y-0.5 select-none text-left font-sans">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-serif font-semibold text-[12px] text-pink-950 leading-tight truncate">
                          {item.cap}
                        </h4>
                        <Heart className="h-2.5 w-2.5 text-pink-500 flex-shrink-0 animate-pulse" fill="currentColor" />
                      </div>
                      <p className="text-[9px] text-zinc-500 font-medium leading-tight max-w-full truncate">
                        {item.date || 'Romantic Memory'}
                      </p>
                    </div>

                    {/* Drag Grip subtle border accent on dragging */}
                    {draggedIdx === idx && (
                      <div className="absolute inset-0 border-[2px] border-pink-400 pointer-events-none animate-pulse" />
                    )}

                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            
            // 2. CLASSIC ALIGNED POLAROID GRID
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar text-left"
            >
               {(activeTab === 'videos' ? videoMemories : memories).map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="bg-white p-3.5 pb-[18px] rounded-sm shadow-xl shadow-black/70 border border-neutral-200 text-neutral-800 font-sans w-full flex flex-col cursor-pointer group"
                  onClick={() => {
                    setSelectedIdx(idx);
                    if (onPhotoClick) onPhotoClick(item.src);
                  }}
                >
                  {/* Image Box - Living Ken Burns photo inside */}
                  <div className="relative aspect-square w-full rounded-none bg-[#fdf2f8] overflow-hidden mb-3.5 border border-neutral-100 flex items-center justify-center">
                    
                    {item.type === 'video' ? (
                      <motion.img
                        src={item.poster || item.src}
                        alt={item.cap}
                        loading="lazy"
                        decoding="async"
                        animate={{
                          scale: [1, 1.08, 1.12, 1.08, 1],
                          x: ["0%", "2%", "-1.5%", "1%", "0%"],
                          y: ["0%", "-1.5%", "2%", "-0.5%", "0%"],
                        }}
                        transition={{
                          duration: 16 + idx * 2.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    ) : (
                        <motion.img
                          src={item.src}
                          alt={item.cap}
                          referrerPolicy="no-referrer"
                          style={{ objectPosition: item.objectPosition || '50% 50%' }}
                          loading="lazy"
                          decoding="async"
                          animate={{
                          scale: [1, 1.08, 1.12, 1.08, 1],
                          x: ["0%", "2%", "-1.5%", "1%", "0%"],
                          y: ["0%", "-1.5%", "2%", "-0.5%", "0%"],
                        }}
                        transition={{
                          duration: 16 + idx * 2.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-500 scale-[1.01]"
                      />
                    )}
                    
                    {/* Video custom play button overlays */}
                    {item.type === 'video' && (
                      <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                        <div className="bg-pink-600/95 border border-pink-400 p-2 text-white animate-pulse rounded-full flex items-center justify-center shadow-md">
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-pink-950/5 opacity-45 group-hover:opacity-0 transition-opacity pointer-events-none" />
                    
                    {/* Zoom overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="bg-pink-600/90 text-white p-2.5 rounded-full scale-90 group-hover:scale-100 transition-transform">
                        <Eye className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Polaroid Description info */}
                  <div className="space-y-2 select-none text-left">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="min-w-0 flex-1 font-serif text-[15px] font-semibold tracking-normal text-pink-950 leading-[1.08]">
                        {item.cap}
                      </h4>
                      {item.date && (
                        <span className="shrink-0 max-w-[96px] text-right text-[9px] font-mono leading-tight text-pink-800 bg-pink-50 border border-pink-100 px-1.5 py-0.5 rounded-sm">
                          {item.date}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed font-medium max-w-full">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedIdx !== null && (() => {
          const activeItems = activeTab === 'videos' ? videoMemories : memories;
          if (selectedIdx >= activeItems.length) return null;
          const currentItem = activeItems[selectedIdx];

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-4 bg-black/94 backdrop-blur-xl pointer-events-auto"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              {/* Background click closes lightbox */}
              <div
                className="absolute inset-0 pointer-events-auto"
                onClick={() => setSelectedIdx(null)}
              />

              {/* Sparkle background animation canvas overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10 font-sans">
                {sparkles.map((sp) => (
                  <motion.div
                    key={sp.id}
                    initial={{ opacity: 1, scale: 0.5, x: sp.x, y: sp.y }}
                    animate={{ opacity: 0, scale: 2, y: sp.y - 120, x: sp.x + (Math.random() * 60 - 30) }}
                    transition={{ duration: 1.6, ease: 'easeOut' }}
                    className="absolute text-xl sm:text-2xl"
                  >
                    {sp.val}
                  </motion.div>
                ))}
              </div>

              {/* Central Box Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="
                  relative
                  max-h-[95vh]
                  w-full
                  max-w-[95vw]
                  overflow-y-auto
                  rounded-[34px]
                  border
                  border-white/15
                  bg-[#0d0414]/90
                  p-4
                  shadow-[0_0_90px_rgba(236,72,153,0.4)]
                  backdrop-blur-2xl
                  sm:p-6
                  lg:max-w-5xl
                  group
                  pointer-events-auto
                "
                onClick={(e) => {
                  // Click creates dynamic romantic sparkles
                  triggerSparkle(e.clientX, e.clientY);
                }}
              >
                {/* Close Button top-right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIdx(null);
                  }}
                  className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-pink-600 border border-white/20 hover:border-pink-500 text-white transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                  title="Close Lightbox"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>

                {/* Master Responsive Grid */}
                <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_340px] pt-8 lg:pt-0 text-left">
                  
                  {/* Image Section - Living Foto with Ken Burns & Swipe support */}
                  <div className="relative">
                    {/* Image Wrapper */}
                    <div 
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      className="
                        flex
                        min-h-[260px]
                        max-h-[75vh]
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-[28px]
                        border
                        border-white/10
                        bg-black/35
                        p-2
                        cursor-ew-resize
                      "
                      title="Swipe left or right to switch items"
                    >
                      {currentItem.type === 'video' ? (
                        <motion.video
                          ref={lightboxVideoRef}
                          src={currentItem.src}
                          poster={currentItem.poster}
                          controls
                          autoPlay={isAutoplay}
                          preload="metadata"
                          onLoadedMetadata={handleLightboxVideoLoaded}
                          onTimeUpdate={handleLightboxVideoTimeUpdate}
                          onEnded={handleLightboxVideoEnded}
                          animate={{
                            scale: [1, 1.05, 1.08, 1.05, 1],
                            x: ["0%", "1.5%", "-1.5%", "0.8%", "0%"],
                            y: ["0%", "-1%", "1.5%", "-0.8%", "0%"],
                          }}
                          transition={{
                            duration: 22,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="
                            mx-auto
                            h-auto
                            w-auto
                            max-h-[70vh]
                            max-w-full
                            rounded-[22px]
                            object-contain
                            shadow-[0_0_65px_rgba(236,72,153,0.35)]
                            outline-none
                          "
                          playsInline
                        />
                      ) : (
                        <motion.img
                          src={currentItem.src}
                          alt={currentItem.cap}
                          animate={{
                            scale: [1, 1.05, 1.08, 1.05, 1],
                            x: ["0%", "1.5%", "-1.5%", "0.8%", "0%"],
                            y: ["0%", "-1%", "1.5%", "-0.8%", "0%"],
                          }}
                          transition={{
                            duration: 22,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="
                            mx-auto
                            h-auto
                            w-auto
                            max-h-[70vh]
                            max-w-full
                            rounded-[22px]
                            object-contain
                            shadow-[0_0_60px_rgba(236,72,153,0.35)]
                          "
                        />
                      )}
                    </div>

                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIdx((prev) => (prev !== null ? (prev - 1 + activeItems.length) % activeItems.length : 0));
                        setAutoplayProgress(0); // reset timer
                      }}
                      className="
                        absolute
                        left-4
                        top-1/2
                        z-25
                        -translate-y-1/2
                        rounded-full
                        border
                        border-pink-200/20
                        bg-black/65
                        p-2.5
                        text-pink-100
                        backdrop-blur-md
                        transition
                        hover:bg-pink-600
                        hover:text-white
                        hover:scale-105
                      "
                      title="Previous Memory"
                    >
                      <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </button>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIdx((prev) => (prev !== null ? (prev + 1) % activeItems.length : 0));
                        setAutoplayProgress(0); // reset timer
                      }}
                      className="
                        absolute
                        right-4
                        top-1/2
                        z-25
                        -translate-y-1/2
                        rounded-full
                        border
                        border-pink-200/20
                        bg-black/65
                        p-2.5
                        text-pink-100
                        backdrop-blur-md
                        transition
                        hover:bg-pink-600
                        hover:text-white
                        hover:scale-105
                      "
                      title="Next Memory"
                    >
                      <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                  </div>

                  {/* Sidebar Metadata details block */}
                  <div className="flex flex-col justify-between h-full py-2 pl-2 space-y-6">
                    
                    <div className="space-y-4">
                      
                      {/* Date capsule tag */}
                      {currentItem.date && (
                        <span className="inline-block px-3 py-1 text-[9px] uppercase font-bold tracking-[0.2em] bg-pink-700/20 border border-pink-500/30 text-pink-300 rounded-full">
                          {currentItem.date}
                        </span>
                      )}

                      <h2 className="font-serif text-3xl font-black text-rose-50 tracking-wide leading-tight">
                        {currentItem.cap}
                      </h2>

                      <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans font-medium italic border-l-2 border-pink-600/50 pl-3">
                        {currentItem.desc}
                      </p>

                    </div>

                    {/* Presentation Control Dashboard */}
                    <div className="space-y-4">
                      
                      {/* Status row */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsAutoplay(!isAutoplay);
                            }}
                            className={`p-2 rounded-lg transition-transform ${isAutoplay ? 'bg-pink-600 text-white' : 'bg-white/10 text-zinc-400'}`}
                            title={isAutoplay ? 'Pause presentation' : 'Play presentation'}
                          >
                            {isAutoplay ? <Pause className="h-[18px] w-[18px]" /> : <Play className="h-[18px] w-[18px] fill-current" />}
                          </button>
                          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
                            {isAutoplay
                              ? currentItem.type === 'video'
                                ? 'Playing full video clip'
                                : 'Autoplay story mode'
                              : 'Slide presentation paused'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-pink-400/80">
                          {selectedIdx + 1} / {activeItems.length}
                        </span>
                      </div>

                      {/* Presentation horizontal timeline loader */}
                      <div className="w-full h-1.5 bg-zinc-950/90 border border-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                          style={{ width: `${autoplayProgress}%` }}
                          transition={{ ease: 'linear' }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-[#fda4af]/40 uppercase tracking-widest font-black leading-loose">
                        <span>Double click frame to trigger hearts</span>
                        <span>[ESC] close</span>
                      </div>

                    </div>

                  </div>

                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
