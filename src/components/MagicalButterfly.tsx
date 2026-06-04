import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

// Cute celestial chime arpeggio on interaction using Web Audio API
const playChimeSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [587.33, 659.25, 783.99, 987.77, 1174.66, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gainNode.gain.setValueAtTime(0, now + idx * 0.05);
      gainNode.gain.linearRampToValueAtTime(0.1, now + idx * 0.05 + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.5);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.6);
    });
  } catch (e) {
    console.warn('Audio feedback blocked', e);
  }
};

interface SparkleParticle {
  id: number;
  position: THREE.Vector3;
  size: number;
  color: string;
  opacity: number;
}

function ButterflyScene({
  isFlying,
  setIsFlying,
  hasLanded,
  setHasLanded,
  progress,
  setProgress,
  trail,
  setTrail,
  triggerFlight
}: {
  isFlying: boolean;
  setIsFlying: (val: boolean) => void;
  hasLanded: boolean;
  setHasLanded: (val: boolean) => void;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  trail: SparkleParticle[];
  setTrail: React.Dispatch<React.SetStateAction<SparkleParticle[]>>;
  triggerFlight: () => void;
}) {
  const { viewport } = useThree();
  const butterflyRef = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Mesh>(null);
  const rightWing = useRef<THREE.Mesh>(null);
  const particleIdCounter = useRef(0);

  const isDesktop = viewport.width > viewport.height;

  // Set scale sizes exactly as requested (0.70 for desktop, 0.45 for mobile)
  const scale = isDesktop ? 0.70 : 0.45;

  const wingShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0.5, 0.6, 0.5, 0.6, 0);
    shape.bezierCurveTo(0.6, -0.5, 0.2, -0.4, 0, 0);
    return shape;
  }, []);

  const flightPath = useMemo(() => {
    let start: THREE.Vector3;
    let end: THREE.Vector3;
    let control: THREE.Vector3;

    if (isDesktop) {
      // Land on the left side to avoid covering the face
      start = new THREE.Vector3(-viewport.width * 0.25, -viewport.height * 0.1, 0);
      end = new THREE.Vector3(-viewport.width * 0.22, viewport.height * 0.15, 0.5);
      control = new THREE.Vector3(-viewport.width * 0.35, viewport.height * 0.3, 1.0);
    } else {
      // Land high items on mobile
      start = new THREE.Vector3(-viewport.width * 0.15, viewport.height * 0.1, 0);
      end = new THREE.Vector3(-viewport.width * 0.1, viewport.height * 0.3, 0.4);
      control = new THREE.Vector3(-viewport.width * 0.2, 0.2, 0.6);
    }

    return { curve: new THREE.QuadraticBezierCurve3(start, control, end), start, end };
  }, [viewport, isDesktop]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (butterflyRef.current) {
      if (isFlying) {
        setProgress((prev) => {
          const next = prev + delta * 0.42;
          if (next >= 1.0) {
            setIsFlying(false);
            setHasLanded(true);
            return 1.0;
          }
          return next;
        });

        const currentPos = flightPath.curve.getPoint(progress);
        butterflyRef.current.position.copy(currentPos);
        const lookTarget = flightPath.curve.getPoint(Math.min(1.0, progress + 0.04));
        butterflyRef.current.lookAt(lookTarget);
        butterflyRef.current.rotateX(Math.PI / 1.6);

        if (Math.random() < 0.8) {
          setTrail((pList) => [
            ...pList,
            {
              id: particleIdCounter.current++,
              position: currentPos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3)),
              size: 0.04 + Math.random() * 0.07,
              color: ['#f472b6', '#a78bfa', '#60a5fa', '#ffffff', '#fcd34d'][Math.floor(Math.random() * 5)],
              opacity: 1.0
            }
          ]);
        }
      } else {
        const pivotPos = hasLanded ? flightPath.end : flightPath.start;
        butterflyRef.current.position.x = pivotPos.x + Math.sin(time * 1.6) * 0.07;
        butterflyRef.current.position.y = pivotPos.y + Math.cos(time * 1.3) * 0.07;
        butterflyRef.current.position.z = pivotPos.z + Math.sin(time * 0.9) * 0.04;
        butterflyRef.current.rotation.set(0.12, 0, 0);
      }
    }

    const flapSpeed = isFlying ? 40 : 8;
    const flap = Math.sin(time * flapSpeed) * 0.8;
    if (leftWing.current) leftWing.current.rotation.y = flap;
    if (rightWing.current) rightWing.current.rotation.y = -flap;

    setTrail((pList) =>
      pList
        .map((p) => ({
          ...p,
          position: p.position.clone().add(new THREE.Vector3(0, delta * 0.08, 0)),
          opacity: p.opacity - delta * 0.55,
          size: Math.max(0, p.size * 0.96)
        }))
        .filter((p) => p.opacity > 0)
    );
  });

  return (
    <group>
      {/* Assigning the scaled arrays directly to make group 2x smaller */}
      <group ref={butterflyRef} scale={[scale, scale, scale]} onDoubleClick={triggerFlight} onClick={triggerFlight}>
        <group>
          <mesh ref={leftWing} position={[-0.02, 0, 0]}>
            <shapeGeometry args={[wingShape]} />
            <meshPhysicalMaterial
              color="#f472b6"
              transmission={0.8}
              thickness={0.5}
              roughness={0.1}
              side={THREE.DoubleSide}
              emissive="#ff0080"
              emissiveIntensity={2.5}
            />
          </mesh>
          <mesh ref={rightWing} position={[0.02, 0, 0]} rotation={[0, Math.PI, 0]}>
            <shapeGeometry args={[wingShape]} />
            <meshPhysicalMaterial
              color="#60a5fa"
              transmission={0.8}
              thickness={0.5}
              roughness={0.1}
              side={THREE.DoubleSide}
              emissive="#77bbff"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.02]}>
          <cylinderGeometry args={[0.016, 0.012, 0.46, 8]} />
          <meshBasicMaterial color="#1f0923" />
        </mesh>
        {!isFlying && !hasLanded && (
          <Html position={[0, 0.6, 0]} center>
            <div className="pointer-events-none px-3 py-1.5 rounded-full bg-pink-950/90 border border-pink-500/35 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-pink-200 animate-pulse whitespace-nowrap shadow-xl select-none">
              Tap Me {'\ud83e\udd8b'}
            </div>
          </Html>
        )}
      </group>
      {trail.map((pt) => (
        <mesh key={pt.id} position={pt.position}>
          <dodecahedronGeometry args={[pt.size, 0]} />
          <meshBasicMaterial color={pt.color} transparent opacity={pt.opacity} />
        </mesh>
      ))}
    </group>
  );
}

