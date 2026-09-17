import { Dot, Ink, DrawnSvg } from "./DrawnPath";

/* ------------------------------------------------------------------ */
/* Shared stroke classes                                               */
/* ------------------------------------------------------------------ */

const HENNA = "stroke-[color:var(--henna)]";
const HENNA_SOFT = "stroke-[color:var(--henna)]/60";
const GOLD = "stroke-[color:var(--gold)]";
const FILL_HENNA = "fill-[color:var(--henna)]";
const FILL_GOLD = "fill-[color:var(--gold)]";

/* Core motif geometry, shared so every ornament belongs to one design. */
const PAISLEY =
  "M60 152 C22 126 14 76 40 42 C58 18 96 16 108 44 C121 74 100 104 74 100 C54 97 46 74 62 62";
const PAISLEY_INNER = "M62 136 C34 114 30 76 50 52 C64 35 90 34 98 54 C106 74 92 92 76 88";
const PETAL = "M0 0 C -13 -22 -8 -46 0 -60 C 8 -46 13 -22 0 0 Z";
const LEAF = "M0 0 C -9 -12 -6 -26 0 -34 C 6 -26 9 -12 0 0 Z";

/* ------------------------------------------------------------------ */
/* Mandala — concentric rings of petals, drawn ring by ring            */
/* ------------------------------------------------------------------ */

export function Mandala({
  className,
  base = 0,
  rings = 4,
  once = true,
  hollow = false,
  pace = 1,
}: {
  className?: string | undefined;
  base?: number | undefined;
  rings?: number | undefined;
  once?: boolean | undefined;
  /** Leaves the centre clear so text can sit inside the mandala. */
  hollow?: boolean | undefined;
  /** Scales the drawing choreography without changing the artwork. */
  pace?: number | undefined;
}) {
  const c = 200;
  const ringDefs = [
    { count: 8, radius: 44, scale: 0.7, cls: HENNA, sw: 1.1 },
    { count: 12, radius: 78, scale: 1, cls: HENNA_SOFT, sw: 1 },
    { count: 16, radius: 120, scale: 1.25, cls: GOLD, sw: 0.9 },
    { count: 20, radius: 164, scale: 1.05, cls: HENNA_SOFT, sw: 0.9 },
  ]
    .slice(0, rings)
    .filter((r) => !hollow || r.radius >= 120);

  return (
    <DrawnSvg viewBox="0 0 400 400" className={className} amount={0.25} once={once}>
      {/* concentric guide circles */}
      {(hollow ? [140, 178, 192] : [30, 60, 96, 140, 178, 192]).map((r, i) => (
        <Ink
          key={`c${r}`}
          d={circlePath(c, c, r)}
          className={i % 2 ? GOLD : HENNA_SOFT}
          strokeWidth={r === 192 ? 1.4 : 0.8}
          duration={(2.2 + i * 0.15) * pace}
          delay={base + i * 0.28 * pace}
          opacity={0.85}
        />
      ))}

      {ringDefs.map((ring, ri) =>
        Array.from({ length: ring.count }).map((_, i) => {
          const angle = (360 / ring.count) * i;
          const delay = base + (1 + ri * 0.9 + (i / ring.count) * 0.8) * pace;
          return (
            <g
              key={`r${ri}-${i}`}
              transform={`translate(${c} ${c}) rotate(${angle}) translate(0 ${-ring.radius}) scale(${ring.scale})`}
            >
              <Ink
                d={ri % 2 === 0 ? PETAL : LEAF}
                className={ring.cls}
                strokeWidth={ring.sw}
                duration={1.1 * pace}
                delay={delay}
                opacity={0.9}
              />
              {ri === 1 && (
                <Ink
                  d="M0 -6 L0 -26"
                  className={HENNA_SOFT}
                  strokeWidth={0.7}
                  duration={0.6 * pace}
                  delay={delay + 0.25 * pace}
                  opacity={0.7}
                />
              )}
            </g>
          );
        }),
      )}

      {/* inner rosette */}
      {(hollow ? [] : Array.from({ length: 6 })).map((_, i) => (
        <g key={`in${i}`} transform={`translate(${c} ${c}) rotate(${i * 60})`}>
          <Ink
            d="M0 0 C 10 -10 10 -26 0 -34 C -10 -26 -10 -10 0 0 Z"
            className={HENNA}
            strokeWidth={1.1}
            duration={0.9 * pace}
            delay={base + (0.4 + i * 0.12) * pace}
          />
        </g>
      ))}
      {!hollow && (
        <Ink
          d={circlePath(c, c, 9)}
          className={GOLD}
          strokeWidth={1.4}
          duration={0.8 * pace}
          delay={base + 0.2 * pace}
        />
      )}

      {/* outer dotted crown */}
      {Array.from({ length: 40 }).map((_, i) => {
        const a = (Math.PI * 2 * i) / 40;
        return (
          <Dot
            key={`d${i}`}
            cx={c + Math.cos(a) * 186}
            cy={c + Math.sin(a) * 186}
            r={1.7}
            delay={base + (4 + i * 0.02) * pace}
            className={FILL_GOLD}
            opacity={0.85}
          />
        );
      })}
    </DrawnSvg>
  );
}

