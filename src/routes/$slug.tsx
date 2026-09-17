import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Invitation } from "@/components/invitation/Invitation";
import {
  FallbackScreen,
  LoadingScreen,
  NotFoundScreen,
  RequestErrorScreen,
} from "@/components/invitation/States";
import { fetchPublicInvitation, slugFromPathname, type InviteResult } from "@/lib/publicInvitation";

export const Route = createFileRoute("/$slug")({
  head: () => ({
    meta: [
      { title: "Wedding Invitation" },
      { name: "description", content: "You are invited to our wedding celebrations." },
      { property: "og:title", content: "Wedding Invitation" },
      { property: "og:description", content: "You are invited to our wedding celebrations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SlugInvitation,
});

function SlugInvitation() {
  // Read the slug from the URL pathname only — never a query param or storage.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const slug = slugFromPathname(pathname);
  if (!slug) return <NotFoundScreen />;
  return <InvitationRequest key={slug} slug={slug} />;
}

function InvitationRequest({ slug }: { slug: string }) {
  const [result, setResult] = useState<InviteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setResult(null);
    setError(null);
    fetchPublicInvitation(slug, controller.signal)
      .then((r) => {
        if (!cancelled) setResult(r);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "The invitation could not be loaded.");
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [slug, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  if (error) return <RequestErrorScreen message={error} onRetry={retry} />;
  if (!result) return <LoadingScreen />;
  if (result.state === "not_found") return <NotFoundScreen />;
  if (result.state === "fallback") return <FallbackScreen shop={result.shop} />;
  return <Invitation invite={result.invite} />;
}
