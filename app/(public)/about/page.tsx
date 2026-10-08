import type { Metadata } from "next";
import AboutBrowser from "./about-browser";

export const metadata: Metadata = {
  title: "About — Ebenezer Victory, Curator",
  description:
    "The story behind Vesna: architect of spaces, collector of objects, and advocate for the intentional life.",
};

export default function AboutPage() {
  return <AboutBrowser />;
}
