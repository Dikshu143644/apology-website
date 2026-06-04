import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Lock, CheckCircle2, AlertCircle, RefreshCw, Trash2, 
  Calendar, Monitor, Globe, ShieldAlert, Key, Edit3, 
  Heart, Sparkles, User, LogOut, Check, ArrowRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import dikshuBg from '../assets/images/optimized/Dikshu-bg.webp';

interface ResponseItem {
  id: string;
  choice: 'yes' | 'thinking';
  timestamp: string;
  userAgent: string;
  ip: string;
}

interface LoginAttemptItem {
  id: string;
  name: string;
  code: string;
  success: boolean;
  status?: 'created' | 'matched' | 'password_mismatch' | string;
  timestamp: string;
  userAgent: string;
  ip: string;
}

interface LoginUserItem {
  id: string;
  identifier: string;
  identifierKind: 'name' | 'email' | 'mobile';
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
}

interface AdminPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  isFullScreen?: boolean;
  onLogoutSite?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function AdminPanel({ isOpen = true, onClose, isFullScreen = false, onLogoutSite }: AdminPanelProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  // Tables databases
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttemptItem[]>([]);
  const [loginUsers, setLoginUsers] = useState<LoginUserItem[]>([]);

  // Background particle systems
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100 + 10,
      size: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      duration: Math.random() * 8 + 6,
    }));
    setParticles(generated);
  }, []);

  // Autofill session credentials on mount/open
  useEffect(() => {
    const savedPasscode = localStorage.getItem('admin_session_passcode');
    if (savedPasscode) {
      setPasscode(savedPasscode);
      setIsAuthorized(true);
      fetchDashboardData(savedPasscode);
    }
  }, [isOpen]);

  const fetchDashboardData = async (authPasscode: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: {
          'X-Admin-Passcode': authPasscode,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResponses(data.responses || []);
        setLoginAttempts(data.loginAttempts || []);
        setLoginUsers(data.loginUsers || []);
      } else {
        setError(data.error || 'Session expired or unauthorized.');
        setIsAuthorized(false);
        localStorage.removeItem('admin_session_passcode');
      }
    } catch (err) {
      setError('Connection failure. Can not pull backend settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthorized(true);
        localStorage.setItem('admin_session_passcode', passcode);
        fetchDashboardData(passcode);
      } else {
        setError(data.error || 'Incorrect passcode. Access Denied.');
      }
    } catch (err) {
      setError('Connection failure. Failed to authenticate.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLoginUsers = async () => {
    if (!confirm('Reset all registered login accounts? Existing visitors will need to create access again.')) {
      return;
    }

    setIsActionPending(true);
    const activePasscode = passcode || localStorage.getItem('admin_session_passcode') || '';
    try {
      const res = await fetch('/api/admin/login-users/clear', {
        method: 'POST',
        headers: {
          'X-Admin-Passcode': activePasscode,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLoginUsers([]);
        setSuccessMsg('Registered login accounts reset successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(data.error || 'Failed to reset login accounts.');
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleRefresh = () => {
    const activePasscode = passcode || localStorage.getItem('admin_session_passcode') || '';
    if (activePasscode) {
      fetchDashboardData(activePasscode);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session_passcode');
    setIsAuthorized(false);
    setPasscode('');
    setResponses([]);
    setLoginAttempts([]);
    setLoginUsers([]);
    setSuccessMsg('Dashboard locked safely.');
    if (!isFullScreen && onClose) {
      onClose();
    }
  };

  const handleClearResponses = async () => {
    if (!confirm('Are you absolutely sure you want to clear all forgiveness responses? This cannot be undone.')) {
      return;
    }

    setIsActionPending(true);
    const activePasscode = passcode || localStorage.getItem('admin_session_passcode') || '';
    try {
      const res = await fetch('/api/admin/responses/clear', {
        method: 'POST',
        headers: {
          'X-Admin-Passcode': activePasscode,
        },
      });

      if (res.ok) {
        setResponses([]);
        setSuccessMsg('Forgiveness choices deleted successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError('Failed to clear records.');
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleClearLoginAttempts = async () => {
    if (!confirm('Are you absolutely sure you want to delete all login visitor logs? This cannot be undone.')) {
      return;
    }

    setIsActionPending(true);
    const activePasscode = passcode || localStorage.getItem('admin_session_passcode') || '';
    try {
      const res = await fetch('/api/admin/login-attempts/clear', {
        method: 'POST',
        headers: {
          'X-Admin-Passcode': activePasscode,
        },
      });

      if (res.ok) {
        setLoginAttempts([]);
        setSuccessMsg('Login visitor attempts deleted successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError('Failed to clear login attempts.');
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setIsActionPending(false);
    }
  };

  const parseBrowser = (ua: string) => {
    if (ua.includes('iPhone')) return 'iPhone Safari';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Android')) return 'Android Web';
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Safari')) return 'Safari (Mac)';
    if (ua.includes('Firefox')) return 'Firefox';
    return ua.substring(0, 22) + '...';
  };

  const dashboardContent = (
    <div className="relative w-full text-white font-poppins">
      <div 
        className="fixed inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{
          backgroundImage: `url(${dikshuBg})`,
          filter: 'blur(12px) brightness(0.2)',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-tr from-pink-950/40 via-black/90 to-purple-950/40 z-0" />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: '105vh', x: `${p.x}vw` }}
            animate={{
              opacity: [0, 0.35, 0.35, 0],
              y: '-10vh',
              x: [`${p.x}vw`, `${p.x + (Math.sin(p.id) * 3)}vw`],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute text-pink-500/10"
            style={{ fontSize: p.size }}
          >
            🌸
          </motion.div>
        ))}
      </div>

      <div className="relative w-full max-w-6xl mx-auto z-10 px-4 py-6 md:py-10 flex flex-col min-h-screen">
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-pink-400/[0.04] to-transparent" />
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-cinzel tracking-[0.2em] text-emerald-300 uppercase font-bold">
                Secure Live Console
              </span>
            </div>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white italic">
              Heart Control Room
            </h1>
            <p className="text-[10px] text-white/40 font-bold tracking-[0.1em] uppercase">
              Manage visitor accounts and view telemetry records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={handleRefresh}
              disabled={isLoading || isActionPending}
              className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/40 text-white text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg disabled:opacity-40 group"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-pink-400 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              <span className="font-cinzel tracking-wider uppercase text-[10px]">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/40 text-white text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
            >
              <Lock className="h-3.5 w-3.5 text-pink-400" />
              <span className="font-cinzel tracking-wider uppercase text-[10px]">Lock</span>
            </button>
            <button
              onClick={onLogoutSite}
              className="px-5 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-200 text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="font-cinzel tracking-wider uppercase text-[10px]">Site Logout</span>
            </button>
            {!isFullScreen && onClose && (
              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl border border-white/10 hover:border-white/30 text-white/40 hover:text-white transition-all bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 font-bold uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl backdrop-blur-md"
            >
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              {successMsg}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 font-bold uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl backdrop-blur-md"
            >
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-md p-8 shadow-xl">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4 relative z-10">
                <Key className="h-5 w-5 text-pink-400" />
                <h2 className="font-cinzel text-xs font-bold text-white uppercase tracking-[0.2em]">Access Mode</h2>
              </div>
              <div className="relative z-10 space-y-5">
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-5">
                  <p className="text-[10px] font-cinzel font-bold uppercase tracking-[0.22em] text-emerald-200">
                    Open First Login
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-white/50">
                    A new name, Gmail, or mobile creates access automatically. The same identifier must use the same password later.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <span className="text-2xl font-bold text-white">{loginUsers.length}</span>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-pink-300/50">Accounts</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                    <span className="text-2xl font-bold text-white">{loginUsers.reduce((sum, user) => sum + user.loginCount, 0)}</span>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-pink-300/50">Accesses</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearLoginUsers}
                  disabled={isActionPending || loginUsers.length === 0}
                  className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-red-100 transition-all hover:border-red-300/40 hover:bg-red-500/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Reset Login Accounts
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-md p-8 shadow-xl">
              <h3 className="font-cinzel text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">Metrics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                  <span className="text-2xl font-bold text-white">{loginUsers.length}</span>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-pink-300/50">Users</p>
                </div>
                <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                  <span className="text-2xl font-bold text-white">{responses.length}</span>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-pink-300/50">Choices</p>
                </div>
                <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                  <span className="text-2xl font-bold text-white">{loginAttempts.length}</span>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-pink-300/50">Visits</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-md p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <Heart size={20} className="text-pink-400 fill-pink-500/20" />
                  <h2 className="font-playfair text-xl font-bold text-white italic">Responses Telemetry</h2>
                </div>
                <button onClick={handleClearResponses} disabled={responses.length === 0} className="text-red-300 text-[10px] font-bold uppercase tracking-widest disabled:opacity-20 transition-opacity">Clear</button>
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar rounded-2xl border border-white/5 bg-black/20">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 font-cinzel text-[9px] tracking-[0.2em] uppercase">
                      <th className="p-5 font-bold">Choice</th>
                      <th className="p-5 font-bold">Time</th>
                      <th className="p-5 font-bold">Identity (IP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 text-white/60 hover:bg-white/5 transition-colors">
                        <td className="p-5">
                          <span className={`${item.choice === 'yes' ? 'text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'text-amber-400'} font-bold uppercase text-[10px] tracking-widest`}>
                            {item.choice === 'yes' ? 'YES 💖' : 'WAITING ⌛'}
                          </span>
                        </td>
                        <td className="p-5">{new Date(item.timestamp).toLocaleString()}</td>
                        <td className="p-5 font-mono text-[10px] opacity-40">{item.ip}</td>
                      </tr>
                    ))}
                    {responses.length === 0 && (
                      <tr><td colSpan={3} className="p-20 text-center opacity-20 uppercase font-cinzel tracking-widest text-[10px]">No telemetry found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-md p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <User size={20} className="text-pink-400" />
                  <h2 className="font-playfair text-xl font-bold text-white italic">Registered Accounts</h2>
                </div>
                <button onClick={handleClearLoginUsers} disabled={loginUsers.length === 0 || isActionPending} className="text-red-300 text-[10px] font-bold uppercase tracking-widest disabled:opacity-20 transition-opacity">Reset</button>
              </div>
              <div className="overflow-x-auto max-h-[320px] overflow-y-auto custom-scrollbar rounded-2xl border border-white/5 bg-black/20">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 font-cinzel text-[9px] tracking-[0.2em] uppercase">
                      <th className="p-5 font-bold">Identifier</th>
                      <th className="p-5 font-bold">Type</th>
                      <th className="p-5 font-bold">Logins</th>
                      <th className="p-5 font-bold">Last Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginUsers.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 text-white/60 hover:bg-white/5 transition-colors">
                        <td className="p-5 font-bold italic">{item.identifier}</td>
                        <td className="p-5">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-pink-200/70">
                            {item.identifierKind}
                          </span>
                        </td>
                        <td className="p-5 font-mono text-[10px] opacity-60">{item.loginCount}</td>
                        <td className="p-5 text-white/45">{new Date(item.lastLoginAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {loginUsers.length === 0 && (
                      <tr><td colSpan={4} className="p-16 text-center opacity-20 uppercase font-cinzel tracking-widest text-[10px]">No accounts registered</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-md p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <Monitor size={20} className="text-purple-400" />
                  <h2 className="font-playfair text-xl font-bold text-white italic">Visit History</h2>
                </div>
                <button onClick={handleClearLoginAttempts} disabled={loginAttempts.length === 0} className="text-red-300 text-[10px] font-bold uppercase tracking-widest disabled:opacity-20 transition-opacity">Format</button>
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar rounded-2xl border border-white/5 bg-black/20">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 font-cinzel text-[9px] tracking-[0.2em] uppercase">
                      <th className="p-5 font-bold">Visitor Identifier</th>
                      <th className="p-5 font-bold">Password</th>
                      <th className="p-5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginAttempts.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 text-white/60 hover:bg-white/5 transition-colors">
                        <td className="p-5 font-bold italic">{item.name}</td>
                        <td className="p-5 font-mono text-[10px] opacity-50">{item.code || 'Password hidden'}</td>
                        <td className="p-5 font-bold uppercase text-[9px] tracking-widest">
                          {item.success ? (
                            <span className="text-emerald-400">{item.status === 'created' ? 'Created' : 'Match'}</span>
                          ) : (
                            <span className="text-red-400">{item.status === 'password_mismatch' ? 'Wrong Password' : 'Deny'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {loginAttempts.length === 0 && (
                      <tr><td colSpan={3} className="p-20 text-center opacity-20 uppercase font-cinzel tracking-widest text-[10px]">Stream offline</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const authScreen = (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-[#05010a] font-poppins">
      <div 
        className="fixed inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{
          backgroundImage: `url(${dikshuBg})`,
          filter: 'blur(12px) brightness(0.2)',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-tr from-pink-950/40 via-black/90 to-purple-950/40 z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-20 w-full max-w-sm"
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 rounded-[34px] blur-3xl opacity-60" />
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-12 flex flex-col items-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-pink-400/[0.04] to-transparent" />
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity }} className="relative bg-white/10 p-5 rounded-[22px] border border-white/20 mb-10">
            <ShieldCheck className="w-8 h-8 text-pink-200" />
          </motion.div>
          <div className="text-center mb-10 space-y-3 relative z-10">
            <h1 className="font-playfair italic text-3xl font-bold text-white tracking-normal">Admin Key</h1>
            <p className="font-cinzel text-[10px] text-pink-100/40 uppercase tracking-[0.3em]">Permit Required</p>
          </div>
          <form onSubmit={handleAuthSubmit} className="w-full space-y-6 relative z-10">
            <input
              type="password"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.03] border border-white/10 focus:border-pink-500/40 p-[18px] rounded-2xl text-white text-center font-mono tracking-widest outline-none transition-all"
              autoFocus
            />
            <button type="submit" disabled={isLoading} className="w-full py-[18px] rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-[10px] tracking-[0.2em] uppercase shadow-lg shadow-pink-600/20 active:scale-95 transition-transform">Authorize Access</button>
          </form>
          {isFullScreen && <a href="/" className="mt-10 font-cinzel text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold hover:text-white transition-colors">Exit Console</a>}
        </div>
      </motion.div>
    </div>
  );

  if (isFullScreen) {
    return isAuthorized ? dashboardContent : authScreen;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-6xl rounded-[40px] border border-white/10 bg-[#05010a] shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[92vh] overflow-y-auto z-10 custom-scrollbar"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        {isAuthorized ? dashboardContent : authScreen}
      </motion.div>
    </div>
  );
}
