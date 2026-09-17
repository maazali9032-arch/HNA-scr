import type { Invite } from "@/lib/publicInvitation";
import couple1 from "@/assets/couple-1.jpg";
import couple2 from "@/assets/couple-2.jpg";
import couple3 from "@/assets/couple-3.jpg";

/**
 * Design preview content only. This is NEVER used for a /:slug invitation —
 * slug pages render exclusively what the central public RPC returns.
 */
export const designPreview: Invite = {
  groom: { name: "Ahmed", occupation: "Architect", parents: "Son of Mr. & Mrs. Khan" },
  bride: { name: "Ayesha", occupation: "Physician", parents: "Daughter of Mr. & Mrs. Rahman" },
  invocation: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
  dateLabel: "14 December 2026",
  targetISO: "2026-12-14T11:00:00+05:30",
  timeLabel: "11:00 AM",
  events: [
    {
      id: "mehendi",
      name: "Mehendi",
      date: "12 December 2026",
      time: "5:00 PM",
      venue: "Falaknuma Courtyard",
      city: "Hyderabad",
      mapsUrl: "https://maps.google.com/?q=Falaknuma+Palace+Hyderabad",
      note: "An evening of henna, music and marigolds",
    },
    {
      id: "nikah",
      name: "Nikah",
      date: "14 December 2026",
      time: "11:00 AM",
      venue: "Taj Krishna Banquet Hall",
      city: "Hyderabad",
      mapsUrl: "https://maps.google.com/?q=Taj+Krishna+Hyderabad",
      note: "Followed by lunch",
    },
    {
      id: "walima",
      name: "Walima",
      date: "16 December 2026",
      time: "7:30 PM",
      venue: "Golconda Gardens",
      city: "Hyderabad",
      mapsUrl: "https://maps.google.com/?q=Golconda+Fort+Hyderabad",
      note: "Dinner reception under the stars",
    },
  ],
  venue: {
    name: "Taj Krishna Banquet Hall",
    address: "Road No. 1, Banjara Hills",
    city: "Hyderabad, Telangana 500034",
    mapsUrl: "https://maps.google.com/?q=Taj+Krishna+Hyderabad",
  },
  gallery: [
    { src: couple1, alt: "The couple in traditional wedding attire", span: "tall" },
    { src: couple2, alt: "Bridal hands adorned with mehendi holding marigolds", span: "wide" },
    { src: couple3, alt: "The couple beneath a marigold arch at sunset" },
  ],
  contacts: [
    { name: "Ahmed Khan", phone: "+91 90000 00000", whatsappUrl: "https://wa.me/919000000000" },
  ],
};
