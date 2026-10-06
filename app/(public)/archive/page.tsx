import type { Metadata } from "next";
import ArchiveBrowser from "./archive-browser";

export const metadata: Metadata = {
  title: "The Archive — Retired Collections",
  description:
    "Objects that once earned a place in the Vesna collection. A record of standards, and of things we set aside.",
};

export default function ArchivePage() {
  return <ArchiveBrowser />;
}
