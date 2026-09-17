import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Mandala } from "@/components/henna/Motifs";
import type { Invite } from "@/lib/publicInvitation";
import { useEffect, useRef } from "react";

export function Overture({
  invite,
  open,
  onOpen,
}: {
  invite: Invite;
  open: boolean;
  onOpen: () => void;
}) {
  const groom = invite.groom.name;
  const reduced = useReducedMotion();
  const bride = invite.bride.name;
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    button.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {!open && (
        <motion.div
          key="overture"
          className="paper-surface fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto px-8 py-10"
          exit={{ opacity: 0, filter: reduced ? "none" : "blur(12px)" }}
          transition={{ duration: reduced ? 0 : 1.2, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute inset-0 grain-layer" />
          <div className="pointer-events-none absolute inset-0 vignette-layer" />

          <Mandala className="absolute w-[130vw] max-w-[36rem] opacity-35" rings={4} pace={0.32} />

          <motion.div
            className="relative flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 1.6, delay: reduced ? 0 : 0.6 }}
          >
            <p className="font-body text-[0.6rem] uppercase tracking-ornate text-muted-foreground">
              The wedding of
            </p>
            <h1 className="mt-6 font-display text-4xl font-light leading-[1.25] tracking-[0.08em] text-primary sm:text-5xl">
              {groom && <span className="block">{groom}</span>}
              {groom && bride && (
                <span className="block py-1 text-2xl italic text-[color:var(--gold)] sm:text-3xl">
                  &amp;
                </span>
              )}
              {bride && <span className="block">{bride}</span>}
            </h1>
            <div className="rule-gold mt-7 h-px w-40" />

            <motion.button
              ref={button}
              type="button"
              onClick={onOpen}
              whileTap={{ scale: 0.97 }}
              className="mt-11 border border-[color:var(--gold)] px-9 py-3.5 font-body text-[0.62rem] uppercase tracking-[0.3em] text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
            >
              Open Invitation
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
