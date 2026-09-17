import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { MapPin, Phone, MessageCircle, Clock, CalendarDays } from "lucide-react";
import { CornerPaisley, FiligreeBorder, Mandala, VineDivider } from "@/components/henna/Motifs";
import { Eyebrow, Reveal, Section } from "./Chrome";
import type { Invite, InviteContact, InviteImage, InvitePerson } from "@/lib/publicInvitation";

const EXT = { target: "_blank", rel: "noreferrer noopener" } as const;

/* ------------------------------------------------------------------ */
/* Couple profiles                                                     */
/* ------------------------------------------------------------------ */

function hasProfile(p: InvitePerson) {
  return !!(p.photo || p.qualification || p.occupation || p.parents);
}

function Profile({ person, delay }: { person: InvitePerson; delay: number }) {
  return (
    <Reveal delay={delay} className="flex flex-col items-center text-center">
      {person.photo && (
        <div className="relative mb-6 h-40 w-40 overflow-hidden rounded-full border border-[color:var(--gold)]/60 p-1">
          <img
            src={person.photo}
            alt={person.name ?? "Portrait"}
            loading="lazy"
            className="h-full w-full rounded-full object-cover"
          />
        </div>
      )}
      {person.name && (
        <h3 className="font-display text-2xl font-light tracking-[0.08em] text-primary">
          {person.name}
        </h3>
      )}
      {person.qualification && (
        <p className="mt-2 font-body text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {person.qualification}
        </p>
      )}
      {person.occupation && (
        <p className="mt-1 font-display text-base italic text-primary/80">{person.occupation}</p>
      )}
      {person.parents && (
        <p className="mt-3 max-w-[16rem] font-body text-xs leading-relaxed text-muted-foreground">
          {person.parents}
        </p>
      )}
    </Reveal>
  );
}

