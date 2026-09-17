import { useState } from "react";
import { BrandRibbon, MusicToggle, PaperBackdrop } from "./Chrome";
import { Overture } from "./Overture";
import { Hero } from "./Hero";
import { Countdown } from "./Countdown";
import {
  ContactsSection,
  CoupleSection,
  EventsSection,
  FinaleSection,
  GallerySection,
  MessageSection,
  VenueSection,
} from "./Sections";
import type { Invite } from "@/lib/publicInvitation";

export function Invitation({ invite }: { invite: Invite }) {
  const [open, setOpen] = useState(false);

  return (
    <main className="relative overflow-x-clip">
      <PaperBackdrop />
      <Overture invite={invite} open={open} onOpen={() => setOpen(true)} />
      <div inert={!open} aria-hidden={!open}>
        <Hero invite={invite} started={open} />
        <MessageSection invite={invite} />
        {invite.targetISO && <Countdown targetISO={invite.targetISO} />}
        <CoupleSection invite={invite} />
        <EventsSection invite={invite} />
        <VenueSection invite={invite} />
        <GallerySection invite={invite} />
        <ContactsSection invite={invite} />
        <FinaleSection invite={invite} />
      </div>
      {open && invite.musicUrl && <MusicToggle src={invite.musicUrl} active={open} />}
      <BrandRibbon name={invite.brandName} />
    </main>
  );
}
