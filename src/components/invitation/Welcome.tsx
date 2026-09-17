import { ArchFrame, CornerPaisley, Mandala, VineDivider } from "@/components/henna/Motifs";
import { PaperBackdrop } from "./Chrome";

/** The bare domain is a front door. Invitation content belongs only to /:slug. */
export function WelcomeScreen() {
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <PaperBackdrop />
      <ArchFrame
        className="pointer-events-none absolute inset-x-3 inset-y-6 h-[calc(100%-3rem)] w-[calc(100%-1.5rem)] max-w-[48rem] opacity-70 md:inset-x-auto"
        base={0.2}
      />
      <CornerPaisley className="pointer-events-none absolute left-1 top-2 w-20 opacity-35 sm:w-28" />
      <CornerPaisley className="pointer-events-none absolute right-1 top-2 w-20 -scale-x-100 opacity-35 sm:w-28" />
      <Mandala
        className="pointer-events-none absolute bottom-[-9rem] w-[18rem] opacity-20 sm:bottom-[-11rem] sm:w-[22rem]"
        rings={3}
        pace={0.4}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4">
        <p className="font-body text-[0.58rem] uppercase tracking-ornate text-muted-foreground">
          A personal celebration
        </p>
        <h1 className="mt-9 font-display text-[clamp(2.7rem,10vw,4.7rem)] font-light leading-[1.02] tracking-[0.035em] text-primary">
          An invitation,
          <span className="block italic text-[color:var(--henna-deep)]">drawn in henna</span>
        </h1>
        <VineDivider className="mt-8 w-52 opacity-90" />
        <p className="mt-7 max-w-[17rem] font-body text-sm leading-7 text-muted-foreground">
          Your invitation has its own private link. Open the complete link shared with you to unfold
          the celebration.
        </p>
      </div>

      <p className="absolute bottom-7 z-10 font-body text-[0.5rem] uppercase tracking-[0.3em] text-primary/65">
        Made for moments worth remembering
      </p>
    </main>
  );
}
