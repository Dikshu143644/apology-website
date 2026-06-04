/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Compass, 
  Activity, 
  MessageCircle, 
  Image as ImageIcon,
  ArrowDown, 
  Gift, 
  Smile, 
  Lock,
  Music,
  CheckCircle,
  HelpCircle,
  Menu,
  X,
  LogOut
} from 'lucide-react';

import AudioEngine from './components/AudioEngine';
import ButterflyCanvas from './components/ButterflyCanvas';
import HeartPetals from './components/HeartPetals';
import NavEmojiBurst from './components/NavEmojiBurst';
import dikshuBg from './assets/images/optimized/Dikshu-bg.webp';
import messageHeartBg from './assets/images/optimized/A-message-from-my-heart.webp';
import aboutMePhoto from './assets/images/optimized/About-Me.webp';
import listeningMusic from './assets/images/optimized/Dikshu-Listening-Music.webp';
import lookingLeft from './assets/images/optimized/Me-Looking-In-Left-Side.webp';
import lookingRight from './assets/images/optimized/Dikshu-Looking-At-Right-Side.webp';
import iLoveYouDikshu from './assets/images/optimized/I-Love-You-Dikshu.webp';
import LoginPage from './components/LoginPage';

const AdminPanel = lazy(() => import('./components/AdminPanel'));
const MagicalBellJar3D = lazy(() => import('./components/MagicalBellJar3D'));
const MagicalButterfly = lazy(() => import('./components/MagicalButterfly'));
const ApologyModals = lazy(() =>
  import('./components/ApologyModals').then((module) => ({ default: module.ApologyModals }))
);