export function CoupleSection({ invite }: { invite: Invite }) {
  const showGroom = hasProfile(invite.groom);
  const showBride = hasProfile(invite.bride);
  if (!showGroom && !showBride && !invite.relatives) return null;

  return (
    <Section id="couple">
      <Eyebrow>The Couple</Eyebrow>
      {(showGroom || showBride) && (
        <div
          className={`mt-12 grid gap-14 sm:gap-10 ${showGroom && showBride ? "sm:grid-cols-2" : ""}`}
        >
          {showGroom && <Profile person={invite.groom} delay={0.1} />}
          {showBride && <Profile person={invite.bride} delay={0.3} />}
        </div>
      )}
      {invite.relatives && (
        <Reveal delay={0.5}>
          <p className="mx-auto mt-14 max-w-lg text-center font-display text-lg italic leading-relaxed text-primary/85">
            {invite.relatives}
          </p>
        </Reveal>
      )}
      <VineDivider className="mx-auto mt-14 w-64 opacity-80" />
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Invitation message                                                  */
/* ------------------------------------------------------------------ */

export function MessageSection({ invite }: { invite: Invite }) {
  const names = [invite.groom.name, invite.bride.name].filter(Boolean).join(" and ");
  return (
    <Section id="message" className="!py-20">
      <div className="relative mx-auto max-w-lg text-center">
        <CornerPaisley
          className="pointer-events-none absolute -left-6 -top-10 w-20 opacity-30"
          rotate={0}
        />
        <CornerPaisley
          className="pointer-events-none absolute -bottom-10 -right-6 w-20 opacity-30"
          rotate={180}
        />
        <Reveal>
          <p className="font-display text-xl font-light leading-[1.9] text-primary/90 sm:text-2xl">
            With hearts full of gratitude, {names || "the families"} invite you to share in the joy
            of their wedding celebrations.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export function EventsSection({ invite }: { invite: Invite }) {
  if (invite.events.length === 0) return null;
  return (
    <Section id="events">
      <Eyebrow>Celebrations</Eyebrow>
      <div className="mt-12 flex flex-col gap-10">
        {invite.events.map((ev, i) => (
          <Reveal key={ev.id} delay={0.1 + i * 0.12}>
            <article className="relative px-6 py-9 text-center sm:px-12">
              <FiligreeBorder className="pointer-events-none absolute inset-0 h-full w-full opacity-80" />
              <h3 className="relative font-display text-2xl font-light tracking-[0.14em] text-primary sm:text-3xl">
                {ev.name}
              </h3>
              <div className="relative mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-body text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                {ev.date && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3 text-[color:var(--gold)]" />
                    {ev.date}
                  </span>
                )}
                {ev.time && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-[color:var(--gold)]" />
                    {ev.time}
                  </span>
                )}
              </div>
              {(ev.venue || ev.city) && (
                <p className="relative mt-4 font-display text-lg italic text-primary/85">
                  {[ev.venue, ev.city].filter(Boolean).join(", ")}
                </p>
              )}
              {ev.note && (
                <p className="relative mx-auto mt-3 max-w-sm font-body text-xs leading-relaxed text-muted-foreground">
                  {ev.note}
                </p>
              )}
              {ev.mapsUrl && (
                <a
                  href={ev.mapsUrl}
                  {...EXT}
                  className="relative mt-6 inline-flex items-center gap-2 border-b border-[color:var(--gold)]/70 pb-1 font-body text-[0.56rem] uppercase tracking-[0.26em] text-primary transition-opacity hover:opacity-70"
                >
                  <MapPin className="h-3 w-3" /> Directions
                </a>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Venue                                                               */
/* ------------------------------------------------------------------ */

export function VenueSection({ invite }: { invite: Invite }) {
  const v = invite.venue;
  if (!v.name && !v.address && !v.city && !v.image && !v.mapsUrl) return null;

  return (
    <Section id="venue">
      <Eyebrow>The Venue</Eyebrow>
      <div className="mt-10 flex flex-col items-center text-center">
        {v.image && (
          <Reveal className="mb-9 w-full max-w-md">
            <div className="overflow-hidden border border-[color:var(--gold)]/40 p-1.5">
              <img
                src={v.image}
                alt={v.name ?? "Venue"}
                loading="lazy"
                className="h-56 w-full object-cover sm:h-72"
              />
            </div>
          </Reveal>
        )}
        {v.name && (
          <Reveal delay={0.1}>
            <h3 className="font-display text-3xl font-light tracking-[0.08em] text-primary">
              {v.name}
            </h3>
          </Reveal>
        )}
        {(v.address || v.city) && (
          <Reveal delay={0.2}>
            <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
              {v.address}
              {v.address && v.city && <br />}
              {v.city}
            </p>
          </Reveal>
        )}
        {v.mapsUrl && (
          <Reveal delay={0.3}>
            <a
              href={v.mapsUrl}
              {...EXT}
              className="mt-8 inline-flex items-center gap-2 border border-[color:var(--gold)] px-7 py-3 font-body text-[0.58rem] uppercase tracking-[0.28em] text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
            >
              <MapPin className="h-3.5 w-3.5" /> Open in Maps
            </a>
          </Reveal>
        )}
      </div>
      <VineDivider className="mx-auto mt-16 w-64 opacity-80" flip />
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

function GalleryImage({ item, index }: { item: InviteImage; index: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [18, -18]);

  const aspect =
    item.span === "wide" ? "aspect-[4/3]" : item.span === "tall" ? "aspect-[3/4]" : "aspect-square";
  const align = index % 2 === 0 ? "sm:mr-10" : "sm:ml-10";

  return (
    <div ref={ref} className={`relative ${align}`}>
      <motion.div
        style={{ y: reduced ? 0 : y }}
        className="overflow-hidden border border-[color:var(--gold)]/40 p-1.5"
      >
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          className={`w-full object-cover ${aspect} transition-transform duration-[1200ms] hover:scale-[1.04]`}
        />
      </motion.div>
      {item.caption && (
        <p className="mt-3 text-center font-display text-sm italic text-muted-foreground">
          {item.caption}
        </p>
      )}
    </div>
  );
}

export function GallerySection({ invite }: { invite: Invite }) {
  if (invite.gallery.length === 0) return null;
  return (
    <Section id="gallery">
      <Eyebrow>Moments</Eyebrow>
      <div className="relative mt-12 flex flex-col gap-12">
        <CornerPaisley className="pointer-events-none absolute -left-8 -top-12 w-24 opacity-25" />
        {invite.gallery.map((item, i) => (
          <Reveal key={`${item.src}-${i}`} delay={0.05 * i}>
            <GalleryImage item={item} index={i} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Contacts                                                            */
/* ------------------------------------------------------------------ */

function ContactCard({ contact, delay }: { contact: InviteContact; delay: number }) {
  return (
    <Reveal delay={delay} className="flex flex-col items-center text-center">
      {contact.name && (
        <p className="font-display text-xl font-light tracking-[0.06em] text-primary">
          {contact.name}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <a
          href={`tel:${contact.phone}`}
          className="inline-flex items-center gap-2 border border-[color:var(--gold)] px-6 py-2.5 font-body text-[0.56rem] uppercase tracking-[0.26em] text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
        >
          <Phone className="h-3.5 w-3.5" /> Call
        </a>
        {contact.whatsappUrl && (
          <a
            href={contact.whatsappUrl}
            {...EXT}
            className="inline-flex items-center gap-2 border border-[color:var(--gold)] px-6 py-2.5 font-body text-[0.56rem] uppercase tracking-[0.26em] text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        )}
      </div>
    </Reveal>
  );
}

export function ContactsSection({ invite }: { invite: Invite }) {
  const contacts = invite.contacts.slice(0, 2).filter((c) => !!c.phone);
  if (contacts.length === 0) return null;

  return (
    <Section id="contact" className="!py-20">
      <Eyebrow>For any assistance</Eyebrow>
      <div className={`mt-10 grid gap-10 ${contacts.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {contacts.map((c, i) => (
          <ContactCard key={`${c.phone}-${i}`} contact={c} delay={0.1 + i * 0.15} />
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Finale                                                              */
/* ------------------------------------------------------------------ */

export function FinaleSection({ invite }: { invite: Invite }) {
  const names = [invite.groom.name, invite.bride.name].filter(Boolean);
  return (
    <Section id="finale" className="!pb-28">
      <div className="relative flex min-h-[30rem] flex-col items-center justify-center">
        <Mandala
          className="pointer-events-none absolute w-[118vw] max-w-[34rem] opacity-60"
          hollow
          rings={4}
        />
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <Reveal delay={0.2}>
            <p className="font-body text-[0.56rem] uppercase tracking-ornate text-muted-foreground">
              With love
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <h2 className="mt-6 font-display text-3xl font-light leading-[1.3] tracking-[0.1em] text-primary sm:text-4xl">
              {names[0] && <span className="block">{names[0]}</span>}
              {names.length === 2 && (
                <span className="block py-0.5 text-xl italic text-[color:var(--gold)]">&amp;</span>
              )}
              {names[1] && <span className="block">{names[1]}</span>}
            </h2>
          </Reveal>
          <Reveal delay={0.7}>
            <p className="mt-8 max-w-sm font-display text-lg italic leading-relaxed text-primary/80">
              Your presence is the finest ornament of our day.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
