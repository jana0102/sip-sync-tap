import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SipSync — Quiet hydration tracking" },
      { name: "description", content: "SipSync is a minimalist hydration app: tap an NFC sticker or the progress ring to log water instantly. Streaks, smart reminders, and a calm, native feel." },
      { name: "author", content: "SipSync" },
      { property: "og:title", content: "SipSync — Quiet hydration tracking" },
      { property: "og:description", content: "SipSync is a minimalist hydration app: tap an NFC sticker or the progress ring to log water instantly. Streaks, smart reminders, and a calm, native feel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#5C9CE6" },
      { name: "twitter:title", content: "SipSync — Quiet hydration tracking" },
      { name: "twitter:description", content: "SipSync is a minimalist hydration app: tap an NFC sticker or the progress ring to log water instantly. Streaks, smart reminders, and a calm, native feel." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/db0814c1-9f67-4a75-b27b-951e31882ccf/id-preview-93e20ad8--481771f5-fa88-4867-a226-2851b91714d3.lovable.app-1785498575371.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/db0814c1-9f67-4a75-b27b-951e31882ccf/id-preview-93e20ad8--481771f5-fa88-4867-a226-2851b91714d3.lovable.app-1785498575371.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
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
  return <Outlet />;
}
