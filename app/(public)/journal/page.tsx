import type { Metadata } from "next";
import JournalBrowser from "./journal-browser";

export const metadata: Metadata = {
  title: "The Journal — Vesna",
  description:
    "Notes on useful objects, thoughtful spaces, and choosing with care.",
};

export default function JournalPage() {
  return <JournalBrowser />;
}
