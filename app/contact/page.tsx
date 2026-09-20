import type { Metadata } from "next";
import Link from "next/link";
import styles from "../about/trust-page.module.css";

export const metadata: Metadata = {
  title: "Contact Seoul Keys — Support, Corrections & Reports",
  description:
    "Contact Seoul Keys about learning content, translation corrections, accessibility, privacy, account data, or copyright.",
  alternates: { canonical: "https://seoulkeys.com/contact" },
  openGraph: {
    title: "Contact Seoul Keys",
    description: "Send feedback, corrections, privacy requests, accessibility reports, or copyright concerns.",
    url: "https://seoulkeys.com/contact",
    type: "website",
  },
};

const contactEmail = "travels444@gmail.com";

function emailLink(subject: string) {
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;
}

export default function ContactPage() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Seoul Keys home">
          <span className={styles.brandMark} aria-hidden="true">ㅅ</span>
          <span>Seoul Keys</span>
        </Link>
        <nav className={styles.headerLinks} aria-label="Contact page navigation">
          <Link href="/about">About</Link>
          <Link href="/legal">Legal & safety</Link>
          <Link href="/">Back to learning</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>CONTACT SEOUL KEYS</p>
          <h1>Questions and corrections are welcome.</h1>
          <p className={styles.lede}>
            Use the email address below for service questions, lesson feedback, translation corrections,
            accessibility problems, privacy requests, and copyright reports.
          </p>
          <div className={styles.emailBox}>
            <span>Contact email</span>
            <a href={emailLink("Seoul Keys inquiry")}>{contactEmail}</a>
          </div>
        </section>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Choose a topic</h2>
            <div className={styles.contactGrid}>
              <article className={styles.contactCard}>
                <strong>General questions & feedback</strong>
                <p>Tell us what you were trying to learn and what would make the experience more useful.</p>
                <a href={emailLink("Seoul Keys question or feedback")}>Start an email</a>
              </article>
              <article className={styles.contactCard}>
                <strong>Lesson or translation correction</strong>
                <p>Include the page, original phrase, selected language, and your suggested correction.</p>
                <a href={emailLink("Seoul Keys content or translation correction")}>Report a correction</a>
              </article>
              <article className={styles.contactCard}>
                <strong>Accessibility or technical issue</strong>
                <p>Include the device, browser, page address, and steps that reproduce the problem.</p>
                <a href={emailLink("Seoul Keys accessibility or technical issue")}>Report an issue</a>
              </article>
              <article className={styles.contactCard}>
                <strong>Privacy or account-data request</strong>
                <p>Describe the request and email from the address connected to the account when possible.</p>
                <a href={emailLink("Seoul Keys privacy or account-data request")}>Send a privacy request</a>
              </article>
              <article className={styles.contactCard}>
                <strong>Copyright or content report</strong>
                <p>Identify the affected material, its page address, your relationship to the work, and the requested action.</p>
                <a href={emailLink("Seoul Keys copyright or content report")}>Send a content report</a>
              </article>
              <article className={styles.contactCard}>
                <strong>Other inquiry</strong>
                <p>For anything not covered above, use a clear subject line and a concise description.</p>
                <a href={emailLink("Seoul Keys inquiry")}>Contact Seoul Keys</a>
              </article>
            </div>
          </section>

          <section className={styles.section}>
            <h2>What to include</h2>
            <ul>
              <li>The page address or lesson name connected to your question.</li>
              <li>The device, browser, and selected interface language for a technical or translation issue.</li>
              <li>A concise description of what happened and what you expected.</li>
            </ul>
            <h3>Please protect sensitive information</h3>
            <p>
              Do not send passwords, payment-card details, government identification numbers, or unrelated private
              records. Seoul Keys does not request passwords by email. Messages are reviewed, but an immediate or
              individual reply cannot be guaranteed.
            </p>
          </section>

          <section className={styles.highlight}>
            <h2>How reports are handled</h2>
            <p>
              Reports are used to identify relevant content or account records, assess the issue, and make a
              correction or restriction when appropriate. Copyright concerns may result in material being limited
              or removed while the report is assessed. See the <Link href="/legal">Legal & Safety Center</Link> for
              current privacy, analytics, copyright, child-safety, and accessibility information.
            </p>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>Seoul Keys · Contact and reporting</span>
        <span><Link href="/">Home</Link> · <Link href="/about">About</Link></span>
      </footer>
    </div>
  );
}
