import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { MarginVine } from "@/components/henna/Motifs";

/** Warm paper background: grain, vignette, soft lighting, margin vines. */
export function PaperBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 paper-surface">
      <div className="absolute inset-0 grain-layer" />
      <div className="absolute inset-0 vignette-layer" />
      <MarginVine className="absolute left-1 top-0 hidden h-full w-10 opacity-70 md:block" />
      <MarginVine
        mirror
        className="absolute right-1 top-0 hidden h-full w-10 opacity-70 md:block"
      />
    </div>
  );
}

/** Section shell with consistent rhythm. */
export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative mx-auto w-full max-w-[46rem] px-6 py-24 sm:px-10 sm:py-32 ${className}`}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="text-center font-body text-[0.62rem] uppercase tracking-ornate text-muted-foreground"
    >
      {children}
    </motion.p>
  );
}

export function Reveal({
  children,
  delay = 0,
  blur = false,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  blur?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={
        reduced ? { opacity: 1 } : { opacity: 0, y: 14, filter: blur ? "blur(10px)" : "blur(0px)" }
      }
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1.4, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Discreet music control; audio only begins after the invitation is opened. */
export function MusicToggle({ src, active }: { src: string; active: boolean }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!active || !src) return;
    const el = ref.current;
    if (!el) return;
    el.volume = 0.35;
    void el
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [active, src]);

  if (!src) return null;

  return (
    <>
      <audio
        ref={ref}
        src={src}
        loop
        preload="none"
        onError={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        aria-label={playing ? "Pause music" : "Play music"}
        aria-pressed={playing}
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          if (playing) {
            el.pause();
            setPlaying(false);
          } else {
            void el
              .play()
              .then(() => setPlaying(true))
              .catch(() => setPlaying(false));
          }
        }}
        className="fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-[color:var(--gold)]/50 bg-card/80 text-primary backdrop-blur-sm transition-colors hover:bg-secondary"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </>
  );
}

/** Name only, from the approved public shop object; never a contact or guessed brand. */
export function BrandRibbon({ name }: { name?: string | undefined }) {
  if (!name) return null;
  return (
    <aside className="brand-ribbon" aria-label={name}>
      <div className="brand-ribbon-track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <div className="brand-ribbon-group" key={copy}>
            {[0, 1, 2].map((item) => (
              <span key={item}>
                {name}
                <i>✦</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
