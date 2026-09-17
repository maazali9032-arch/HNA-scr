import { createFileRoute } from "@tanstack/react-router";
import { NotFoundScreen } from "@/components/invitation/States";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Invitation not found" }, { name: "robots", content: "noindex" }],
  }),
  component: NotFoundScreen,
});
