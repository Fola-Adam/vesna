import type { Metadata } from "next";
import { readPublishedStories } from '@/lib/journal-server';
import JournalBrowser from "./journal-browser";

export const metadata: Metadata = {
  title: "The Journal — Vesna",
  description:
    "Notes on useful objects, thoughtful spaces, and choosing with care.",
};

export const dynamic = 'force-dynamic';
export default async function JournalPage() {
  return <JournalBrowser stories={await readPublishedStories()} />;
}
