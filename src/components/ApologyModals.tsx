/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Sparkles, AlertCircle } from 'lucide-react';
import messageHeartBg from '../assets/images/optimized/A-message-from-my-heart.webp';
import aboutMePhoto from '../assets/images/optimized/About-Me.webp';
import listeningMusic from '../assets/images/optimized/Dikshu-Listening-Music.webp';
import lookingLeft from '../assets/images/optimized/Me-Looking-In-Left-Side.webp';
import lookingRight from '../assets/images/optimized/Dikshu-Looking-At-Right-Side.webp';
import MemoryGallery from './MemoryGallery';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  bgImage?: string;
}

// Reusable elegant glass-modal
export function BaseModal({ isOpen, onClose, title, children, bgImage }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop lock */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.06] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)] w-full max-w-4xl max-h-[85vh] text-white custom-scrollbar z-10 flex flex-col"
          >
            {/* Decorative ambient overlay gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-pink-400/[0.04] to-transparent z-0" />

            {/* Background image */}
            <div
              className="absolute inset-0 -z-10 bg-cover bg-top opacity-[0.80] md:opacity-[0.85] transition-opacity duration-300"
              style={{
                backgroundImage: `url('${bgImage || "/image/optimized/memory-8.webp"}')`,
              }}
            />

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-[#1b0012]/40 to-black/75" />

            {/* Glowing orbs */}
            <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-pink-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 rounded-full border border-pink-300/25 bg-white/10 p-2 text-pink-200 hover:bg-pink-500/20 transition-all z-20 cursor-pointer"
              title="Close"
            >
              <X className="h-[18px] w-[18px]" />
            </button>

            {/* Header / Title */}
            <div className="relative z-10 border-b border-white/10 p-6 md:px-8 md:py-6 text-left flex items-center justify-between">
              <h2 className="flex items-center gap-3 font-cinzel text-xl md:text-2xl font-bold text-pink-100 pr-10 tracking-widest uppercase">
                <Sparkles className="h-5 w-5 text-pink-400 animate-pulse" />
                {title}
              </h2>
            </div>

            {/* Body content with scrolling inside */}
            <div className="relative z-10 font-poppins text-white/90 leading-relaxed text-sm md:text-base p-6 md:p-8 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Specific Polaroid fallback card for error states
export function PolaroidImageCard({ src, caption, desc }: { src: string; caption: string; desc: string; key?: React.Key }) {
  const [hasError, setHasError] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -8, rotate: Math.random() * 2 - 1 }}
      className="bg-white p-3.5 pb-6 rounded-sm shadow-2xl shadow-black/60 border border-neutral-200/20 text-neutral-800 font-poppins max-w-[280px] mx-auto w-full flex flex-col"
    >
      <div className="relative aspect-square w-full rounded-xs bg-pink-900/10 overflow-hidden mb-4 border border-neutral-100">
        {!hasError ? (
          <img
            src={src}
            alt={caption}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-purple-900/50 via-pink-800/40 to-indigo-900/40 flex flex-col items-center justify-center p-4 text-center text-pink-100 relative">
            <Sparkles className="h-8 w-8 text-pink-300 mb-2 animate-pulse" />
            <span className="text-xs uppercase font-mono tracking-widest opacity-90 leading-tight">Dreamy Memory</span>
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-pink-950/20 pointer-events-none" />
          </div>
        )}
      </div>
      <div className="px-1">
        <h4 className="font-cinzel font-bold text-sm tracking-widest text-pink-950 leading-tight mb-2 uppercase">{caption}</h4>
        <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 90,
      damping: 14
    }
  }
};

interface ModalsManagerProps {
  activeModal: string | null;
  galleryInitialTab?: 'photos' | 'videos' | 'google-photos';
  onClose: () => void;
}

