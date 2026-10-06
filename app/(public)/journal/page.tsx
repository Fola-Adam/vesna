import type { Metadata } from "next";
import JournalBrowser from "./journal-browser";

export const metadata: Metadata = {
  title: "The Journal — Essays on Intentional Living",
  description:
    "Curator's notes, essays, and field observations from Ebenezer Victory on objects, spaces, and the practice of choosing less.",
};

export default function JournalPage() {
  return <JournalBrowser />;
}
