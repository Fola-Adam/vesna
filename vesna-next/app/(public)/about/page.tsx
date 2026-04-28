import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center bg-surface-dim">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/vesna-imgs/native-cinematic-vase.png"
            alt="Ebenezer Victory"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="relative z-10 px-5 sm:px-8 lg:px-20 pt-24 max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="font-button-label text-xs text-secondary uppercase tracking-[0.3em] mb-4">
                The Curator
              </p>
              <h1 className="font-display-hero text-4xl sm:text-5xl lg:text-6xl text-on-background mb-6">
                Ebenezer<br />Victory
              </h1>
              <p className="font-body-main text-lg text-on-surface-variant mb-8 leading-relaxed max-w-lg">
                Architect of spaces, collector of objects, advocate for the
                intentional life. I believe that what surrounds us shapes who we
                become.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/journal"
                  className="inline-flex items-center gap-2 font-button-label text-xs uppercase tracking-[0.15em] text-primary hover:text-on-background transition-colors"
                >
                  <span>Read the Monograph</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 border border-primary/20"></div>
                <Image
                  src="/vesna-imgs/victory.png"
                  alt="Ebenezer Victory"
                  width={400}
                  height={533}
                  className="relative w-full aspect-[3/4] object-cover grayscale"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Statement */}
      <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20 border-b border-surface-container">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-6xl text-primary/20 font-accent-italic">"</span>
          <blockquote className="font-accent-italic text-2xl sm:text-3xl lg:text-4xl text-on-background italic leading-relaxed -mt-8 mb-8">
            True luxury is not possession—it is the space between a thought and
            an action, the pause before we choose.
          </blockquote>
          <cite className="font-button-label text-sm text-secondary uppercase tracking-widest">
            — The Vesna Creed
          </cite>
        </div>
      </section>

      {/* The Philosophy */}
      <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <h2 className="font-section-header text-xs text-secondary uppercase tracking-[0.2em] mb-6">
                Philosophy
              </h2>
              <h3 className="font-display-hero text-2xl sm:text-3xl text-on-background mb-6">
                Objects as Anchors
              </h3>
              <div className="space-y-4 font-body-main text-base text-on-surface-variant leading-relaxed">
                <p>
                  In an era of endless scrolling and disposable consumption,
                  Vesna stands for the opposite: permanence, intention, and the
                  quiet luxury of objects chosen with care.
                </p>
                <p>
                  Every item in our collection has been touched, considered, and
                  ultimately selected because it represents something more than
                  function—it embodies a philosophy of living.
                </p>
                <p>
                  We don't sell products. We curate possibilities for a more
                  intentional existence.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-surface-container border border-secondary/15">
                <h4 className="font-button-label text-xs text-secondary uppercase tracking-[0.15em] mb-3">
                  The Three Principles
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary text-sm mt-1">
                      check_circle
                    </span>
                    <div>
                      <p className="font-body-main text-sm text-on-background">
                        <strong>Quality over quantity</strong>
                      </p>
                      <p className="font-body-main text-sm text-on-surface-variant">
                        One exceptional object outweighs a dozen mediocre ones.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary text-sm mt-1">
                      check_circle
                    </span>
                    <div>
                      <p className="font-body-main text-sm text-on-background">
                        <strong>Timeless over trending</strong>
                      </p>
                      <p className="font-body-main text-sm text-on-surface-variant">
                        We seek objects that age gracefully, not those that
                        chase fashion.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary text-sm mt-1">
                      check_circle
                    </span>
                    <div>
                      <p className="font-body-main text-sm text-on-background">
                        <strong>Meaningful over convenient</strong>
                      </p>
                      <p className="font-body-main text-sm text-on-surface-variant">
                        The best things require care, attention, and presence.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20 bg-surface-container-lowest">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-section-header text-xs text-secondary uppercase tracking-[0.2em] mb-12 text-center">
            The Journey
          </h2>

          <div className="space-y-8">
            <TimelineItem year="2018" title="The Seed">
              After years of collecting objects from artisans worldwide, the
              idea of Vesna began to form—a place to share discoveries with
              like-minded seekers of quality.
            </TimelineItem>

            <TimelineItem year="2020" title="The Curation">
              The first collection took shape: fifty objects, each chosen not
              for market appeal, but for their ability to transform a space
              and elevate daily rituals.
            </TimelineItem>

            <TimelineItem year="2022" title="The Community">
              Vesna found its audience—architects, designers, writers, and
              thinkers who understood that environment shapes consciousness.
            </TimelineItem>

            <TimelineItem year="2024" title="The Vision">
              The full vision for Vesna took shape—a comprehensive platform
              spanning commerce, community, and intelligence, built on trust
              as infrastructure.
            </TimelineItem>

            <TimelineItem year="2026" title="The Foundation">
              Vesna is being built—starting with the curated affiliate
              showcase, Venus AI integration, and the foundation for what will
              become a complete ecosystem of intentional living.
            </TimelineItem>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 lg:py-32 px-5 sm:px-8 lg:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-6">
            mail
          </span>
          <h2 className="font-display-hero text-2xl sm:text-3xl lg:text-4xl text-on-background mb-4">
            Join the Inner Circle
          </h2>
          <p className="font-body-main text-base text-on-surface-variant mb-8">
            Receive monthly essays, early access to new collections, and
            invitations to exclusive events.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-surface-container border border-outline/30 px-4 py-3 text-on-background placeholder:text-outline/50 focus:outline-none focus:border-secondary font-body-main"
              required
            />
            <button
              type="submit"
              className="font-button-label text-xs uppercase tracking-[0.2em] px-8 py-3 transition-all text-on-primary"
              style={{ background: 'linear-gradient(90deg, #e6c364, #95d4b3)' }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

function TimelineItem({ year, title, children }: { year: string; title: string; children: React.ReactNode }) {
  return (
    <div className="timeline-item relative pl-8">
      <div className="absolute left-0 top-2 w-2 h-2 bg-primary rounded-full"></div>
      <div className="absolute left-[3px] top-4 w-[2px] h-full bg-gradient-to-b from-primary to-transparent"></div>
      <p className="font-button-label text-xs text-secondary uppercase tracking-[0.15em] mb-1">
        {year}
      </p>
      <h3 className="font-display-hero text-lg text-on-background mb-2">{title}</h3>
      <p className="font-body-main text-sm text-on-surface-variant">{children}</p>
    </div>
  )
}
