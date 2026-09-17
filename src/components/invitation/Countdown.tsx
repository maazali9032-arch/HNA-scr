import { useEffect, useState } from "react";
import { FloralWreath } from "@/components/henna/Motifs";
import { Eyebrow, Reveal, Section } from "./Chrome";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

/** Rendered only when there is a valid future target datetime. */
export function Countdown({ targetISO }: { targetISO: string }) {
  const target = new Date(targetISO).getTime();
  const [time, setTime] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setTime(diff(target));
    const id = setInterval(() => setTime(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!Number.isFinite(target) || target <= Date.now()) return null;

  const units: Array<[string, number | null]> = [
    ["Days", time?.days ?? null],
    ["Hours", time?.hours ?? null],
    ["Minutes", time?.minutes ?? null],
    ["Seconds", time?.seconds ?? null],
  ];

  return (
    <Section id="countdown">
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <FloralWreath
          className="pointer-events-none absolute -inset-x-6 -top-12 h-[24rem] opacity-70"
          base={0.2}
        />

        <div className="relative z-10 flex w-full flex-col items-center py-10">
          <Eyebrow>Counting the days</Eyebrow>
          <div className="mt-8 grid w-full grid-cols-4 gap-1 sm:gap-3">
            {units.map(([label, value], i) => (
              <Reveal key={label} delay={0.3 + i * 0.15} className="text-center">
                <div className="relative px-1">
                  <span className="block font-display text-3xl font-light tabular-nums text-primary sm:text-5xl">
                    {value === null ? "--" : String(value).padStart(2, "0")}
                  </span>
                  <span className="mt-2 block font-body text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {label}
                  </span>
                  {i < 3 && (
                    <span className="absolute right-[-0.1rem] top-2 text-[color:var(--gold)]/60">
                      ·
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