export default function App() {
  const isAdminRoute = window.location.pathname === '/admin';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('dikshu_authenticated') === 'true';
  });
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [forgiveResponse, setForgiveResponse] = useState<'yes' | 'thinking' | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [galleryInitialTab, setGalleryInitialTab] = useState<'photos' | 'videos' | 'google-photos'>('photos');
  const momentFrameImages = [
    { src: '/image/optimized/memory-1.webp', pos: '50% 34%' },
    { src: '/image/optimized/memory-2.webp', pos: '50% 30%' },
    { src: '/image/optimized/memory-3.webp', pos: '50% 31%' },
    { src: '/image/optimized/memory-4.webp', pos: '50% 38%' },
    { src: '/image/optimized/memory-11.webp', pos: '50% 50%' },
    { src: '/image/optimized/memory-12.webp', pos: '48% 34%' },
    { src: '/image/video-thumb-1.jpg', pos: '50% 50%' },
    { src: '/image/video-thumb-2.jpg', pos: '50% 50%' },
    { src: '/image/video-thumb-3.jpg', pos: '50% 50%' },
    { src: '/image/video-thumb-4.jpg', pos: '50% 50%' },
    { src: '/image/video-thumb-5.jpg', pos: '50% 50%' },
    { src: '/image/video-thumb-6.jpg', pos: '50% 50%' },
  ];

  const handleLogin = (name: string) => {
    localStorage.setItem('dikshu_authenticated', 'true');
    localStorage.setItem('dikshu_visitor_name', name);
    localStorage.removeItem('dikshu_visitor_code');
    setIsAuthenticated(true);
  };

  const ambientFallback = (
    <div className="h-[360px] w-full max-w-[420px] rounded-[28px] border border-pink-300/10 bg-white/[0.03] backdrop-blur-md animate-pulse" />
  );

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Load decision on mount to restore her previous responses if any
  useEffect(() => {
    const saved = localStorage.getItem('localForgiveDecision');
    if (saved === 'yes' || saved === 'thinking') {
      setForgiveResponse(saved as 'yes' | 'thinking');
      if (saved === 'yes') {
        setCelebrationActive(true);
      }
    }
  }, []);

  const handleForgiveChoice = async (choice: 'yes' | 'thinking') => {
    setForgiveResponse(choice);
    localStorage.setItem('localForgiveDecision', choice);
    
    if (choice === 'yes') {
      setCelebrationActive(true);
    } else {
      setCelebrationActive(false);
    }

    try {
      await fetch('/api/forgive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ choice }),
      });
    } catch (e) {
      console.error('Failed to notify decision to core server backend:', e);
    }
  };

  // Handle image load error to show cute alternative gradient
  const handleImgError = (id: string) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About Me', href: '#about' },
    { label: 'Memories', href: '#memories' },
    { label: 'Reasons', href: '#reasons' },
    { label: 'Promise', href: '#promise' },
    { label: 'Letter', href: '#letter' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Forgive Me', href: '#forgive' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    
    // Trigger custom background emoji burst based on clicked nav link
    const matchingLink = navLinks.find(link => link.href === href);
    if (matchingLink) {
      window.dispatchEvent(new CustomEvent('nav-emoji-burst', { 
        detail: { label: matchingLink.label } 
      }));
    }

    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#05010a] text-pink-100" />}>
        <AdminPanel isFullScreen={true} />
      </Suspense>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="relative min-h-screen bg-[#030108] text-white font-sans overflow-x-hidden selection:bg-pink-500/40 selection:text-white">
      
      {/* Background ambient light effects & real background image */}
      <div 
        className="fixed inset-[-10px] bg-cover bg-center bg-no-repeat pointer-events-none z-0 select-none blur-[0.5px] saturate-[1.1] brightness-[0.8] scale-[1.03] transition-all duration-1000"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(3, 1, 8, 0.2), rgba(3, 1, 8, 0.5)), url(${dikshuBg})`,
        }}
      />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(236,72,153,0.12),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(168,85,247,0.1),transparent_50%),radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.05),transparent_60%)] pointer-events-none z-0" />

      {/* Interactive Floating butterflies Canvas & Heart Blossom systems */}
      <ButterflyCanvas />
      <HeartPetals />
      <NavEmojiBurst />

      {/* HEADER / NAVIGATION BAR */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-6xl z-50">
        <nav className="relative overflow-hidden rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] px-6 py-3 flex items-center justify-between">
          {/* Ambient inner glow for nav */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-500/[0.05] via-transparent to-purple-500/[0.05]" />
          
          {/* Logo */}
          <div className="relative z-10 flex items-center gap-1.5 cursor-pointer group" onClick={() => handleLinkClick('#home')}>
            <span className="font-cinzel text-lg sm:text-xl md:text-2xl font-black tracking-[0.2em] text-white group-hover:text-pink-300 transition-all duration-300">
              OMKAR <span className="text-pink-500 animate-pulse">💖</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="relative z-10 hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.href)}
                className="text-[11px] font-bold uppercase tracking-[0.15em] text-pink-100/60 hover:text-pink-200 transition-all duration-300 cursor-pointer relative py-1 group font-poppins"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-pink-400 to-purple-400 group-hover:w-full transition-all duration-500" />
              </button>
            ))}
          </div>

          {/* Right Action Controllers */}
          <div className="relative z-10 flex items-center gap-4">
            {/* Romantic Synth Engine Controller */}
            <AudioEngine />

            {/* "For You 💖" button */}
            <button
              onClick={() => setActiveModal('messageModal')}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-pink-200 text-[10px] font-bold uppercase tracking-widest hover:border-pink-500/40 hover:bg-pink-500/10 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all active:scale-95 duration-300 cursor-pointer group"
            >
              <span>For You</span>
              <Heart className="h-3 w-3 text-pink-500 fill-pink-500/30 group-hover:fill-pink-500 transition-all animate-pulse" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => {
                const nextState = !mobileMenuOpen;
                setMobileMenuOpen(nextState);
                if (nextState) {
                  window.dispatchEvent(new Event('close-music-player'));
                }
              }}
              className="lg:hidden p-2 text-pink-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-[4.5rem] left-0 right-0 p-6 rounded-[30px] border border-white/10 bg-black/80 backdrop-blur-2xl shadow-2xl flex flex-col gap-5 z-50 text-center overflow-hidden"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-pink-400/[0.02] to-transparent" />
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleLinkClick(link.href)}
                  className="relative z-10 py-1 text-xs font-bold uppercase tracking-widest text-pink-100/70 hover:text-pink-300 transition-colors border-b border-white/5 font-poppins"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => { setMobileMenuOpen(false); setActiveModal('messageModal'); }}
                className="relative z-10 w-full mt-2 py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black uppercase tracking-[0.2em] rounded-full text-[10px] shadow-[0_8px_20px_rgba(236,72,153,0.3)] active:scale-95 transition-all"
              >
                Read Heart Message 💌
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-24 pb-12 px-6 sm:px-12 relative z-10">
        <Suspense fallback={null}>
          <MagicalButterfly />
        </Suspense>
        <div className="relative z-30 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-pink-300 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
              <Sparkles className="h-3.5 w-3.5 text-pink-400 animate-pulse" />
              <span>To The Most Special Person</span>
            </div>
            
            <h1 className="font-cinzel text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[0.95] tracking-normal drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
              DIKSHU,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 font-playfair italic font-medium tracking-normal">
                I'm Sorry...
              </span>
              <span className="inline-block animate-bounce ml-4 text-pink-500">💔</span>
            </h1>

            <p className="text-zinc-400 font-poppins text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              For every mistake. For every moment I failed to understand you. This space is a dedicated dreamscape for the words I couldn't express.
            </p>

            <div className="relative z-40 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
              <motion.button
                type="button"
                onClick={() => setActiveModal('messageModal')}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="group/primary relative inline-flex min-h-[52px] w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-full border border-pink-200/25 bg-[linear-gradient(135deg,rgba(236,72,153,0.96),rgba(168,85,247,0.92))] px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_16px_34px_rgba(168,85,247,0.28)] transition-colors duration-300 hover:border-pink-100/45 cursor-pointer"
              >
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.32),transparent_32%)] opacity-75" />
                <span className="pointer-events-none absolute inset-y-0 -left-16 w-14 rotate-12 bg-white/25 blur-md transition-transform duration-700 group-hover/primary:translate-x-[260px]" />
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/15"
                >
                  <Heart className="h-4 w-4 fill-white/75 text-white" />
                </motion.span>
                <span className="relative">Read My Heart</span>
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => handleLinkClick('#memories')}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="group/secondary relative inline-flex min-h-[52px] w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-full border border-white/15 bg-white/[0.055] px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-pink-100/90 shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-[10px] transition-colors duration-300 hover:border-pink-300/35 hover:bg-pink-500/[0.08] cursor-pointer"
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/[0.08] via-transparent to-pink-400/[0.08] opacity-70" />
                <span className="relative">Explore Memories</span>
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition-colors duration-300 group-hover/secondary:border-pink-300/30 group-hover/secondary:bg-pink-400/10">
                  <ChevronRight className="h-4 w-4 text-pink-300 transition-transform duration-300 group-hover/secondary:translate-x-0.5" />
                </span>
              </motion.button>
            </div>

            {/* Scroll Down Indicator */}
            <div className="pt-8 flex flex-col items-start gap-1 text-pink-200/50 animate-bounce text-xs font-mono uppercase tracking-widest">
              <span>Scroll Down</span>
              <ArrowDown className="h-[18px] w-[18px] text-pink-400 self-center" />
            </div>
          </div>

          {/* Hero Portrait Right */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[360px] md:max-w-[420px] aspect-[4/5] rounded-[48px] border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 overflow-hidden group">
              
              {/* Ambient decoration */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-pink-400/[0.02] to-transparent" />
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />

              {/* Glowing Orb Ring back splash */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[90%] h-[90%] rounded-full border border-pink-500/10 shadow-[0_0_100px_rgba(244,63,94,0.15)] animate-pulse" />
              </div>
              {/* Main portrait image image container */}
              <div className="relative w-full h-full rounded-[36px] overflow-hidden bg-[#0c0312]">
                {!imgErrors[dikshuBg] ? (
                  <img
                    src={dikshuBg}
                    alt="Dikshu"
                    onError={() => handleImgError(dikshuBg)}
                    referrerPolicy="no-referrer"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000 ease-out brightness-[0.9] group-hover:brightness-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-pink-100 relative bg-gradient-to-br from-[#1a0b2e] to-[#0a0212]">
                    <Heart className="h-20 w-20 text-pink-500/40 fill-pink-500/10 mb-6 animate-pulse" />
                    <h3 className="font-cinzel text-2xl font-black tracking-widest text-white mb-3">DIKSHU</h3>
                    <p className="text-[11px] font-poppins text-pink-200/60 uppercase tracking-[0.2em] max-w-[240px]">
                      Your beauty frames my cosmos
                    </p>
                  </div>
                )}

                {/* Glassy overlay info card */}
                <div className="absolute bottom-6 left-6 right-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-4 flex justify-between items-center"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-500/[0.05] to-transparent" />
                    <div>
                      <h4 className="font-cinzel text-xs font-black tracking-[0.2em] text-pink-100">DIKSHU</h4>
                      <p className="text-[10px] font-poppins text-zinc-400 font-medium tracking-normal uppercase">Presence is everything</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                      <Heart className="h-4 w-4 text-pink-500 fill-pink-500 animate-pulse" />
                    </div>
                  </motion.div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Wavy bottom divider curves inside hero */}
        <div className="absolute bottom-0 left-0 right-0 h-10 w-full overflow-hidden pointer-events-none z-10 translate-y-2">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full text-[#08020d] fill-current">
            <path d="M0,0 C150,90 350,110 600,60 C850,10 1050,40 1200,80 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>

      {/* DETAILED CONTENT SECTIONS CONTAINER */}
      <main className="relative z-20 space-y-16 py-12 px-4 sm:px-8 max-w-6xl mx-auto font-sans">
        
        {/* SECTION: ABOUT ME, OUR MEMORIES, WHY YOU MATTER */}
        <section id="about" className="scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Bento Card 1: ABOUT ME (Col span 4) */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-4 relative overflow-hidden rounded-[30px] border border-white/[0.18] bg-white/[0.10] backdrop-blur-md shadow-[0_16px_38px_rgba(0,0,0,0.34)] p-8 flex flex-col justify-between group"
            >
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <img
                  src={aboutMePhoto}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-[50%_43%] opacity-[0.64] saturate-[1.08] blur-[0.5px] transition-transform duration-1000 group-hover:scale-110 sm:object-[50%_42%] lg:object-[50%_48%]"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/42 via-[#321928]/24 to-black/58" />
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-br from-white/[0.14] via-pink-400/[0.045] to-transparent" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-xl sm:text-2xl font-black text-white tracking-[0.2em] uppercase">About Me</h3>
                  <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                    <Heart className="h-4 w-4 text-pink-500 fill-pink-500/20" />
                  </div>
                </div>
                
                <p className="text-pink-50/70 font-poppins text-xs sm:text-sm leading-relaxed font-light">
                  I'm Omkar. Just a guy who loved you more than himself. My love was simple, but it was honest, pure, and patient.
                </p>
                <p className="text-pink-300 font-playfair text-lg italic font-medium tracking-wide">
                  That's why I'm here... <br />to say I'm truly sorry.
                </p>
              </div>

              <div className="relative z-10 pt-8">
                <button
                  onClick={() => setActiveModal('aboutModal')}
                  className="group/btn cta-breath relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-cyan-200/24 bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(255,255,255,0.075),rgba(6,182,212,0.12))] px-5 py-3 text-xs font-black uppercase tracking-widest text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_26px_rgba(8,145,178,0.16)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/45 hover:bg-cyan-400/12 hover:shadow-[0_16px_34px_rgba(8,145,178,0.25)] active:scale-95 cursor-pointer"
                >
                  <span className="pointer-events-none absolute inset-y-0 -left-12 w-10 rotate-12 bg-white/20 blur-md transition-transform duration-700 group-hover/btn:translate-x-[260px]" />
                  <Compass className="relative h-3.5 w-3.5 text-cyan-200 transition-transform duration-300 group-hover/btn:rotate-12" />
                  <span className="relative">Know My Soul</span>
                  <span className="relative rounded-full border border-cyan-100/20 bg-white/10 px-2 py-0.5 text-[8px] text-cyan-100/80">Tap</span>
                </button>
              </div>
            </motion.div>

            {/* Bento Card 2: OUR MEMORIES (Col span 5) */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-5 relative overflow-hidden rounded-[30px] border border-white/[0.18] bg-white/[0.10] backdrop-blur-md shadow-[0_16px_38px_rgba(0,0,0,0.34)] p-8 min-h-[360px] sm:min-h-[380px] lg:min-h-[360px] flex flex-col justify-between group"
              id="memories"
            >
              {/* Background image overlay */}
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <img
                  src={iLoveYouDikshu}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-[50%_28%] opacity-[0.68] saturate-[1.1] blur-[0.5px] transition-transform duration-1000 group-hover:scale-110 sm:object-[50%_28%] lg:object-[50%_31%]"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/34 via-[#522033]/24 to-black/58" />

              {/* Premium Inner Glow */}
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-br from-white/[0.16] via-purple-400/[0.045] to-transparent" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-xl sm:text-2xl font-black text-white tracking-[0.2em] uppercase">Our Memories</h3>
                  <span className="text-pink-400 font-poppins font-bold text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">EST. 5TH STD</span>
                </div>
                
                {/* Visual miniature timeline preview cards */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {[
                    { id: 1, text: 'Childhood Days', desc: 'Innocent laughter', src: '/image/optimized/memory-11.webp', pos: '50% 52%' },
                    { id: 2, text: 'School Years', desc: 'Shared dreams', src: '/image/optimized/memory-12.webp', pos: '48% 34%' },
                    { id: 3, text: 'The Shift', desc: 'Silent change', src: '/image/optimized/memory-9.webp', pos: '50% 43%' },
                    { id: 4, text: 'This Moment', desc: 'Honest words', src: '/image/optimized/memory-10.webp', pos: '50% 32%' },
                  ].map((p) => (
                    <div key={p.id} className="min-h-[78px] p-4 rounded-2xl bg-white/[0.10] backdrop-blur-sm border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] relative overflow-hidden flex flex-col justify-end text-left group/mini">
                      <img
                        src={p.src}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover opacity-[0.58] saturate-[1.08] transition-transform duration-700 group-hover/mini:scale-110"
                        style={{ objectPosition: p.pos }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/22 via-[#45172d]/30 to-black/62" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.10] to-transparent" />
                      <span className="absolute -top-1 -right-1 text-5xl text-white/[0.08] font-cinzel font-black">{p.id}</span>
                      <span className="relative text-[11px] font-black text-white uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">{p.text}</span>
                      <span className="relative text-[10px] text-pink-50/70 font-poppins mt-1">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-8">
                <button
                  onClick={() => {
                    setGalleryInitialTab('google-photos');
                    setActiveModal('galleryModal');
                  }}
                  className="group/btn cta-breath relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-amber-200/24 bg-[linear-gradient(135deg,rgba(245,158,11,0.20),rgba(255,255,255,0.075),rgba(244,63,94,0.14))] px-5 py-3 text-xs font-black uppercase tracking-widest text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_26px_rgba(245,158,11,0.14)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200/45 hover:bg-amber-300/12 hover:shadow-[0_16px_34px_rgba(245,158,11,0.22)] active:scale-95 cursor-pointer"
                >
                  <span className="pointer-events-none absolute inset-y-0 -left-12 w-10 rotate-12 bg-white/20 blur-md transition-transform duration-700 group-hover/btn:translate-x-[280px]" />
                  <BookOpen className="relative h-3.5 w-3.5 text-amber-200 transition-transform duration-300 group-hover/btn:scale-110" />
                  <span className="relative">Travel Back In Time</span>
                  <span className="relative rounded-full border border-amber-100/20 bg-white/10 px-2 py-0.5 text-[8px] text-amber-100/80">Album</span>
                </button>
              </div>
            </motion.div>

            {/* Bento Card 3: WHY YOU MATTER (Col span 3) */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-3 relative overflow-hidden rounded-[30px] border border-white/15 bg-white/[0.075] backdrop-blur-[10px] shadow-[0_18px_46px_rgba(0,0,0,0.42)] p-8 min-h-[360px] sm:min-h-[380px] lg:min-h-0 flex flex-col justify-between group"
              id="reasons"
            >
              {/* Premium Inner Glow */}
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-br from-white/[0.12] via-fuchsia-400/[0.05] to-transparent" />
              
              {/* Background image overlay */}
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <img
                  src={lookingRight}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-[50%_31%] opacity-[0.58] saturate-[1.08] blur-[0.5px] transition-transform duration-1000 group-hover:scale-110 sm:object-[50%_32%] lg:object-[50%_50%]"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/56 via-black/34 to-black/76" />

              <div className="absolute -left-10 bottom-0 z-[3] w-32 h-32 bg-purple-500/[0.04] rounded-full blur-[40px] pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-xl sm:text-2xl font-black text-white tracking-[0.2em] uppercase">Why You Matter</h3>
                  <div className="h-8 w-8 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.3)]">
                    <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                  </div>
                </div>
                
                {/* List item bullets with tiny pink heart indicators */}
                <div className="space-y-3.5 text-left pt-2">
                  {[
                    'You are highly special to me',
                    'You changed my path & life',
                    'You made me a better person',
                    'You hold the kindest heart',
                    'You deserve cosmic happiness',
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-start gap-3 group/item">
                      <Heart className="h-3 w-3 text-pink-500 fill-pink-500 mt-1 flex-shrink-0 animate-pulse transition-transform group-hover/item:scale-125" />
                      <span className="text-[11px] font-bold text-pink-100/80 uppercase tracking-widest leading-tight font-poppins">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-8">
                <button
                  onClick={() => setActiveModal('matterModal')}
                  className="group/btn cta-breath relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-fuchsia-200/24 bg-[linear-gradient(135deg,rgba(217,70,239,0.22),rgba(255,255,255,0.07),rgba(236,72,153,0.14))] px-5 py-3 text-xs font-black uppercase tracking-widest text-fuchsia-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_26px_rgba(217,70,239,0.16)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-0.5 hover:border-fuchsia-200/45 hover:bg-fuchsia-400/12 hover:shadow-[0_16px_34px_rgba(217,70,239,0.24)] active:scale-95 cursor-pointer"
                >
                  <span className="pointer-events-none absolute inset-y-0 -left-12 w-10 rotate-12 bg-white/20 blur-md transition-transform duration-700 group-hover/btn:translate-x-[240px]" />
                  <Heart className="relative h-3.5 w-3.5 fill-fuchsia-200/40 text-fuchsia-200 transition-transform duration-300 group-hover/btn:scale-110" />
                  <span className="relative">Explore Deeply</span>
                  <span className="relative rounded-full border border-fuchsia-100/20 bg-white/10 px-2 py-0.5 text-[8px] text-fuchsia-100/80">Open</span>
                </button>
              </div>
            </motion.div>

          </div>
        </section>

        {/* SECTION: PROMISES, ENVELOPE/LETTER & GALLERY PREVIEW */}
        <section className="scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Bento Card 4: MY PROMISES TO YOU (Col span 4) */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-4 relative overflow-hidden rounded-[30px] border border-white/15 bg-white/[0.075] backdrop-blur-[10px] shadow-[0_18px_46px_rgba(0,0,0,0.42)] p-8 flex flex-col justify-between group"
              id="promise"
            >
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <img
                  src={listeningMusic}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-[50%_40%] opacity-[0.58] saturate-[1.06] blur-[0.5px] transition-transform duration-1000 group-hover:scale-110 sm:object-[50%_38%] lg:object-[50%_42%]"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/58 via-[#301526]/38 to-black/78" />
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-br from-white/[0.12] via-pink-400/[0.045] to-transparent" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-xl sm:text-2xl font-black text-white tracking-[0.2em] uppercase">I Promise You</h3>
                  <span className="text-[10px] font-black uppercase font-poppins tracking-[0.2em] text-pink-400/70">Honest Words</span>
                </div>

                {/* Elegant listing boxes with heart indicators on the left side */}
                <div className="space-y-3 pt-1">
                  {[
                    'I will always respect your decisions.',
                    'I will never disturb your peace again.',
                    'I will pray for your happiness.',
                    'I will become a better person.',
                    'I will always cherish our memories.',
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.075] backdrop-blur-md border border-white/10 text-left group/vow relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-500/[0.03] to-transparent opacity-0 group-hover/vow:opacity-100 transition-opacity" />
                      <div className="h-7 w-7 shrink-0 rounded-full bg-pink-500/10 flex items-center justify-center text-[10px] text-pink-400 font-black border border-pink-500/20 shadow-[0_0_8px_rgba(236,72,153,0.2)]">
                        {idx + 1}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-pink-100/90 leading-snug font-poppins">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-8">
                <button
                  onClick={() => setActiveModal('promiseModal')}
                  className="group/btn cta-breath relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-emerald-200/24 bg-[linear-gradient(135deg,rgba(16,185,129,0.20),rgba(255,255,255,0.07),rgba(20,184,166,0.13))] px-6 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_26px_rgba(16,185,129,0.15)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200/45 hover:bg-emerald-400/12 hover:shadow-[0_16px_34px_rgba(16,185,129,0.24)] active:scale-95 cursor-pointer"
                >
                  <span className="pointer-events-none absolute inset-y-0 -left-12 w-10 rotate-12 bg-white/20 blur-md transition-transform duration-700 group-hover/btn:translate-x-[260px]" />
                  <CheckCircle className="relative h-4 w-4 text-emerald-200 transition-transform duration-300 group-hover/btn:scale-110" />
                  <span className="relative">Read My Promise</span>
                  <span className="relative rounded-full border border-emerald-100/20 bg-white/10 px-2 py-0.5 text-[8px] text-emerald-100/80">Read</span>
                </button>
              </div>
            </motion.div>

            {/* Bento Card 5: HEART ENVELOPE / QUOTATION LETTER (Col span 5) */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-5 relative overflow-hidden rounded-[30px] border border-white/15 bg-white/[0.075] backdrop-blur-[10px] shadow-[0_18px_46px_rgba(0,0,0,0.42)] p-8 flex flex-col justify-between text-center group"
              id="letter"
            >
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <img
                  src={messageHeartBg}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-[50%_39%] opacity-[0.55] saturate-[1.08] blur-[0.5px] transition-transform duration-2000 group-hover:scale-105 sm:object-[50%_36%] lg:object-[50%_42%]"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/56 via-[#3c142c]/34 to-black/78" />
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-br from-white/[0.12] via-pink-400/[0.05] to-transparent" />

              <div className="pointer-events-none absolute inset-x-0 top-7 z-[3] flex justify-center">
                <motion.div
                  animate={{ y: [0, -8, 0], opacity: [0.26, 0.42, 0.26] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative flex h-24 w-24 items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border border-dashed border-pink-200/25"
                  />
                  <div className="absolute inset-4 rounded-full border border-white/10 bg-white/[0.035] backdrop-blur-sm" />
                  <Sparkles className="relative h-7 w-7 text-pink-200/70" />
                </motion.div>
              </div>

              <div className="space-y-6 relative z-10 my-auto py-6">
                <span className="text-[48px] font-playfair text-pink-400 leading-none block drop-shadow-[0_0_12px_rgba(236,72,153,0.4)]">&ldquo;</span>
                
                <h4 className="font-cinzel text-xl sm:text-2xl font-black tracking-[0.2em] text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  From My Heart
                </h4>
                
                <p className="text-pink-100 font-playfair text-lg sm:text-xl leading-relaxed max-w-sm mx-auto italic font-medium">
                  Not because I needed you. <br />
                  But because my heart <br />
                  always chose you.
                </p>

                <motion.div
                  animate={{ y: [0, -5, 0], scale: [1, 1.04, 1] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative mx-auto my-6 flex h-20 w-20 items-center justify-center rounded-full border border-pink-300/25 bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_24px_rgba(236,72,153,0.18)] backdrop-blur-md"
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-2 rounded-full border border-dashed border-pink-300/20"
                  />
                  <MessageCircle className="h-8 w-8 text-pink-300" />
                </motion.div>
              </div>

              <div className="relative z-10 w-full pt-4">
                <button
                  onClick={() => setActiveModal('messageModal')}
                  className="group/btn cta-breath relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-violet-200/24 bg-[linear-gradient(135deg,rgba(139,92,246,0.22),rgba(255,255,255,0.075),rgba(59,130,246,0.13))] px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-violet-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_14px_30px_rgba(139,92,246,0.18)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200/45 hover:bg-violet-400/12 hover:shadow-[0_18px_36px_rgba(139,92,246,0.25)] active:scale-95 cursor-pointer"
                >
                  <span className="pointer-events-none absolute inset-y-0 -left-12 w-10 rotate-12 bg-white/20 blur-md transition-transform duration-700 group-hover/btn:translate-x-[300px]" />
                  <span className="relative transition-transform group-hover/btn:translate-x-0.5">Read My Soul's Letter</span>
                  <MessageCircle className="relative h-4 w-4 text-violet-100 transition-transform duration-300 group-hover/btn:scale-110" />
                  <span className="relative rounded-full border border-violet-100/20 bg-white/10 px-2 py-0.5 text-[8px] text-violet-100/80">Open</span>
                </button>
              </div>
            </motion.div>

            {/* Bento Card 6: PHOTO GRID GALLERY (Col span 3) */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-3 relative overflow-hidden rounded-[30px] border border-white/15 bg-white/[0.075] backdrop-blur-[10px] shadow-[0_18px_46px_rgba(0,0,0,0.42)] p-8 flex flex-col justify-between group"
              id="gallery"
            >
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <img
                  src={lookingLeft}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-[50%_38%] opacity-[0.52] saturate-[1.06] blur-[0.5px] transition-transform duration-1000 group-hover:scale-110 sm:object-[50%_35%] lg:object-[50%_45%]"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-[#321426]/38 to-black/80" />
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-br from-white/[0.10] via-pink-400/[0.04] to-transparent" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-xl sm:text-2xl font-black text-white tracking-[0.2em] uppercase">Moments</h3>
                  <span className="text-[10px] font-black uppercase font-poppins tracking-[0.2em] text-pink-400/50">FRAMES</span>
                </div>

                {/* Grid of 12 small memory and video thumbnails */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {momentFrameImages.map((item, i) => (
                    <div
                      key={item.src}
                      className="aspect-square rounded-xl bg-black/40 overflow-hidden border border-white/10 relative hover:border-pink-500/40 hover:scale-110 transition-all duration-500 group/thumb"
                    >
                      <img
                        src={item.src}
                        alt={`Memory frame ${i + 1}`}
                        style={{ objectPosition: item.pos }}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover grayscale-[18%] transition-all duration-700 group-hover/thumb:scale-110 group-hover/thumb:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-950/45 via-black/10 to-white/5 transition-opacity duration-500 group-hover/thumb:opacity-40" />
                      <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                      <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-black/45 backdrop-blur-sm">
                        <Heart className="h-2.5 w-2.5 text-pink-200 fill-pink-400/50" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-8">
                <button
                  onClick={() => {
                    setGalleryInitialTab('photos');
                    setActiveModal('galleryModal');
                  }}
                  className="group/btn cta-breath relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-rose-200/24 bg-[linear-gradient(135deg,rgba(251,113,133,0.22),rgba(255,255,255,0.07),rgba(249,115,22,0.13))] px-6 py-3.5 text-xs font-black uppercase tracking-widest text-rose-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_26px_rgba(251,113,133,0.16)] backdrop-blur-[6px] transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-200/45 hover:bg-rose-400/12 hover:shadow-[0_16px_34px_rgba(251,113,133,0.24)] active:scale-95 cursor-pointer"
                >
                  <span className="pointer-events-none absolute inset-y-0 -left-12 w-10 rotate-12 bg-white/20 blur-md transition-transform duration-700 group-hover/btn:translate-x-[230px]" />
                  <ImageIcon className="relative h-3.5 w-3.5 text-rose-100 transition-transform duration-300 group-hover/btn:scale-110" />
                  <span className="relative">Open Gallery</span>
                  <span className="relative rounded-full border border-rose-100/20 bg-white/10 px-2 py-0.5 text-[8px] text-rose-100/80">View</span>
                </button>
              </div>
            </motion.div>

          </div>
        </section>

        {/* SECTION: DECISION FORGIVENESS & MAGICAL BELL JAR */}
        <section id="forgive" className="scroll-mt-24 pt-12">
          <div className="relative overflow-hidden rounded-[40px] border border-white/[0.09] bg-black/[0.22] backdrop-blur-md shadow-[0_16px_46px_rgba(0,0,0,0.42)] p-8 sm:p-12 md:p-20 group">
            
            {/* Premium Inner Glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.055] via-pink-400/[0.018] to-transparent" />
            
            {/* Pulsing visual neon ring overlay */}
            <div className="absolute inset-8 rounded-[40px] border border-dashed border-white/[0.035] animate-[spin_180s_linear_infinite] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center relative z-10">
              
              {/* Question Text Desk Left */}
              <div className="lg:col-span-12 space-y-8 text-center max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-1px w-12 bg-gradient-to-r from-transparent to-pink-500" />
                  <span className="font-cinzel text-xs tracking-[0.4em] uppercase text-pink-400 font-black">Sacred Choice</span>
                  <div className="h-1px w-12 bg-gradient-to-l from-transparent to-pink-500" />
                </div>

                <h2 className="font-cinzel text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-widest leading-[1.1] uppercase">
                  Can You Find It In Your Heart?
                </h2>

                <p className="text-zinc-400 font-poppins text-base sm:text-lg leading-relaxed font-light">
                  I don't expect it to be easy. I just hope one day, you'll understand that my soul only knew how to love you. If you can find even a small spark of forgiveness, I will cherish it for eternity.
                </p>

                <p className="text-pink-300 font-playfair text-xl italic font-medium tracking-wide">
                  "If you forgive me, my world finds peace."
                </p>

                {/* INTERACTIVE CHOICE BUTTONS CONTROLLER */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
                  <button
                    onClick={() => handleForgiveChoice('yes')}
                    className={`px-10 py-5 font-black uppercase tracking-[0.2em] rounded-full text-sm shadow-2xl cursor-pointer transition-all duration-500 active:scale-95 flex items-center gap-3 relative overflow-hidden group/btn cta-breath hover:-translate-y-1 ${
                      forgiveResponse === 'yes'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/40'
                        : 'bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 text-white shadow-pink-500/30 hover:shadow-pink-500/60'
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    <span className="absolute -inset-1 rounded-full border border-pink-200/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                    <span className="relative z-10">Yes, I Forgive You</span>
                    <span className="relative z-10 text-xl">{forgiveResponse === 'yes' ? '✨💖' : '💖'}</span>
                  </button>

                  <button
                    onClick={() => handleForgiveChoice('thinking')}
                    className={`px-10 py-5 font-black uppercase tracking-[0.2em] rounded-full text-xs cursor-pointer transition-all duration-500 backdrop-blur-[6px] relative overflow-hidden group/btn-alt cta-breath hover:-translate-y-1 ${
                      forgiveResponse === 'thinking'
                        ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'border border-amber-200/18 hover:border-amber-300/38 bg-amber-100/[0.055] text-amber-100/85 hover:bg-amber-300/10'
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn-alt:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10">Still Thinking...</span>
                    {forgiveResponse === 'thinking' && <span className="ml-2 relative z-10 animate-pulse">⌛</span>}
                  </button>
                </div>

                {/* DYNAMIC FADE-IN RESPONSE TEXT */}
                <AnimatePresence mode="wait">
                  {forgiveResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      className={`p-10 rounded-[30px] border mt-10 text-center relative overflow-hidden transition-all duration-700 ${
                        forgiveResponse === 'yes'
                          ? 'border-emerald-500/30 bg-gradient-to-br from-[#06150c]/98 via-[#0c2415]/95 to-[#020704]/99 shadow-[0_0_60px_rgba(16,185,129,0.25)]'
                          : 'border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl'
                      }`}
                    >
                      {/* Premium Inner Glow */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-emerald-400/[0.02] to-transparent" />

                      {/* Sparkly decorative floating stars in YES card background */}
                      {forgiveResponse === 'yes' && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <div className="absolute top-4 left-10 text-emerald-400/20 text-2xl animate-pulse">✨</div>
                          <div className="absolute bottom-6 right-12 text-teal-400/15 text-3xl animate-bounce delay-700">🌸</div>
                          <div className="absolute top-12 right-20 text-emerald-300/10 text-lg animate-ping">💖</div>
                        </div>
                      )}

                        {forgiveResponse === 'yes' ? (
                          <div className="space-y-4 relative z-10">
                            <div className="flex flex-col items-center gap-4">
                              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">🥺</div>
                              <h4 className="font-cinzel text-2xl font-black text-emerald-300 tracking-[0.2em] uppercase">
                                My World Finds Its Peace
                              </h4>
                            </div>
                            <p className="font-poppins text-base md:text-lg text-zinc-300 leading-relaxed font-light max-w-2xl mx-auto">
                              Thank you, Dikshu. Your forgiveness is the most precious gift light has ever touched. I will honor your boundaries and protect your peace with my soul. You are, and always will be, respected above all else.
                            </p>
                            <div className="pt-1.5 flex items-center gap-1 text-xs text-emerald-400 font-mono">
                              <span>✨ Trust restored & protected forever</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 relative z-10">
                            <h4 className="font-serif text-base font-bold text-pink-200">Take all the time you need... ⌛</h4>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                              I completely understand. Your comfort, space, and peace are the absolute most important things to me. I will never push you. I will wait at a respectful distance, praying for your happiness and laughing always.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>

              {/* Magical interactive 3D Glass Jar Dome Right */}
              <div className="lg:col-span-12 flex w-full justify-center py-6">
                <Suspense fallback={ambientFallback}>
                  <MagicalBellJar3D />
                </Suspense>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative border-t border-pink-500/10 py-10 text-center text-zinc-500/80 font-sans text-xs sm:text-sm z-30 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-serif font-black tracking-widest text-pink-300 text-sm">FOR DIKSHU</span>
            <span>💖</span>
          </div>
          <p className="font-medium text-pink-200/40">
            Made with apology, honesty, respect, and infinite hope.
          </p>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] font-mono text-zinc-600">
              © {new Date().getFullYear()} Omkar. All decisions respected.
            </p>
            <div className="flex items-center gap-4 mt-1">
              <button
                onClick={() => setAdminOpen(true)}
                className="flex items-center gap-1 text-[10px] font-mono text-zinc-600/50 hover:text-pink-400/70 transition-colors cursor-pointer focus:outline-none"
              >
                <Lock className="h-2.5 w-2.5" />
                <span>Admin Console Keys</span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('dikshu_authenticated');
                  window.location.reload();
                }}
                className="flex items-center gap-1 text-[10px] font-mono text-red-600/50 hover:text-red-400 transition-colors cursor-pointer focus:outline-none"
              >
                <LogOut size={10} />
                <span>Logout & See Login Page</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* APOLOGY OVERLAY MODALS SYSTEM */}
      {activeModal && (
        <Suspense fallback={null}>
          <ApologyModals
            activeModal={activeModal}
            galleryInitialTab={galleryInitialTab}
            onClose={() => setActiveModal(null)}
          />
        </Suspense>
      )}

      {/* SECURE ADMIN RESPONSE CONSOLE */}
      {adminOpen && (
        <Suspense fallback={null}>
          <AdminPanel
            isOpen={adminOpen}
            onClose={() => setAdminOpen(false)}
            onLogoutSite={() => {
              localStorage.removeItem('dikshu_authenticated');
              window.location.reload();
            }}
          />
        </Suspense>
      )}

    </div>
  );
}
