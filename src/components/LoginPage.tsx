import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, User, Lock, HeartHandshake, Mail, Smartphone, Eye, EyeOff } from 'lucide-react';
import accessBg from '../assets/images/optimized/Only-You-Have-My-Access.webp';

interface LoginPageProps {
  onLogin: (name: string) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: 'heart' | 'sparkle';
}

type LoginMode = 'gmail' | 'whatsapp' | 'name';

const LOGIN_MODES: Array<{
  id: LoginMode;
  label: string;
  icon: typeof Mail;
  inputType: React.HTMLInputTypeAttribute;
  placeholder: string;
  autoComplete: string;
}> = [
  {
    id: 'name',
    label: 'Name',
    icon: User,
    inputType: 'text',
    placeholder: 'Enter your name',
    autoComplete: 'username',
  },
  {
    id: 'gmail',
    label: 'Gmail',
    icon: Mail,
    inputType: 'email',
    placeholder: 'Enter Gmail address',
    autoComplete: 'email',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: Smartphone,
    inputType: 'tel',
    placeholder: 'Enter WhatsApp mobile number',
    autoComplete: 'tel',
  },

];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loginMode, setLoginMode] = useState<LoginMode>('gmail');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const activeMode = LOGIN_MODES.find((mode) => mode.id === loginMode) || LOGIN_MODES[0];
  const ActiveIcon = activeMode.icon;

  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 18 + 10,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 5,
      type: Math.random() > 0.5 ? 'heart' : 'sparkle',
    }));
    setParticles(generated);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    if (!trimmedName || !trimmedCode) {
      setError('Enter your selected login detail and choose a password.');
      triggerShake();
      return;
    }

    if (loginMode === 'gmail' && !/^[^\s@]+@gmail\.com$/i.test(trimmedName)) {
      setError('Enter a valid Gmail address.');
      triggerShake();
      return;
    }

    if (loginMode === 'whatsapp' && trimmedName.replace(/\D/g, '').length < 7) {
      setError('Enter a valid WhatsApp mobile number.');
      triggerShake();
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: trimmedName, loginMode, name: trimmedName, secretCode: trimmedCode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLogin(trimmedName);
      } else {
        setError(data.error || 'Wrong password for this login detail.');
        triggerShake();
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-[#05010a] font-poppins">
      
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center transition-all duration-1000 scale-[1.02]"
        style={{
          backgroundImage: "url('/image/optimized/memory-8.webp')",
          filter: 'blur(1.5px) brightness(0.52) saturate(1.04)',
        }}
      />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(236,72,153,0.08),transparent_34%),radial-gradient(circle_at_82%_74%,rgba(168,85,247,0.1),transparent_38%),linear-gradient(115deg,rgba(0,0,0,0.84),rgba(10,2,16,0.52),rgba(0,0,0,0.88))] z-0" />

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: '110%' }}
              animate={{ 
                opacity: [0, 0.4, 0.4, 0], 
                y: '-10%',
                x: `${p.x + (Math.sin(p.id) * 10)}%`
              }}
              transition={{
                delay: p.delay,
                duration: p.duration,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                bottom: '-20px',
              }}
              className="text-pink-500/30"
            >
              {p.type === 'heart' ? <Heart size={p.size} fill="currentColor" /> : <Sparkles size={p.size} />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          x: isShaking ? [0, -10, 10, -10, 10, 0] : 0
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 100, 
          damping: 25,
          x: { duration: 0.5 }
        }}
        className="relative z-20 w-full max-w-md group"
      >
        {/* Outer Glow Wrapper */}
        <div className="absolute -inset-2 bg-gradient-to-r from-pink-400/[0.08] via-purple-400/[0.10] to-white/[0.08] rounded-[34px] blur-3xl opacity-[0.55] group-hover:opacity-[0.75] transition-opacity duration-700" />
        
        <div className="relative overflow-hidden rounded-[30px] border border-white/[0.15] bg-black/[0.35] backdrop-blur-xl shadow-[0_18px_52px_rgba(0,0,0,0.55)] p-8 md:p-10 flex flex-col items-center">
          {/* Ambient inner glow overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-pink-300/[0.025] to-black/10" />
          
          {/* Decorative image background blending */}
          <div className="absolute inset-0 z-0 opacity-25 mix-blend-soft-light pointer-events-none">
            <img src={accessBg} className="w-full h-full object-cover scale-105 brightness-[0.92] saturate-[0.95]" alt="access decor" />
          </div>

          {/* Header Visual */}
          <div className="relative mb-10 z-10">
            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative bg-white/[0.08] backdrop-blur-xl p-5 rounded-[22px] border border-white/20 shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            >
              <Lock className="w-7 h-7 text-pink-200" />
            </motion.div>
          </div>

          {/* Titles */}
          <div className="text-center space-y-3 mb-10 relative z-10">
            <h1 className="text-4xl font-extrabold text-white tracking-normal font-playfair italic">
              Private Space
            </h1>
            <p className="text-pink-100/60 font-cinzel text-xs tracking-[0.3em] uppercase">
              Create Or Return Access
            </p>
            <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-pink-500/40 to-transparent mx-auto mt-6" />
          </div>

          <div className="relative z-10 mb-7 grid w-full grid-cols-3 gap-2">
            {LOGIN_MODES.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => {
                  setLoginMode(id);
                  setName('');
                  setError(null);
                }}
                className={`flex min-h-[38px] items-center justify-center gap-1.5 rounded-2xl border px-2.5 py-2 text-[9px] font-black uppercase tracking-widest backdrop-blur-md transition-all active:scale-[0.97] ${
                  loginMode === id
                    ? 'border-pink-200/[0.45] bg-pink-500/[0.18] text-white shadow-[0_0_20px_rgba(236,72,153,0.18)]'
                    : 'border-white/[0.12] bg-black/25 text-pink-100/[0.65] hover:border-pink-300/[0.30] hover:bg-white/[0.06]'
                }`}
                aria-pressed={loginMode === id}
              >
                <Icon className="h-3 w-3 text-pink-300/70" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6 relative z-10 font-poppins">
            <div className="space-y-4">
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/input:text-pink-400 transition-colors">
                  <ActiveIcon size={18} />
                </div>
                <input
                  type={activeMode.inputType}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={activeMode.placeholder}
                  autoComplete={activeMode.autoComplete}
                  className="w-full bg-black/30 backdrop-blur-md border border-white/[0.15] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/[0.32] focus:outline-none focus:ring-2 focus:ring-pink-400/[0.35] focus:border-pink-300/[0.45] transition-all text-sm tracking-wide shadow-inner font-medium"
                />
              </div>

              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/input:text-pink-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Create or Enter Password"
                  autoComplete="current-password"
                  className="w-full bg-black/30 backdrop-blur-md border border-white/[0.15] rounded-2xl py-4 pl-12 pr-12 text-white placeholder-white/[0.32] focus:outline-none focus:ring-2 focus:ring-pink-400/[0.35] focus:border-pink-300/[0.45] transition-all text-sm tracking-wide shadow-inner font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/35 transition-colors hover:text-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-500/[0.08] border border-red-300/20 text-red-100 rounded-xl p-4 text-[11px] text-center font-bold uppercase tracking-wider backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group relative mt-2 min-h-[58px] w-full overflow-hidden rounded-2xl border border-pink-100/30 bg-[linear-gradient(135deg,rgba(236,72,153,0.96),rgba(217,70,239,0.92),rgba(168,85,247,0.94))] py-[18px] shadow-[0_18px_36px_rgba(168,85,247,0.26)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_34%)]" />
              <motion.div
                className="absolute inset-y-0 -left-24 w-20 rotate-12 bg-white/[0.22] blur-md"
                animate={{ x: ['0%', '520%'] }}
                transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-white/[0.06]" />
              <div className="relative flex items-center justify-center gap-3 text-white font-bold text-xs tracking-[0.2em] uppercase">
                <span>{isSubmitting ? 'Checking Access' : 'Enter Or Create Access'}</span>
                <motion.span
                  animate={{ scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <HeartHandshake size={18} />
                </motion.span>
              </div>
            </motion.button>
          </form>

          <p className="relative z-10 mt-5 max-w-xs text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white/[0.28]">
            First login saves this password for your identifier.
          </p>

          {/* Footer Badge */}
          <div className="mt-14 flex items-center gap-3 py-2.5 px-5 rounded-full bg-white/[0.03] border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] font-cinzel">
              Encrypted Heart Archive
            </span>
          </div>
        </div>

        {/* Footer Subtle */}
        <div className="mt-10 text-center">
          <p className="text-white/20 text-[10px] font-bold tracking-[0.2em] uppercase font-cinzel">
            Dedicated to <span className="text-pink-500/40">D</span> with <Heart size={8} className="inline fill-pink-500/20 text-pink-500/20 mx-0.5 translate-y-[-1px]" />
          </p>
        </div>
      </motion.div>
    </div>
  );
}
