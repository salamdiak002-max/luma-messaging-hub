import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

const LUMA_HOME = "/luma/index.html";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LUMA — Messagerie privée de l'écosystème Lumesys" },
      {
        name: "description",
        content:
          "LUMA : messagerie privée temps réel de l'écosystème Lumesys. Conversations privées, messages instantanés, lus/non lus.",
      },
      { property: "og:title", content: "LUMA — Messagerie de l'écosystème Lumesys" },
      {
        property: "og:description",
        content: "Conversations privées et messages en temps réel, sur ordinateur, tablette et smartphone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LumaRedirect,
});

function LumaRedirect() {
  useEffect(() => {
    window.location.replace(LUMA_HOME);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">
        Ouverture de LUMA… <a className="underline" href={LUMA_HOME}>Continuer</a>
      </p>
    </div>
  );
}