/* ------------------------------------------------------------------ */
/* Arch frame — the hero ornament                                      */
/* ------------------------------------------------------------------ */

export function ArchFrame({ className, base = 0 }: { className?: string; base?: number }) {
  return (
    <DrawnSvg viewBox="0 0 320 460" className={className} amount={0.2} preserveAspectRatio="none">
      {/* main mughal arch */}
      <Ink
        d="M28 452 L28 190 C28 96 88 34 160 34 C232 34 292 96 292 190 L292 452"
        className={HENNA}
        strokeWidth={1.4}
        duration={3.4}
        delay={base}
      />
      <Ink
        d="M40 452 L40 192 C40 104 94 46 160 46 C226 46 280 104 280 192 L280 452"
        className={GOLD}
        strokeWidth={0.8}
        duration={3.4}
        delay={base + 0.5}
        opacity={0.9}
      />
      {/* crown finial */}
      <Ink
        d="M160 34 L160 12 M150 22 C155 14 165 14 170 22"
        className={HENNA}
        strokeWidth={1.1}
        duration={0.9}
        delay={base + 2.6}
      />
      <Dot cx={160} cy={8} r={3} delay={base + 3.4} className={FILL_HENNA} />

      {/* scalloped inner edge along the arch */}
      {Array.from({ length: 13 }).map((_, i) => {
        const t = i / 12;
        const a = Math.PI * (1 - t);
        const x = Math.round((160 - Math.cos(a) * 120) * 1000) / 1000;
        const y = Math.round((192 - Math.sin(a) * 146) * 1000) / 1000;
        return (
          <g key={`s${i}`} transform={`translate(${x} ${y}) rotate(${(t - 0.5) * 170})`}>
            <Ink
              d={LEAF}
              className={HENNA_SOFT}
              strokeWidth={0.8}
              duration={0.8}
              delay={base + 3 + i * 0.12}
              opacity={0.8}
            />
          </g>
        );
      })}

      {/* side vines */}
      <Ink
        d="M28 452 C 8 400 46 372 26 322 C 8 278 44 250 28 206"
        className={HENNA_SOFT}
        strokeWidth={0.8}
        duration={2.4}
        delay={base + 4}
      />
      <Ink
        d="M292 452 C 312 400 274 372 294 322 C 312 278 276 250 292 206"
        className={HENNA_SOFT}
        strokeWidth={0.8}
        duration={2.4}
        delay={base + 4.2}
      />
      {[240, 300, 360, 412].map((y, i) => (
        <g key={`lv${i}`}>
          <g transform={`translate(24 ${y}) rotate(-115) scale(0.7)`}>
            <Ink
              d={LEAF}
              className={GOLD}
              strokeWidth={0.8}
              duration={0.7}
              delay={base + 5 + i * 0.15}
            />
          </g>
          <g transform={`translate(296 ${y}) rotate(115) scale(0.7)`}>
            <Ink
              d={LEAF}
              className={GOLD}
              strokeWidth={0.8}
              duration={0.7}
              delay={base + 5.1 + i * 0.15}
            />
          </g>
        </g>
      ))}
    </DrawnSvg>
  );
}

