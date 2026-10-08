import type { Metadata } from "next";
import AboutBrowser from "./about-browser";

export const metadata: Metadata = {
  title: "About Vesna — Victory Ebenezer",
  description:
    "Meet Vesna, an editorial guide to useful, thoughtfully designed products curated by Victory Ebenezer.",
};

export default function AboutPage() {
  return <AboutBrowser />;
}
