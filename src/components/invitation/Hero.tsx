import { motion, useReducedMotion } from "motion/react";
import { ArchFrame, CornerPaisley, VineDivider } from "@/components/henna/Motifs";
import type { Invite } from "@/lib/publicInvitation";

/** Choose a script-appropriate typeface for the invocation text. */
export function scriptOf(text: string): "arabic" | "deva" | "latin" {
  if (/[\u0600-\u06FF]/.test(text)) return "arabic";
  if (/[\u0900-\u097F]/.test(text)) return "deva";
  return "latin";
}

export function Hero({ invite, started }: { invite: Invite; started: boolean }) {
  const reduced = useReducedMotion();
  const show = started || !!reduced;
  const t = (delay: number) => ({
    duration: reduced ? 0 : 1.4,
    delay: reduced ? 0 : delay,
    ease: [0.22, 0.61, 0.36, 1] as const,
  });

  const invocation = invite.invocation;
  const script = invocation ? scriptOf(invocation) : "latin";
  const groom = invite.groom.name;
  const bride = invite.bride.name;

  return (
    <header className="relative mx-auto flex min-h-[100svh] w-full max-w-[46rem] flex-col items-center justify-center px-7 py-20">
      <ArchFrame
        className="absolute left-2 top-8 h-[calc(100%_-_4rem)] w-[calc(100%_-_1rem)] opacity-90"
        base={0.3}
      />
      <CornerPaisley className="absolute -left-2 top-2 w-24 opacity-45 sm:w-32" base={2.2} />
      <CornerPaisley
        className="absolute -right-2 top-2 w-24 -scale-x-100 opacity-45 sm:w-32"
        base={2.4}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-4 text-center">
        {invocation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={t(0.4)}
            dir={script === "arabic" ? "rtl" : "ltr"}
            className="mb-10"
          >
            <p
              className={`leading-[2] text-primary/90 ${
                script === "arabic"
                  ? "font-arabic text-lg sm:text-xl"
                  : script === "deva"
                    ? "font-deva text-lg"
                    : "font-display text-xl italic"
              }`}
            >
              {invocation}
            </p>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={t(0.9)}
          className="font-body text-[0.58rem] uppercase tracking-ornate text-muted-foreground"
        >
          Together with their families
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, filter: "blur(14px)", scale: 0.98 }}
          animate={show ? { opacity: 1, filter: "blur(0px)", scale: 1 } : {}}
          transition={t(1.2)}
          className="mt-6 font-display text-[2.6rem] font-light leading-[1.15] tracking-[0.06em] text-primary sm:text-6xl"
        >
          {groom && <span className="block">{groom}</span>}
          {groom && bride && (
            <span className="block py-1 font-display text-2xl italic text-[color:var(--gold)] sm:text-3xl">
              &amp;
            </span>
          )}
          {bride && <span className="block">{bride}</span>}
        </motion.h1>

        <VineDivider className="mt-6 w-56 opacity-90" base={2.4} />

        {(invite.dateLabel || invite.timeLabel) && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={t(1.9)}
            className="mt-4 font-body text-[0.66rem] uppercase tracking-[0.34em] text-primary/80"
          >
            {[invite.dateLabel, invite.timeLabel].filter(Boolean).join(" · ")}
          </motion.p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : {}}
        transition={t(2.6)}
        className="absolute bottom-6 flex flex-col items-center gap-2"
      >
        <span className="font-body text-[0.5rem] uppercase tracking-[0.3em] text-muted-foreground">
          Scroll
        </span>
        <motion.span
          animate={reduced ? {} : { y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="block h-8 w-px bg-[color:var(--gold)]"
        />
      </motion.div>
    </header>
  );
}