/* ------------------------------------------------------------------ */
/* Vine divider                                                        */
/* ------------------------------------------------------------------ */

export function VineDivider({
  className,
  base = 0,
  flip = false,
}: {
  className?: string | undefined;
  base?: number | undefined;
  flip?: boolean | undefined;
}) {
  return (
    <DrawnSvg viewBox="0 0 320 64" className={className} amount={0.4}>
      <g transform={flip ? "translate(320 0) scale(-1 1)" : undefined}>
        <Ink
          d="M6 32 C 60 32 80 12 110 12 C 138 12 148 32 160 32 C 172 32 182 12 210 12 C 240 12 260 32 314 32"
          className={HENNA}
          strokeWidth={1}
          duration={2.2}
          delay={base}
        />
        <Ink
          d="M6 32 C 60 32 80 52 110 52 C 138 52 148 32 160 32 C 172 32 182 52 210 52 C 240 52 260 32 314 32"
          className={HENNA_SOFT}
          strokeWidth={0.8}
          duration={2.2}
          delay={base + 0.35}
        />
        <g transform="translate(160 32) scale(0.42)">
          <Ink d={PETAL} className={GOLD} strokeWidth={1.4} duration={0.8} delay={base + 1.6} />
          <g transform="rotate(180)">
            <Ink d={PETAL} className={GOLD} strokeWidth={1.4} duration={0.8} delay={base + 1.7} />
          </g>
          <g transform="rotate(90)">
            <Ink d={LEAF} className={GOLD} strokeWidth={1.4} duration={0.7} delay={base + 1.9} />
          </g>
          <g transform="rotate(-90)">
            <Ink d={LEAF} className={GOLD} strokeWidth={1.4} duration={0.7} delay={base + 2} />
          </g>
        </g>
        {[70, 250].map((x, i) => (
          <Dot key={x} cx={x} cy={32} r={2} delay={base + 2.2 + i * 0.15} className={FILL_HENNA} />
        ))}
        {[40, 280].map((x, i) => (
          <Dot key={x} cx={x} cy={32} r={1.3} delay={base + 2.4 + i * 0.15} className={FILL_GOLD} />
        ))}
      </g>
    </DrawnSvg>
  );
}

/* ------------------------------------------------------------------ */
/* Corner paisley spray                                                */
/* ------------------------------------------------------------------ */

