export interface JournalArticle {
  id: number;
  title: string;
  category: string;
  categoryLabel: string;
  excerpt: string;
  image: string;
  readTime: string;
  hasGreenBorder: boolean;
  isPrimaryCategory?: boolean;
}

export const ARTICLES: JournalArticle[] = [
  {
    id: 1,
    title: "Why We Choose Less",
    category: "curator",
    categoryLabel: "Curator's Notes",
    excerpt:
      "Curation is an act of elimination. For every object we showcase, dozens are set aside. The question isn't what to include—it's what to leave out.",
    image: "/vesna-imgs/curated-novels.webp",
    readTime: "5 min",
    hasGreenBorder: true,
  },
  {
    id: 2,
    title: "The Ritual of Writing",
    category: "objects",
    categoryLabel: "Object Stories",
    excerpt:
      "There's something sacred about the first stroke of ink on paper. In our digital age, the fountain pen becomes not just a tool, but a portal to intentionality.",
    image: "/vesna-imgs/premium-fountain-pen.webp",
    readTime: "6 min",
    hasGreenBorder: false,
  },
  {
    id: 3,
    title: "Space as Sanctuary",
    category: "philosophy",
    categoryLabel: "Design Philosophy",
    excerpt:
      "Our environments shape our thoughts. The minimalist isn't denying themselves—they're making room for what matters.",
    image: "/vesna-imgs/native-incense-platform.webp",
    readTime: "4 min",
    hasGreenBorder: false,
    isPrimaryCategory: true,
  },
  {
    id: 4,
    title: "Time as Luxury",
    category: "objects",
    categoryLabel: "Object Stories",
    excerpt:
      "The mechanical watch is an anachronism that refuses to die. In a world of digital precision, its imperfection becomes its charm.",
    image: "/vesna-imgs/luxury-watch-on-book.webp",
    readTime: "7 min",
    hasGreenBorder: false,
  },
  {
    id: 5,
    title: "The Art of Selection",
    category: "curator",
    categoryLabel: "Curator's Notes",
    excerpt:
      "Behind every curated collection lies a thousand rejected options. The curator's eye is trained not just to see quality, but to recognize the subtle signals of authenticity.",
    image: "/vesna-imgs/cinematic-handbag.webp",
    readTime: "5 min",
    hasGreenBorder: true,
  },
  {
    id: 6,
    title: "Tactile Memory",
    category: "philosophy",
    categoryLabel: "Design Philosophy",
    excerpt:
      "We remember texture more vividly than sight. The grain of leather, the weight of ceramic—our hands hold memories our eyes cannot.",
    image: "/vesna-imgs/hand-touching-cloth.webp",
    readTime: "4 min",
    hasGreenBorder: false,
    isPrimaryCategory: true,
  },
];
