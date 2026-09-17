import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  ClientOnly,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { NotFoundScreen, RequestErrorScreen } from "@/components/invitation/States";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Wedding Invitation" },
      { name: "description", content: "A henna line-art wedding invitation." },
      { name: "theme-color", content: "#f2e1c9" },
      { name: "msapplication-config", content: "/browserconfig.xml" },
      { name: "msapplication-TileImage", content: "/ms-icon-144x144.png" },
      { property: "og:title", content: "Wedding Invitation" },
      { property: "og:description", content: "A henna line-art wedding invitation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      ...[16, 32, 96].map((size) => ({
        rel: "icon",
        href: `/favicon-${size}x${size}.png`,
        type: "image/png",
        sizes: `${size}x${size}`,
      })),
      ...[57, 60, 72, 76, 114, 120, 144, 152, 180].map((size) => ({
        rel: "apple-touch-icon",
        href: `/apple-icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
      })),
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&family=Noto+Naskh+Arabic:wght@400;500&family=Tiro+Devanagari+Hindi&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundScreen,
  errorComponent: ({ reset }) => (
    <RequestErrorScreen message="Please try opening this invitation again." onRetry={reset} />
  ),
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <ClientOnly fallback={null}>
        <Outlet />
      </ClientOnly>
    </QueryClientProvider>
  );
}
