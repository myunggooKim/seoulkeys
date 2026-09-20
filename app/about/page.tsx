import type { Metadata } from "next";
import Link from "next/link";
import styles from "./trust-page.module.css";

export const metadata: Metadata = {
  title: "About Seoul Keys — Korean Typing & Hangul Learning",
  description:
    "Learn why Seoul Keys exists, how its original Korean typing lessons are created, and how to report corrections.",
  alternates: { canonical: "https://seoulkeys.com/about" },
  openGraph: {
    title: "About Seoul Keys",
    description: "How Seoul Keys builds approachable Hangul and Korean typing practice.",
    url: "https://seoulkeys.com/about",
    type: "website",
  },
};

const contactEmail = "travels444@gmail.com";

export default function AboutPage() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Seoul Keys home">
          <span className={styles.brandMark} aria-hidden="true">ㅅ</span>
          <span>Seoul Keys</span>
        </Link>
        <nav className={styles.headerLinks} aria-label="About page navigation">
          <Link href="/learn/hangul">Hangul guide</Link>
          <Link href="/legal">Legal & safety</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>ABOUT SEOUL KEYS</p>
          <h1>Korean starts at your fingertips.</h1>
          <p className={styles.lede}>
            Seoul Keys is a browser-based learning service that helps beginners understand Hangul and build Korean
            typing confidence through short explanations, guided practice, pronunciation audio, and games.
          </p>
          <div className={styles.status} aria-label="Service status">
            <span>Public learning service</span>
            <span>Core lessons available without payment</span>
            <span>Advertising not currently active</span>
          </div>
        </section>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Why Seoul Keys exists</h2>
            <p>
              Many Korean courses teach vocabulary before learners feel comfortable finding the letters on a
              keyboard. Seoul Keys starts with the writing system and the physical act of typing, then connects
              those skills to useful Korean words and sentences.
            </p>
            <p>
              The goal is not to replace a teacher, dictionary, or full language course. It is to make the first
              stage of Korean reading and keyboard practice less intimidating and easier to repeat.
            </p>
          </section>

          <section className={styles.section}>
            <h2>How the lessons are made</h2>
            <ol>
              <li>A lesson begins with a specific learner task, such as locating a consonant or forming a syllable block.</li>
              <li>The explanation is paired with an example that can be practised directly in the browser.</li>
              <li>Typing feedback, pronunciation controls, and progression are tested as part of the published experience.</li>
              <li>Corrections are incorporated when a language, translation, accessibility, or technical issue is reported.</li>
            </ol>
            <h3>Original and third-party material</h3>
            <p>
              Seoul Keys publishes its own lesson structure, interface, practice flow, and original practice
              sentences unless a page states otherwise. Protected lyrics, scripts, recordings, images, and branded
              media are not treated as free teaching material merely because they can be found online.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Translation and accuracy</h2>
            <p>
              The interface supports multiple languages so more learners can navigate the same Korean curriculum.
              Some interface translations may be software-assisted and can contain mistakes or lose nuance. The
              Korean source, romanisation, pronunciation cues, and translations are learning aids rather than
              professional translation advice.
            </p>
            <p>
              If something looks wrong, please report the page, the exact phrase, and the language you selected. A
              clear correction report is more useful than personal or account information.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Learning, privacy, and accessibility</h2>
            <ul>
              <li>Public lessons can be explored without publishing a profile or uploading personal content.</li>
              <li>Pronunciation and completion sounds can be controlled independently.</li>
              <li>Keyboard operation, visible focus, responsive layouts, and readable labels are part of the product work.</li>
              <li>Current data use, analytics, account progress, cookies, and child-safety considerations are described in the <Link href="/legal">Legal & Safety Center</Link>.</li>
            </ul>
          </section>

          <section className={styles.highlight}>
            <h2>Help us make a lesson clearer</h2>
            <p>
              Questions, content corrections, translation reports, accessibility problems, privacy requests, and
              copyright concerns can be sent to {contactEmail}.
            </p>
            <div className={styles.actionRow}>
              <Link className={styles.primaryLink} href="/contact">Choose a contact topic</Link>
              <a
                className={styles.secondaryLink}
                href={`mailto:${contactEmail}?subject=${encodeURIComponent("Seoul Keys content correction")}`}
              >
                Email a correction
              </a>
            </div>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>Seoul Keys · Hangul and Korean typing practice</span>
        <span><Link href="/">Home</Link> · <Link href="/legal">Legal & safety</Link></span>
      </footer>
    </div>
  );
}
