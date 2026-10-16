import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CatalogImage from './CatalogImage'
import type { JournalArticle } from '@/lib/journal-data'

export default function JournalStoryContent({ article }: { article: JournalArticle }) {
  return <article className="bg-paper text-ink">
    <header className="mx-auto max-w-4xl px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
      <p className="mb-4 font-section-header text-ink-muted">{article.categoryLabel} · {article.readTime}</p>
      <h1 className="break-words font-display-hero text-[clamp(2.25rem,7.5vw,3.75rem)] leading-tight">{article.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-muted">{article.excerpt}</p>
      {article.author && <p className="mt-6 text-xs text-ink-muted">By {article.author}{article.published_at && <> · <time dateTime={article.published_at}>{new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time></>}</p>}
    </header>
    <figure className="mx-auto max-w-6xl"><div className="relative aspect-[16/9] overflow-hidden bg-paper-raised"><CatalogImage src={article.image} alt={article.caption || article.title} sizes="(max-width: 1200px) 100vw, 1200px" priority /></div>{article.caption && <figcaption className="px-5 pt-3 text-xs leading-5 text-ink-muted sm:px-8">{article.caption}</figcaption>}</figure>
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      {article.body ? <div className="break-words text-base leading-8 text-ink-muted sm:text-lg [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:font-display-hero [&_h2]:text-3xl [&_h2]:text-ink [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-semibold [&_p]:mb-5 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary-ink [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-primary-ink/40 [&_blockquote]:pl-6 [&_blockquote]:italic"><ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown></div> : article.sections.map(section => <section key={section.heading} className="mb-10"><h2 className="mb-4 font-display-hero text-3xl">{section.heading}</h2><div className="space-y-4 text-lg leading-8 text-ink-muted">{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></section>)}
    </div>
  </article>
}
