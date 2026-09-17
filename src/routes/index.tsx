import { createFileRoute } from "@tanstack/react-router";
import { WelcomeScreen } from "@/components/invitation/Welcome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Henna Wedding Invitation" },
      {
        name: "description",
        content: "A personal wedding invitation drawn in henna. Open the link shared with you.",
      },
    ],
  }),
  component: WelcomeScreen,
});