interface FullPageSparkle {
  id: string;
  char: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  duration: number;
  delay: number;
  scaleStart: number;
  scaleEnd: number;
  rotateStart: number;
  rotateEnd: number;
  glowColor: string;
}

const BURST_EMOJI_POOL = [
  '\u2728',
  '\ud83d\udc96',
  '\ud83c\udf38',
  '\ud83d\udcab',
  '\ud83e\udd8b',
  '\ud83c\udf37',
  '\ud83e\udef6',
  '\ud83e\udd0d',
  '\ud83d\udc97',
  '\ud83c\udf53',
  '\ud83e\uddc1',
];
const GLOW_COLORS = [
  'rgba(253, 224, 71, 0.7)',  // gold
  'rgba(244, 114, 182, 0.7)', // pink
  'rgba(168, 85, 247, 0.7)', // purple
  'rgba(59, 130, 246, 0.6)'   // blue
];

export default function MagicalButterfly() {
  const [isFlying, setIsFlying] = useState(false);
  const [hasLanded, setHasLanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trail, setTrail] = useState<SparkleParticle[]>([]);
  const [showFullPageBurst, setShowFullPageBurst] = useState(false);
  const [pageBurstParticles, setPageBurstParticles] = useState<FullPageSparkle[]>([]);
  const flightRequestedRef = useRef(false);

  const triggerFlight = () => {
    if (isFlying || hasLanded || flightRequestedRef.current) return;
    flightRequestedRef.current = true;
    setIsFlying(true);
    playChimeSound();
  };

  useEffect(() => {
    if (!isFlying && !hasLanded) {
      flightRequestedRef.current = false;
    }
  }, [isFlying, hasLanded]);

  useEffect(() => {
    if (isFlying) {
      setShowFullPageBurst(true);

      const count = 42; // Majestic, rich burst count
      const now = Date.now();
      const newParticles: FullPageSparkle[] = Array.from({ length: count }).map((_, idx) => {
        const char = BURST_EMOJI_POOL[Math.floor(Math.random() * BURST_EMOJI_POOL.length)];
        const glowColor = GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)];

        // Decide if starting near left-center (butterfly takeoff area) vs random ambient rise
        const isFromButterfly = Math.random() > 0.35;
        const startX = isFromButterfly
          ? 20 + Math.random() * 25 // Takeoff region roughly near hero content
          : Math.random() * 100;    // Anywhere across width

        const startY = isFromButterfly
          ? 35 + Math.random() * 25
          : 80 + Math.random() * 20; // Bottom region

        const endX = startX + (Math.random() - 0.5) * 60;
        const endY = startY - 70 - Math.random() * 55;

        return {
          id: `pg-${now}-${idx}-${Math.random()}`,
          char,
          startX,
          startY,
          endX,
          endY,
          size: 18 + Math.random() * 32, // varying beautiful sizes
          duration: 2.2 + Math.random() * 1.8, // 2.2s to 4.0s
          delay: Math.random() * 0.5, // beautifully staggered launch
          scaleStart: 0.15,
          scaleEnd: 1.1 + Math.random() * 0.9,
          rotateStart: (Math.random() - 0.5) * 60,
          rotateEnd: (Math.random() - 0.5) * 480 + (Math.random() > 0.5 ? 240 : -240),
          glowColor,
        };
      });

      setPageBurstParticles(newParticles);

      const timer = setTimeout(() => {
        setShowFullPageBurst(false);
      }, 4500); // 4.5 seconds majestic duration

      return () => clearTimeout(timer);
    }
  }, [isFlying]);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlying(false);
    setHasLanded(false);
    setProgress(0);
    setTrail([]);
    flightRequestedRef.current = false;
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-20">

      {/* Full-Page Magical Stardust Symphony Overlay */}
      <AnimatePresence>
        {showFullPageBurst && (
          <>
            {/* Ambient Pulsating Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.45, 0.6, 0.35, 0],
                background: [
                  "radial-gradient(circle, rgba(244,114,182,0.2) 0%, rgba(139,92,246,0.1) 40%, transparent 80%)",
                  "radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.1) 40%, transparent 80%)",
                  "radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(244,114,182,0.05) 55%, transparent 90%)"
                ]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4.5, ease: "easeInOut" }}
              className="fixed inset-0 pointer-events-none z-[80]"
            />

            {/* Glowing Aurora Ambient Flares */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.5, 0.3, 0],
                scale: [0.85, 1.1, 1.25, 1.3],
                rotate: [0, 15, -10, 5]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4.5, ease: "easeOut" }}
              className="fixed inset-0 pointer-events-none z-[81] bg-[radial-gradient(circle_at_25%_45%,rgba(244,114,182,0.18),transparent_50%),radial-gradient(circle_at_75%_35%,rgba(168,85,247,0.18),transparent_55%)] filter blur-3xl"
            />

            {/* 42 Floating Magical Stardust Emojis & Sprites */}
            <div className="fixed inset-0 pointer-events-none select-none z-[99] overflow-hidden">
              {pageBurstParticles.map((pt) => {
                const normalizedXStr = `${pt.startX}vw`;
                const normalizedYStr = `${pt.startY}vh`;
                const driftXStr = `${pt.endX}vw`;
                const driftYStr = `${pt.endY}vh`;

                return (
                  <motion.div
                    key={pt.id}
                    initial={{
                      x: normalizedXStr,
                      y: normalizedYStr,
                      opacity: 0,
                      scale: pt.scaleStart,
                      rotate: pt.rotateStart,
                    }}
                    animate={{
                      x: driftXStr,
                      y: driftYStr,
                      opacity: [0, 0.95, 0.8, 0],
                      scale: [pt.scaleStart, pt.scaleEnd, pt.scaleEnd * 0.9, 0],
                      rotate: pt.rotateEnd,
                    }}
                    transition={{
                      duration: pt.duration,
                      delay: pt.delay,
                      ease: "easeOut",
                    }}
                    className="absolute select-none pointer-events-none"
                    style={{
                      fontSize: `${pt.size}px`,
                      filter: `drop-shadow(0 0 10px ${pt.glowColor})`,
                    }}
                  >
                    {pt.char}
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </AnimatePresence>

      {!isFlying && !hasLanded && (
        <button
          type="button"
          aria-label="Launch butterfly animation"
          title="Tap to launch butterfly"
          onPointerDown={(e) => {
            e.preventDefault();
            triggerFlight();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerFlight();
            }
          }}
          className="absolute left-0 top-[36%] z-[70] h-[44vh] min-h-[220px] max-h-[380px] w-[220px] -translate-y-1/2 cursor-pointer rounded-[32px] border border-pink-300/0 bg-transparent outline-none pointer-events-auto hover:bg-pink-500/[0.025] focus-visible:border-pink-300/50 focus-visible:bg-pink-500/10 focus-visible:ring-2 focus-visible:ring-pink-300/35 sm:top-[38%] sm:w-[260px] md:left-4 lg:left-0"
        >
          <span className="sr-only">Launch butterfly animation</span>
        </button>
      )}

      <Canvas camera={{ position: [0, 0, 4.2], fov: 48 }} gl={{ antialias: true, alpha: true }} className="w-full h-full pointer-events-none">
        <ambientLight intensity={0.9} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#ffd4e6" />
        <React.Suspense fallback={null}>
          <ButterflyScene
            isFlying={isFlying}
            setIsFlying={setIsFlying}
            hasLanded={hasLanded}
            setHasLanded={setHasLanded}
            progress={progress}
            setProgress={setProgress}
            trail={trail}
            setTrail={setTrail}
            triggerFlight={triggerFlight}
          />
        </React.Suspense>
      </Canvas>
      {hasLanded && (
        // Adjusted top spacing from top-[8%] to top-[8%] sm:top-36 to clear desktop headers
        <div className="absolute top-[8%] sm:top-36 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 px-4 py-2 bg-pink-950/20 border border-pink-500/15 backdrop-blur-md rounded-2xl pointer-events-auto shadow-2xl z-50 animate-[fadeIn_0.5s_ease-out_forwards]">
          <span className="font-serif italic text-pink-200 text-xs font-black tracking-wide">{'\u201c'}A gift for you...{'\u201d'}</span>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase font-mono tracking-widest text-[#ffe3f2] hover:text-white bg-pink-600/30 hover:bg-pink-600/70 border border-pink-400/20 px-4 py-2 rounded-full transition-all cursor-pointer"
          >
            Send Back {'\ud83e\udd8b'}
          </button>
        </div>
      )}
    </div>
  );
}