export function CornerPaisley({
  className,
  base = 0,
  rotate = 0,
}: {
  className?: string | undefined;
  base?: number | undefined;
  rotate?: number | undefined;
}) {
  return (
    <DrawnSvg viewBox="0 0 180 180" className={className} amount={0.3}>
      <g transform={`rotate(${rotate} 90 90)`}>
        <g transform="translate(14 12) scale(0.95)">
          <Ink d={PAISLEY} className={HENNA} strokeWidth={1.2} duration={2.4} delay={base} />
          <Ink
            d={PAISLEY_INNER}
            className={HENNA_SOFT}
            strokeWidth={0.8}
            duration={1.8}
            delay={base + 0.9}
          />
          {[
            [66, 62],
            [78, 78],
            [56, 82],
            [70, 100],
          ].map(([x, y], i) => (
            <Dot
              key={i}
              cx={x!}
              cy={y!}
              r={1.5}
              delay={base + 2.2 + i * 0.1}
              className={FILL_HENNA}
            />
          ))}
        </g>
        <Ink
          d="M20 168 C 60 164 92 140 106 104 C 118 74 140 58 168 56"
          className={GOLD}
          strokeWidth={0.8}
          duration={2}
          delay={base + 1.2}
        />
        {[
          [46, 160, -40],
          [86, 132, -25],
          [124, 86, -10],
          [154, 60, 5],
        ].map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(0.55)`}>
            <Ink
              d={LEAF}
              className={HENNA_SOFT}
              strokeWidth={1.1}
              duration={0.7}
              delay={base + 2.4 + i * 0.16}
            />
          </g>
        ))}
      </g>
    </DrawnSvg>
  );
}

/* ------------------------------------------------------------------ */
/* Floral wreath around content blocks                                 */
/* ------------------------------------------------------------------ */

export function FloralWreath({ className, base = 0 }: { className?: string; base?: number }) {
  return (
    <DrawnSvg viewBox="0 0 320 320" className={className} amount={0.3}>
      <Ink
        d={circlePath(160, 160, 138)}
        className={HENNA_SOFT}
        strokeWidth={0.9}
        duration={3}
        delay={base}
      />
      <Ink
        d={circlePath(160, 160, 148)}
        className={GOLD}
        strokeWidth={0.6}
        duration={3}
        delay={base + 0.3}
      />
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (360 / 14) * i;
        return (
          <g key={i} transform={`translate(160 160) rotate(${a}) translate(0 -138) scale(0.8)`}>
            <Ink
              d={i % 2 === 0 ? PETAL : LEAF}
              className={i % 2 === 0 ? HENNA : GOLD}
              strokeWidth={1}
              duration={0.9}
              delay={base + 1.2 + i * 0.1}
            />
          </g>
        );
      })}
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (Math.PI * 2 * i) / 14 + Math.PI / 14;
        return (
          <Dot
            key={`d${i}`}
            cx={160 + Math.cos(a) * 152}
            cy={160 + Math.sin(a) * 152}
            r={1.5}
            delay={base + 2.6 + i * 0.05}
            className={FILL_GOLD}
          />
        );
      })}
    </DrawnSvg>
  );
}

/* ------------------------------------------------------------------ */
/* Filigree border for cards / events                                  */
/* ------------------------------------------------------------------ */

export function FiligreeBorder({ className, base = 0 }: { className?: string; base?: number }) {
  return (
    <DrawnSvg viewBox="0 0 300 200" className={className} amount={0.3} preserveAspectRatio="none">
      <Ink
        d="M10 26 C 10 14 20 8 34 8 L266 8 C 280 8 290 14 290 26 L290 174 C290 186 280 192 266 192 L34 192 C20 192 10 186 10 174 Z"
        className={HENNA_SOFT}
        strokeWidth={1}
        duration={3}
        delay={base}
      />
      <Ink
        d="M18 30 C 18 20 26 16 38 16 L262 16 C 274 16 282 20 282 30 L282 170 C282 180 274 184 262 184 L38 184 C26 184 18 180 18 170 Z"
        className={GOLD}
        strokeWidth={0.6}
        duration={3}
        delay={base + 0.4}
        opacity={0.8}
      />
      {[
        [34, 26, 0],
        [266, 26, 90],
        [266, 174, 180],
        [34, 174, 270],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(0.28)`}>
          <Ink
            d={PAISLEY}
            className={HENNA}
            strokeWidth={1.6}
            duration={1.4}
            delay={base + 1 + i * 0.2}
          />
        </g>
      ))}
    </DrawnSvg>
  );
}

/* ------------------------------------------------------------------ */
/* Long vertical vine used down the page margins                       */
/* ------------------------------------------------------------------ */

export function MarginVine({
  className,
  base = 0,
  mirror = false,
}: {
  className?: string | undefined;
  base?: number | undefined;
  mirror?: boolean | undefined;
}) {
  return (
    <DrawnSvg viewBox="0 0 60 600" className={className} amount={0.05} preserveAspectRatio="none">
      <g transform={mirror ? "translate(60 0) scale(-1 1)" : undefined}>
        <Ink
          d="M30 0 C 6 70 54 140 30 210 C 6 280 54 350 30 420 C 6 490 54 540 30 600"
          className={HENNA_SOFT}
          strokeWidth={0.8}
          duration={5}
          delay={base}
          opacity={0.8}
        />
        {[70, 175, 280, 385, 490, 560].map((y, i) => (
          <g key={y} transform={`translate(30 ${y}) rotate(${i % 2 ? 120 : -120}) scale(0.7)`}>
            <Ink
              d={LEAF}
              className={GOLD}
              strokeWidth={1}
              duration={0.8}
              delay={base + 1 + i * 0.4}
              opacity={0.75}
            />
          </g>
        ))}
      </g>
    </DrawnSvg>
  );
}

/* ------------------------------------------------------------------ */

export function circlePath(cx: number, cy: number, r: number) {
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${r} ${r} 0 0 1 ${cx} ${cy - r} Z`;
}