export function ApologyModals({ activeModal, galleryInitialTab = 'photos', onClose }: ModalsManagerProps) {
  return (
    <>
      {/* 1. ABOUT ME MODAL */}
      <BaseModal 
        isOpen={activeModal === 'aboutModal'} 
        onClose={onClose} 
        title="About Me" 
        bgImage={aboutMePhoto}
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 text-left"
        >
          {/* Who am I card */}
          <motion.div 
            variants={itemVariants}
            className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] space-y-4 font-montserrat"
          >
            <h4 className="text-white font-bold tracking-wide uppercase text-lg sm:text-xl">Who am I?</h4>
            <p className="text-pink-200 font-bold text-base">I’m Omkar.</p>
            <p className="text-white/70">Just an ordinary boy with an extraordinary feeling that stayed in his heart for years.</p>
            <p className="text-white/70">I was never perfect. I made mistakes. Many mistakes. Sometimes too many. Sometimes the kind that hurt the person I never wanted to hurt.</p>
            <p className="border-l-4 border-pink-500/40 pl-5 py-3 italic bg-white/[0.02] rounded-r-2xl text-pink-100 leading-relaxed">
              "But behind every mistake, there was never hatred… only a heart that loved too deeply and didn’t know how to handle that love properly."
            </p>
          </motion.div>

          {/* How it started card */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] font-cormorant"
          >
            <h4 className="text-white text-3xl font-bold mb-6 tracking-normal">
              <i>How It Started</i>
            </h4>

            <div className="max-w-2xl space-y-4 text-xl sm:text-1xl leading-relaxed text-white/80">
              <p>It didn’t begin as love.</p>
              <p>Back in 5th grade, it was just a small liking.</p>
              <p>A quiet attraction.</p>
              <p>A simple childhood feeling.</p>
              <p>But days became months.</p>
              <p>Months became years.</p>
              <p>And without even realizing it, that small feeling grew into something much deeper.</p>
              <p>By the time I reached 8th standard, I finally understood:</p>
            </div>

            <div className="mt-8 space-y-4 pl-6 border-l border-pink-400/30">
              <p className="text-pink-100 italic text-2xl sm:text-2xl font-medium">
                This wasn’t just liking anymore.
              </p>
              <p className="text-pink-200 italic text-2xl sm:text-2x1 font-medium">
                This was love.
              </p>
              <p className="text-pink-300 italic text-2xl sm:text-2x1 font-medium">
                Real love.
              </p>
              <p className="text-white italic text-2xl sm:text-2x1 font-medium">
                The kind that stays even when life changes.
              </p>
            </div>
          </motion.div>

          {/* Why her card */}
          <motion.div 
            variants={itemVariants}
            className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] space-y-5 font-playfair"
          >
            <h4 className="text-white text-2xl sm:text-3xl font-bold tracking-normal">Why her?</h4>
            <div className="text-white/70 space-y-4 text-base sm:text-lg">
              <p>People often ask why we love someone. But honestly… I don’t have an exact reason. And maybe true love doesn’t always need one.</p>
              <p>I didn’t love her because of one smile. Or because of one moment. Or because of one reason.</p>
            </div>
            <p className="text-pink-100 font-semibold bg-white/[0.04] p-5 rounded-2xl border border-white/10 italic text-lg shadow-inner">
              "I loved her because somewhere, slowly, silently… my heart chose her. And once it did, it never looked away."
            </p>
          </motion.div>

          {/* Mistakes card */}
          <motion.div 
            variants={itemVariants}
            className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] space-y-4 font-mono text-xs sm:text-sm"
          >
            <h4 className="text-white/60 font-bold uppercase tracking-widest text-base mb-2">My mistakes</h4>
            <div className="text-white/40 space-y-3 tracking-normal">
              <p>Yes... </p> 
              <p> I made many mistakes. Some I understand. Some maybe I still don’t fully understand.</p>
              <p>Sometimes my feelings became too much. Sometimes I crossed emotional boundaries.</p>
              <p>Sometimes I wanted her happiness so badly… that I forgot happiness cannot be forced.</p>
              <p className="text-white/80 mt-4 leading-relaxed">And maybe the biggest mistake was wanting to become her happiness instead of simply respecting her peace.</p>
            </div>
            <p className="text-pink-300 font-bold flex items-center gap-2 mt-4">
              <AlertCircle size={14} />
              For that… I am truly sorry.
            </p>
          </motion.div>

          {/* Lessons card */}
          <motion.div 
            variants={itemVariants}
            className="rounded-3xl border border-pink-300/15 bg-black/45 p-5 backdrop-blur-md shadow-lg shadow-pink-500/10 space-y-3"
          >
            <h4 className="text-pink-300 font-serif text-xl font-bold">What I learned</h4>
            <div className="space-y-2 pl-2">
              <p className="flex items-center gap-2"><Heart className="h-4 w-4 text-pink-400 fill-pink-500/20" /> <span>Love without respect becomes pain.</span></p>
              <p className="flex items-center gap-2"><Heart className="h-4 w-4 text-pink-400 fill-pink-500/20" /> <span>Love without patience becomes pressure.</span></p>
              <p className="flex items-center gap-2"><Heart className="h-4 w-4 text-pink-400 fill-pink-500/20" /> <span>Love without understanding becomes a mistake.</span></p>
            </div>
            <p className="mt-3">I learned that. And I promise— those mistakes will never define the person I become.</p>
            <p className="mt-2 text-pink-200 font-medium text-xs sm:text-sm">If life ever gives me one chance to rebuild trust… I will protect it with everything I have. Because trust is more precious than feelings.</p>
          </motion.div>

          {/* Request understanding card */}
          <motion.div 
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-pink-500/5 backdrop-blur-sm p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] space-y-5 font-cormorant shadow-pink-500/5"
          >
            <h4 className="text-white text-3xl font-bold tracking-normal italic">What I want you to understand</h4>
            <div className="space-y-4">
              <p className="font-cursive text-2xl sm:text-3xl text-pink-300 leading-tight">
                "I don’t want pity. I don’t want forced love. I don’t want guilt."
              </p>
              <div className="text-white/80 text-xl space-y-3">
                <p className="font-bold underline decoration-pink-500/30 underline-offset-8">I only want you to understand one thing:</p>
                <p>What I felt was real. Even when I handled it badly. Even when I made mistakes. Even when I failed.</p>
                <p className="border-l-2 border-pink-400/40 pl-6 text-pink-100/90 leading-relaxed italic">
                  And yes… there were years where loving you silently hurt more than I could explain. But even then… my feelings were never fake.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </BaseModal>

      {/* 2. HOW IT STARTED (Keep as empty but compatible modal just in case, though it is not active in buttons) */}
      <BaseModal 
        isOpen={activeModal === 'startModal'} 
        onClose={onClose} 
        title="How It Started"
        bgImage={aboutMePhoto}
      >
        <div className="rounded-3xl border border-pink-300/15 bg-black/45 p-5 backdrop-blur-md shadow-lg shadow-pink-500/10 space-y-4 text-left">
          <p>It didn’t begin as love. Back in the fifth standard, it was just a small liking — a quiet attraction, a simple childhood feeling that I couldn't explain.</p>
          <p>Days became months. Months became years. Without realizing it, that small initial spark grew deeper and deeper into a constant warmth.</p>
          <p>By the eighth standard, I finally understood: this was not just liking anymore. This was a profound love — the rare kind that stays with you, guiding your thoughts even when everything around you changes.</p>
        </div>
      </BaseModal>

      {/* 3. WHAT I LEARNED (Keep as empty but compatible modal just in case, though it is not active in buttons) */}
      <BaseModal 
        isOpen={activeModal === 'learnModal'} 
        onClose={onClose} 
        title="What I Learned"
        bgImage={listeningMusic}
      >
        <div className="rounded-3xl border border-pink-300/15 bg-black/45 p-5 backdrop-blur-md shadow-lg shadow-pink-500/10 space-y-4 text-left">
          <p className="font-serif text-lg text-pink-300 font-medium">Lessons Bought With Pain...</p>
          <ul className="space-y-2.5 list-disc list-inside bg-white/5 p-4 rounded-2xl border border-pink-500/10">
            <li><span className="text-pink-300 font-semibold">Respect First:</span> Love without respect becomes pain for the other person.</li>
            <li><span className="text-pink-300 font-semibold">Patience:</span> Love without patience becomes burdening pressure.</li>
            <li><span className="text-pink-300 font-semibold">Acceptance:</span> A person's peace, comfort, safety, and choices always come first.</li>
          </ul>
          <p>If life ever grants me a chance to rebuild even a tiny sliver of trust, I will protect it with everything I have — because trust is more precious than any promise.</p>
        </div>
      </BaseModal>

      {/* 4. WHY YOU MATTER TO ME MODAL */}
      <BaseModal 
        isOpen={activeModal === 'matterModal'} 
        onClose={onClose} 
        title="Why You Matter To Me" 
        bgImage={lookingRight}
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 text-left"
        >
          {/* Quick highlights block like in screenshot */}
          <motion.div 
            variants={itemVariants}
            className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col md:flex-row items-center justify-between gap-8 font-playfair"
          >
            <div className="space-y-6 flex-1 w-full text-left">
              <h3 className="text-3xl font-bold text-pink-100 tracking-normal">Why You Matter</h3>
              <div className="space-y-3 font-medium">
                <div className="flex items-center gap-4 text-white/80"><Heart className="h-5 w-5 text-pink-400 fill-pink-500/30 animate-pulse" /> <span className="text-lg">You are highly special to me</span></div>
                <div className="flex items-center gap-4 text-white/80"><Heart className="h-5 w-5 text-pink-400 fill-pink-500/30 animate-pulse" /> <span className="text-lg">You changed my path & life</span></div>
                <div className="flex items-center gap-4 text-white/80"><Heart className="h-5 w-5 text-pink-400 fill-pink-500/30 animate-pulse" /> <span className="text-lg">You made me a better person</span></div>
                <div className="flex items-center gap-4 text-white/80"><Heart className="h-5 w-5 text-pink-400 fill-pink-500/30 animate-pulse" /> <span className="text-lg">You hold the kindest heart</span></div>
                <div className="flex items-center gap-4 text-white/80"><Heart className="h-5 w-5 text-pink-400 fill-pink-500/30 animate-pulse" /> <span className="text-lg">You deserve cosmic happiness</span></div>
              </div>
            </div>

            {/* Decorative Heart image placeholder block to mimic mockup */}
            <div className="h-40 w-40 rounded-[35px] bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center p-4 relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-blue-500/10 blur-2xl" />
              <Heart className="h-16 w-16 text-pink-400 fill-pink-500/30 animate-pulse relative z-10" />
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-pink-300 mt-3 relative z-10 font-bold drop-shadow-md">Infinite</span>
            </div>
          </motion.div>

          {/* Deep Explanation blocks */}
          <motion.div 
            variants={itemVariants}
            className="rounded-3xl border border-pink-300/15 bg-black/45 p-5 backdrop-blur-md shadow-lg shadow-pink-500/10 space-y-4"
          >
            <h3 className="font-serif text-2xl font-bold text-pink-200">Why Do You Matter To Me?</h3>
            <p>This is the hardest question. Because if someone asked me for one exact reason… I honestly wouldn’t know how to answer.</p>
            <p>Love like this never came to me like logic. It didn’t arrive with explanations. It just happened. Slowly. Silently.</p>
            <p className="font-bold text-pink-100 text-base">And then one day, I realized my heart had already chosen you long before I understood what that meant.</p>

            <div className="pt-2 space-y-4">
              <div className="p-4 rounded-2xl bg-black/50 border border-pink-500/10 space-y-1.5 hover:border-pink-500/30 transition-all">
                <p className="font-semibold text-pink-300 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 fill-pink-500/20" /> A Haven from the Noise
                </p>
                <p className="text-pink-100/95 text-xs sm:text-sm leading-relaxed">
                  You matter to me because when I see you… something changes inside me. The noise in my mind becomes quieter. For a moment, life feels lighter. For a moment, happiness feels possible. And even if that feeling is only mine, it is real.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-pink-500/10 space-y-1.5 hover:border-pink-500/30 transition-all">
                <p className="font-semibold text-pink-300 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 fill-pink-500/20" /> Deeply Connected to My Growing Years
                </p>
                <p className="text-pink-100/95 text-xs sm:text-sm leading-relaxed">
                  You matter because you became part of my growing years. Not just as someone I liked— but as someone connected to my memories, my childhood, and the version of me that was learning what emotions even mean.
                </p>
                <p className="text-pink-200/80 text-[11px] sm:text-xs italic border-t border-pink-500/5 pt-1.5">
                  Some people become important through grand moments. You became important through time. And somehow… time made that feeling deeper.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-pink-500/10 space-y-1.5 hover:border-pink-500/30 transition-all">
                <p className="font-semibold text-pink-300 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 fill-pink-500/20" /> A Catalyst for Betterment
                </p>
                <p className="text-pink-100/95 text-xs sm:text-sm leading-relaxed">
                  You matter because you changed me. Maybe without even trying. You made me think about becoming better. Working harder. Taking care of myself. Dreaming bigger. Trying to become someone worthy of respect. Even if you never knew that.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-pink-500/10 space-y-1.5 hover:border-pink-500/30 transition-all">
                <p className="font-semibold text-pink-300 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 fill-pink-500/20" /> A Heart of Pure Intentions
                </p>
                <p className="text-pink-100/95 text-xs sm:text-sm leading-relaxed">
                  You matter because your happiness mattered to me. Even in moments where I handled my feelings badly. Even when I made mistakes. Even when my emotions became messy. The truth underneath all of that was simple: I wanted good things for you.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/20 space-y-1.5">
                <p className="font-semibold text-pink-300 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 fill-pink-500/30 animate-pulse" /> Painful but Precious Lessons
                </p>
                <p className="text-pink-100/95 text-xs sm:text-sm leading-relaxed">
                  You matter because loving you taught me painful lessons. That love needs respect. That love needs boundaries. That feelings alone are not enough. That caring about someone also means accepting their freedom. Those lessons hurt. But they changed me.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Genuine disclaimer */}
          <motion.div 
            variants={itemVariants}
            className="rounded-3xl border border-pink-300/15 bg-black/45 p-5 backdrop-blur-md shadow-lg shadow-pink-500/10 space-y-3"
          >
            <p className="text-pink-100 font-semibold mb-1 text-sm sm:text-base">You matter because even when I struggled emotionally… my feelings were never fake.</p>
            <div className="flex gap-4 text-xs font-mono text-pink-400">
              <span>Imperfect? <strong className="text-pink-300 font-bold font-sans">Yes.</strong></span>
              <span>Messy? <strong className="text-pink-300 font-bold font-sans">Yes.</strong></span>
              <span>But fake? <strong className="text-pink-300 font-bold font-sans">Never.</strong></span>
            </div>
          </motion.div>

          {/* Beautiful finish scrolling view */}
          <motion.div 
            variants={itemVariants}
            className="bg-[#1c0827]/60 p-5 rounded-3xl border border-pink-500/15 shadow-xl shadow-pink-500/5 space-y-3"
          >
            <p className="text-xs sm:text-sm leading-relaxed">You matter because some people leave marks on a heart without trying. And whether life brings closeness or distance… those marks remain.</p>
            <p className="text-xs sm:text-sm leading-relaxed">You matter because somewhere deep inside me… you became part of my story. And stories like that are hard to explain in simple words.</p>
            <p className="font-serif font-black text-pink-200 text-sm md:text-base border-t border-pink-500/5 pt-2">
              But most importantly— you matter not because I want to own your heart. You matter because my heart learned to care for yours. Even from a distance. Even imperfectly. Even now.
            </p>
          </motion.div>
        </motion.div>
      </BaseModal>

      {/* 5. PROMISE MODAL */}
      <BaseModal 
        isOpen={activeModal === 'promiseModal'} 
        onClose={onClose} 
        title="I Promise You" 
        bgImage={listeningMusic}
      >
        <div className="space-y-6 text-left">
          <div className="rounded-3xl border border-pink-300/15 bg-black/45 p-5 backdrop-blur-md shadow-lg shadow-pink-500/10 space-y-2">
            <p className="text-pink-100 font-semibold">My promises were many. Some I failed to keep. And that truth hurts me.</p>
            <p className="text-pink-300/90 text-xs sm:text-sm leading-relaxed font-medium">
              That is why this time, I don’t want empty promises. I want honest ones. Promises built on growth. Promises built on respect. Promises I truly want to become worthy of keeping.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { num: 1, t: 'I will respect your decisions', d: 'Even when your answer hurts me. Even when your choice is different from what I wish. Your decisions are yours. And real love must respect that.' },
              { num: 2, t: 'I will protect your peace', d: 'If my presence ever became noise in your life… I am sorry. I never wanted to become stress in your world. I wanted to bring comfort. From now on, your peace matters deeply.' },
              { num: 3, t: 'I will never force my feelings onto you', d: 'Love should never feel like pressure. It should never feel like guilt. It should never feel like emotional weight. My feelings are mine to manage—not yours to carry.' },
              { num: 4, t: 'I will become a better person', d: 'Not just for you. But because I need to grow. Because love without maturity becomes pain. Because I want to become someone who knows how to care properly.' },
              { num: 5, t: 'I will cherish our memories', d: 'The childhood laughter. The playful fights. The teasing. The silly moments. Those memories mattered to me. And they always will.' },
              { num: 6, t: 'I will pray for your happiness', d: 'Whether close or far. Whether life brings us together or not. I will still hope life gives you peace, health, safety, and real happiness.' },
              { num: 7, t: 'I will protect your boundaries', d: 'If I ever crossed them before— I am sorry. Now I understand how important boundaries are. And I will honor them.' },
              { num: 8, t: 'I will learn self-control', d: 'Because emotions without control can hurt people. And I never wanted my feelings to become something painful for you. So I will learn. And I will do better.' },
              { num: 9, t: 'I will never intentionally hurt you', d: 'Not through words. Not through pressure. Not through emotional confusion. That was never my intention. And it never will be.' },
              { num: 10, t: 'I will stay honest', d: 'No pretending. No fake promises. No dramatic words. Only truth. Because trust can only grow where honesty exists.' },
              { num: 11, t: 'I will protect what trust remains', d: 'If life ever gives me even a small chance to rebuild trust— I will protect it carefully. Because trust is more precious than promises.' },
              { num: 12, t: 'I will respect your freedom', d: 'Love is not ownership. Love is not control. Love is caring for someone while still respecting their right to choose. That is what I understand now.' }
            ].map((p) => (
              <div 
                key={p.num} 
                className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-pink-500/30 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden flex gap-5 font-poppins"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12" />
                <span className="font-mono text-pink-400 font-extrabold text-xl flex-shrink-0 drop-shadow-sm">
                  {p.num.toString().padStart(2, '0')}.
                </span>
                <div className="space-y-2 relative z-10">
                  <h4 className="text-pink-100 font-cinzel font-bold text-sm tracking-widest uppercase">{p.t}</h4>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BaseModal>

      {/* 6. Message Letter MODAL */}
      <BaseModal 
        isOpen={activeModal === 'messageModal'} 
        onClose={onClose} 
        title="A Message From My Heart" 
        bgImage={messageHeartBg}
      >
        <div className="space-y-8 text-left font-poppins">
          {/* Section 1: Intro block */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              {/* Elegant floating portrait card */}
              <div className="relative w-48 h-64 rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex-shrink-0 bg-white/[0.05] group">
                <img
                  src={messageHeartBg}
                  alt="Beautiful Dikshu"
                  className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-x-3 bottom-3 py-2 rounded-xl border border-white/10 bg-black/40 text-center backdrop-blur-md">
                  <span className="font-cinzel text-[10px] tracking-[0.2em] uppercase text-pink-100 font-bold">Always Yours</span>
                </div>
              </div>
              
              <div className="space-y-6 flex-1 pt-2">
                <p className="font-playfair font-bold text-3xl text-pink-100 italic">Dear Dikshu,</p>
                <p className="text-pink-300 font-cursive text-3xl">Please forgive me.</p>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">I never truly wanted to hurt you, trouble you, or become a reason for your pain. But I know that many times, knowingly or unknowingly, I became exactly that. And for that, I am deeply sorry.</p>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">I am sorry for hiding things from you. The truth is, I was always scared. Scared of losing you. But now I understand that fear is never a reason to hide things from someone you truly care about.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Origin Story with floating styled boxes */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] space-y-6 font-cormorant">
            <p className="text-2xl sm:text-3xl leading-relaxed text-white/80">When I first started liking you in 5th grade, I didn’t understand what I was feeling. As years passed, that small feeling became deeper. By 8th grade, I understood that what I felt was love.</p>
            
            <div className="relative p-8 rounded-3xl bg-pink-500/5 border border-white/10 text-white/90 text-2xl sm:text-3xl space-y-3 shadow-inner text-center md:text-left italic">
              <p>I don’t love you because of one smile.</p>
              <p>I don’t love you because of one memory.</p>
              <p>I don’t love you because of one special moment.</p>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-pink-200 font-bold not-italic tracking-normal">I love you because somewhere, slowly and silently, my heart chose you.</p>
                <p className="text-pink-400 font-bold not-italic">And once it did, it never looked away.</p>
              </div>
            </div>
          </div>

          {/* Section 3: After confession impact */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] space-y-4 font-poppins">
            <p className="text-white/70 text-base sm:text-lg">After I confessed my feelings, I know things changed. I know I became difficult. I know there were times when I became too pushy because all I wanted was for you to understand me.</p>
            <p className="font-bold text-pink-300 bg-white/[0.04] p-6 rounded-2xl border border-white/10 text-lg sm:text-xl shadow-inner text-center">
              "But now I understand something important: My intentions do not erase your pain."
            </p>
          </div>

          {/* Section 4: Responsibility & Memory board */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] space-y-6 font-mono text-sm">
            <div className="bg-pink-500/5 p-6 border border-white/10 rounded-2xl shadow-inner">
              <p className="font-bold text-pink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertCircle size={16} />
                System Responsibility: ACTIVE
              </p>
              <p className="text-white/60">Even if I never meant to hurt you... if I still hurt you... then I must accept responsibility.</p>
              <p className="text-pink-100 font-bold mt-4 text-2xl tracking-normal">I am sorry.</p>
            </div>

            <div className="space-y-4 font-poppins text-white/70 text-base sm:text-lg">
              <p>You were one of the reasons I started taking life seriously. You made me think about becoming better.</p>
              <p>Even when things were difficult, there were still moments where you showed care—and I never forgot those moments.</p>

              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm font-mono text-pink-200 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span>The times we talked</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span>The memories we made</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span>The playful teasing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span>The silly conversations</span>
                </div>
                <div className="flex items-center gap-3 col-span-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span>The childhood memories we hold</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Real feelings affirmation */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] space-y-8">
            <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 text-center font-mono">
              <p className="text-xs uppercase tracking-[0.4em] text-pink-400 mb-6 drop-shadow-md">My Feelings Were Real</p>
              <div className="flex flex-wrap justify-center gap-8 text-lg sm:text-2xl font-cinzel text-white/50">
                <span className="flex items-center gap-2">Messy? <strong className="text-pink-100">Yes.</strong></span>
                <span className="flex items-center gap-2">Imperfect? <strong className="text-pink-100">Yes.</strong></span>
                <span className="flex items-center gap-2">Painful? <strong className="text-pink-100">Yes.</strong></span>
                <span className="flex items-center gap-2">But fake? <strong className="text-pink-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">Never.</strong></span>
              </div>
            </div>

            <div className="space-y-6 text-white/70 text-base sm:text-lg leading-relaxed font-poppins">
              <p>Still… I understand that real love cannot be forced. That is something I am still learning.</p>
              <p className="text-white font-semibold">I want to become someone who brings peace into your life, not pain. Someone who respects your feelings.</p>
              
              <div className="p-8 border-t border-white/10 space-y-6">
                <p className="font-playfair italic text-pink-200 font-bold text-center text-2xl sm:text-3xl leading-tight">
                  "Dikshu… I loved you in the only way I knew how. Maybe imperfectly. Maybe wrongly at times. But never falsely."
                </p>
                <div className="flex flex-col items-center gap-4 pt-4">
                  <div className="w-12 h-[1px] bg-white/20" />
                  <p className="text-center text-white/40 text-sm italic">And whether life brings us together or keeps us apart… I genuinely hope your life becomes beautiful, peaceful, and full of happiness.</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 pt-8">
                <span className="text-xs font-mono uppercase tracking-widest text-white/30">With honesty,</span>
                <span className="font-cursive text-4xl text-pink-300">Omkar</span>
              </div>
            </div>
          </div>
        </div>
      </BaseModal>

      {/* 7. FULL PHOTO GALLERY */}
      <BaseModal 
        isOpen={activeModal === 'galleryModal'} 
        onClose={onClose} 
        title="Full Memory Gallery" 
        bgImage={lookingLeft}
      >
        <MemoryGallery initialTab={galleryInitialTab} />
      </BaseModal>
    </>
  );
}
