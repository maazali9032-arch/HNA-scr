import { Phone, MessageCircle, MapPin } from "lucide-react";
import { Mandala, VineDivider } from "@/components/henna/Motifs";
import { BrandRibbon, PaperBackdrop } from "./Chrome";
import { safeUrl } from "@/lib/publicInvitation";
import type { ShopFallback } from "@/lib/publicInvitation";

const EXT = { target: "_blank", rel: "noreferrer noopener" } as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="paper-surface relative flex min-h-[100svh] flex-col items-center justify-center overflow-x-clip px-7 py-20">
      <PaperBackdrop />
      <Mandala
        className="pointer-events-none absolute bottom-[-5rem] w-[min(70vw,20rem)] opacity-15"
        rings={3}
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {children}
      </div>
    </main>
  );
}

export function LoadingScreen() {
  return (
    <Shell>
      <p
        role="status"
        className="font-body text-[0.58rem] uppercase tracking-ornate text-muted-foreground"
      >
        Unfolding the invitation
      </p>
      <VineDivider className="mt-8 w-56 opacity-80" />
    </Shell>
  );
}

export function RequestErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Shell>
      <h1 className="font-display text-3xl font-light tracking-[0.08em] text-primary">
        We couldn&apos;t open this invitation
      </h1>
      <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-9 border border-[color:var(--gold)] px-8 py-3 font-body text-[0.58rem] uppercase tracking-[0.28em] text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
      >
        Try again
      </button>
    </Shell>
  );
}

export function NotFoundScreen() {
  return (
    <Shell>
      <h1 className="font-display text-3xl font-light tracking-[0.08em] text-primary">
        Invitation not found
      </h1>
      <VineDivider className="mt-7 w-52 opacity-80" />
      <p className="mt-6 font-body text-sm leading-relaxed text-muted-foreground">
        This link doesn&apos;t match an invitation. Please check the link you were given.
      </p>
    </Shell>
  );
}

export function FallbackScreen({ shop }: { shop: ShopFallback }) {
  const waDigits =
    shop.whatsapp && /^[+\d\s().-]+$/.test(shop.whatsapp) ? shop.whatsapp.replace(/\D/g, "") : "";
  const whatsappUrl =
    safeUrl(shop.whatsapp) ?? (waDigits ? `https://wa.me/${waDigits}` : undefined);
  const address = [shop.address, shop.city].filter(Boolean).join(", ");
  return (
    <Shell>
      <h1 className="font-display text-3xl font-light tracking-[0.08em] text-primary">
        This invitation is unavailable
      </h1>
      <VineDivider className="mt-7 w-52 opacity-80" />
      <p className="mt-6 font-body text-sm leading-relaxed text-muted-foreground">
        The invitation link is no longer active. Please get in touch for assistance.
      </p>
      {shop.name && (
        <p className="mt-8 font-display text-xl font-light tracking-[0.06em] text-primary">
          {shop.name}
        </p>
      )}
      {shop.business_contact && (
        <p className="mt-2 font-body text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {shop.business_contact}
        </p>
      )}
      {address && (
        <p className="mt-3 inline-flex items-center gap-2 font-body text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-[color:var(--gold)]" />
          {address}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {shop.phone && (
          <a
            href={`tel:${shop.phone}`}
            className="inline-flex items-center gap-2 border border-[color:var(--gold)] px-6 py-2.5 font-body text-[0.56rem] uppercase tracking-[0.26em] text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
        )}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            {...EXT}
            className="inline-flex items-center gap-2 border border-[color:var(--gold)] px-6 py-2.5 font-body text-[0.56rem] uppercase tracking-[0.26em] text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        )}
      </div>
      <BrandRibbon name={shop.name} />
    </Shell>
  );
}
