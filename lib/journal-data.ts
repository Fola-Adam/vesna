export interface JournalArticle {
  slug: string
  title: string
  category: string
  categoryLabel: string
  excerpt: string
  image: string
  readTime: string
  sections: { heading: string; paragraphs: string[] }[]
}

export const ARTICLES: JournalArticle[] = [
  {
    slug: 'a-better-question-than-is-it-trending', title: 'A better question than “Is it trending?”', category: 'curator', categoryLabel: 'Curator’s notes',
    excerpt: 'A simple way to look past the moment: ask what an object will make easier, more useful, or more satisfying in everyday life.', image: '/vesna-imgs/curated-novels.webp', readTime: '2 min read',
    sections: [
      { heading: 'Start with the everyday', paragraphs: ['A product can be beautifully photographed and still have no place in your day. Before asking whether something is popular, picture the ordinary moment in which you would reach for it.', 'Does it solve a real problem? Does it make a routine more pleasant? Can you explain why it belongs in your home without borrowing the language of an advertisement?'] },
      { heading: 'Look for reasons that last', paragraphs: ['Trends move quickly. Fit, usefulness, repairability, and materials are easier to judge over time. They are not guarantees of quality, but they give you better questions to ask before buying.', 'At Vesna, the aim is to make those reasons visible so each person can decide whether a pick suits their own life.'] },
    ],
  },
  {
    slug: 'what-a-useful-object-has-to-earn', title: 'What a useful object has to earn', category: 'objects', categoryLabel: 'Objects & use',
    excerpt: 'Good design is more than a pleasing silhouette. An object earns its place through comfort, dependable function, and care in the details.', image: '/vesna-imgs/premium-fountain-pen.webp', readTime: '2 min read',
    sections: [
      { heading: 'Form has a job', paragraphs: ['The shape of an object should help you understand how to hold it, use it, store it, and care for it. When form and function work together, the object feels considered rather than merely decorated.', 'That does not mean every useful thing must be plain. It means the visual choices should support the experience instead of getting in its way.'] },
      { heading: 'The details matter', paragraphs: ['Materials, joins, finishes, weight, and maintenance all affect how an item lives with you. Small choices often reveal whether a design has been thought through beyond the first impression.', 'When comparing options, look for clear material information and realistic guidance about cleaning, repair, and expected use.'] },
    ],
  },
  {
    slug: 'a-room-is-shaped-by-what-you-keep', title: 'A room is shaped by what you keep', category: 'philosophy', categoryLabel: 'Space & ritual',
    excerpt: 'A calmer room is not a shopping list. It begins with noticing what supports the way you want to live, then making space for it.', image: '/vesna-imgs/native-incense-platform.webp', readTime: '2 min read',
    sections: [
      { heading: 'Notice the rhythms already there', paragraphs: ['Every room is used in a particular way: a place to read, get ready, gather, or pause between tasks. Paying attention to those rhythms is a more useful starting point than trying to recreate a finished photograph.', 'Keep the objects that support those routines within reach. Move the things that create friction, and let empty space do some of the work.'] },
      { heading: 'Choose with the room in mind', paragraphs: ['Before bringing something home, consider its scale, materials, light, and the objects around it. A thoughtful choice can make a room feel more coherent without adding more visual noise.', 'The goal is not a perfect interior. It is a space that makes daily life feel a little more considered.'] },
    ],
  },
]

export const JOURNAL_CATEGORIES = [
  { id: 'all', label: 'All stories' }, { id: 'curator', label: 'Curator’s notes' }, { id: 'objects', label: 'Objects & use' }, { id: 'philosophy', label: 'Space & ritual' },
]

export function getArticleBySlug(slug: string) { return ARTICLES.find((article) => article.slug === slug) }
