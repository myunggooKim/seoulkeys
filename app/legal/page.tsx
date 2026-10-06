import type { Metadata } from "next";
import Link from "next/link";
import { LegalTranslationBridge } from "./LegalTranslationBridge";

export const metadata: Metadata = {
  title: "Legal & Safety Center — Seoul Keys",
  description: "Privacy, terms, cookies, advertising, copyright, child safety, and operating disclosures for Seoul Keys.",
  alternates: { canonical: "https://seoulkeys.com/legal" },
};

const effectiveDate = "October 6, 2026";
const contactEmail = "travels444@gmail.com";

export default function LegalCenter() {
  return (
    <main className="legal-shell">
      <LegalTranslationBridge />
      <header className="legal-header">
        <Link className="brand" href="/" aria-label="Back to Seoul Keys">
          <span className="brand-mark" aria-hidden="true">ㅅ</span>
          <span>Seoul Keys</span>
        </Link>
        <Link className="button button-secondary" href="/">Back to learning</Link>
      </header>

      <section className="legal-hero">
        <p className="section-label">TRUST, SAFETY & OPERATIONS</p>
        <h1>Legal & Safety Center</h1>
        <p>개인정보처리방침 · 이용약관 · 쿠키/광고 · 저작권 · 아동 안전 · 접근성</p>
        <div className="legal-status-row">
          <span>Effective {effectiveDate}</span>
          <span>Policy version 1.4</span>
          <span className="preview-status">Public learning service · no ads</span>
        </div>
      </section>

      <div className="legal-layout">
        <nav className="legal-nav" aria-label="Legal center contents">
          <b>Contents</b>
          <a href="#snapshot">Current data snapshot</a>
          <a href="#privacy">Privacy policy</a>
          <a href="#terms">Terms of use</a>
          <a href="#cookies">Cookies & advertising</a>
          <a href="#copyright">Copyright & content</a>
          <a href="#children">Children & family safety</a>
          <a href="#accessibility">Accessibility</a>
          <a href="#contact">Contact & reporting</a>
        </nav>

        <article className="legal-content">
          <section id="snapshot" className="legal-section">
            <p className="legal-kicker">PLAIN-LANGUAGE SUMMARY</p>
            <h2>What the site does today</h2>
            <p>
              Seoul Keys is a public educational service for learning Hangul and practising Korean typing. Signed-in
              learners receive a personal progress page and visit rewards. The service does not currently offer
              payments, uploads, public profile pages, or advertising. The optional learner community publishes
              posts, replies and chosen nicknames; community rules and translation disclosures are available at{" "}
              <Link href="/community/rules">Community rules &amp; privacy</Link>.
              It does use product analytics (Cloudflare Web Analytics and Microsoft Clarity) to understand how the
              lessons are used and where learners get stuck. Typing entries stay in the active browser session;
              summarized progress is saved to the learner’s account.
            </p>
            <div className="data-snapshot-grid">
              <div><span>Account identity</span><b>Email and display name</b></div>
              <div><span>Typed answers</span><b>Not sent to our server</b></div>
              <div><span>Learning progress</span><b>Saved to personal page</b></div>
              <div><span>Advertising</span><b>Not active</b></div>
              <div><span>Product analytics</span><b>Cloudflare + Microsoft Clarity</b></div>
              <div><span>Korean speech</span><b>Pre-generated female/male audio</b></div>
              <div><span>Third-party entertainment media</span><b>Not part of the current service</b></div>
            </div>
            <h3>Learner community</h3>
            <p>
              Community messages, nicknames, language and timestamps are public. Account email is kept private
              for ownership and abuse prevention; personal typing answers and learning progress are not imported
              into the community. Public message text may be processed by Cloudflare Workers AI for translation.
              No account email, private progress or session credentials are included in translation requests.
              Cached translations and moderation records are retained with the community messages. Removal from
              public view is a soft delete; contact us to request complete erasure of messages and their translations.
              Please read the <Link href="/community/rules">community rules and privacy details</Link> before posting.
            </p>
          </section>

          <section id="privacy" className="legal-section">
            <p className="legal-kicker">개인정보처리방침 · PRIVACY POLICY</p>
            <h2>Privacy by minimization</h2>
            <p>
              Seoul Keys uses the authenticated account email and display name to provide a personal learning page.
              It does not sell personal information, build advertising profiles, or ask learners for phone numbers,
              precise locations, contacts, photos, or payment details.
            </p>
            <h3>Information used by the current service</h3>
            <div className="policy-table" role="table" aria-label="Current data processing">
              <div role="row"><b role="columnheader">Information</b><b role="columnheader">Purpose and retention</b></div>
              <div role="row"><span role="cell">Authenticated email address and display name</span><span role="cell">Identify the learner, secure account-owned progress, and display the personal page. Retained while the learning account remains active or until a valid deletion request is completed.</span></div>
              <div role="row"><span role="cell">Lesson number, completed sentences, practice time, accuracy, XP, visit streak, benefit balance, and earned badges</span><span role="cell">Provide progress sync, the personal dashboard, and repeat-visit benefits. Retained with the learning account.</span></div>
              <div role="row"><span role="cell">Game type, active play duration, and last played time for signed-in learners</span><span role="cell">Help the site operator understand game use and learning difficulties. Only the authorized operator can view per-account records. No typed answers or keystrokes are stored. Retained with the learning account and deleted with it.</span></div>
              <div role="row"><span role="cell">Interface language, keyboard layout, pronunciation and sound settings</span><span role="cell">Saved in browser storage until the learner clears site data.</span></div>
              <div role="row"><span role="cell">Daily lesson number and completion state</span><span role="cell">Saved on the device to resume the current day’s lesson; replaced as the lesson changes.</span></div>
              <div role="row"><span role="cell">Text typed into practice fields</span><span role="cell">Used in memory to score the exercise. The service does not submit or persist it on a Seoul Keys server.</span></div>
              <div role="row"><span role="cell">Technical access and security logs</span><span role="cell">The hosting infrastructure may process standard request data such as IP address, user agent, time, and requested page to deliver and protect the site. Seoul Keys does not use these logs for advertising profiles.</span></div>
            </div>
            <h3>Korean pronunciation</h3>
            <p>
              Fixed lessons use pre-generated female and male Korean audio files. Playback does not send the learner’s
              typed answer to a TTS provider. If an administrator-added sentence has no recorded file, the site can
              fall back to the browser or operating system speech feature; a device vendor may then process speech
              according to that vendor’s settings and policy. Learners can turn pronunciation off at any time.
            </p>
            <h3>Your choices and rights</h3>
            <ul>
              <li>Turn pronunciation and typewriter sounds off independently.</li>
              <li>Remove local preferences and lesson progress by clearing this site’s browser data.</li>
              <li>Sign out of the personal page and continue using available public information.</li>
              <li>
                Request information, correction, deletion, restriction, or objection where applicable by emailing{" "}
                <a href={`mailto:${contactEmail}?subject=${encodeURIComponent("Seoul Keys privacy request")}`}>
                  {contactEmail}
                </a>.
              </li>
            </ul>
            <h3>Security and international delivery</h3>
            <p>
              The site uses encrypted HTTPS delivery and minimizes stored information. Hosting may process requests
              in multiple countries to provide reliable delivery. No system is perfectly secure; material incidents
              will be assessed and reported as required by applicable law.
            </p>
          </section>

          <section id="terms" className="legal-section">
            <p className="legal-kicker">이용약관 · TERMS OF USE</p>
            <h2>Use Seoul Keys to learn and practice</h2>
            <ol>
              <li><b>Educational service.</b> Seoul Keys provides typing and language practice, not professional translation, immigration, legal, medical, or emergency advice.</li>
              <li><b>Permitted use.</b> Learners may use the service for personal and classroom learning. Automated scraping, security attacks, interference, impersonation, unlawful use, and unauthorized redistribution of protected content are prohibited.</li>
              <li><b>Availability.</b> Lessons may change, pause, or be removed for maintenance, safety, licensing, or technical reasons.</li>
              <li><b>Learning results.</b> Scores and translations are instructional aids. Accuracy and fluency outcomes are not guaranteed.</li>
              <li><b>Third-party services.</b> Pre-generated speech models, optional browser speech, hosting, and any third-party content introduced later may be governed by additional provider terms.</li>
              <li><b>Liability.</b> To the extent allowed by law, the service is provided as available. Mandatory consumer rights are not excluded.</li>
              <li><b>Changes.</b> Material changes will be dated and summarized on this page before they take effect where notice is required.</li>
            </ol>
          </section>

          <section id="cookies" className="legal-section">
            <p className="legal-kicker">쿠키·광고 정책 · COOKIES & ADS</p>
            <h2>Cookies, analytics &amp; AdSense connection</h2>
            <p>
              The service uses browser local storage for essential preferences and daily lesson continuity.
              Google AdSense code is installed for site connection and review. Ad requests remain paused;
              advertising is not active.
            </p>
            <p>
              Loading the Google script sends technical request information to Google and can read existing
              Google cookies. Pausing ad requests is not a consent management platform. Required consent controls
              must be configured before advertising is activated.
            </p>
            <p>
              Learn more about how Google uses data on partner sites in the{" "}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
                Google partner-site privacy notice
              </a>.
            </p>
            <p>
              It does use two product-analytics tools so we can improve the lessons:
            </p>
            <ul>
              <li>
                <b>Cloudflare Web Analytics</b> — privacy-first page and visit counts. No cookies, no cross-site
                tracking.
              </li>
              <li>
                <b>Microsoft Clarity</b> — aggregated interaction data, heatmaps, and session replays that show where
                learners hesitate or get stuck. Clarity sets its own cookies and is governed by the{" "}
                <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">
                  Microsoft Privacy Statement
                </a>. Text typed into practice fields is not sent to our server, and account passwords are never
                entered on this site.
              </li>
            </ul>
            <p>
              You can block these at any time with your browser’s tracking protection or an ad/tracker blocker; the
              lessons and games continue to work normally.
            </p>
            <h3>If advertising is introduced</h3>
            <p>
              Advertising is not active today. Before any advertising provider is enabled, Seoul Keys will update
              this notice to identify the provider, purposes, and available privacy choices.
            </p>
            <ul>
              <li>This policy and the on-site privacy control must be updated with the actual providers and purposes.</li>
              <li>Where required, ads and non-essential storage must remain blocked until a valid choice is made.</li>
              <li>EEA, UK, and Swiss traffic must use a Google-certified consent management platform compatible with Google’s applicable publisher requirements.</li>
              <li>Users must be able to revisit and change privacy choices.</li>
              <li>Child-directed audiences must not receive behavioral advertising.</li>
            </ul>
          </section>

          <section id="copyright" className="legal-section">
            <p className="legal-kicker">저작권·콘텐츠 정책 · COPYRIGHT</p>
            <h2>Original lessons first; protected media only with permission</h2>
            <p>
              The interface, original practice sentences, course structure, and original game presentation are
              Seoul Keys materials unless otherwise stated. Korean language facts and ordinary short expressions
              may not be proprietary, but a particular song lyric, screenplay, subtitle, recording, image, logo,
              character, or branded title can be protected by its owner.
            </p>
            <ul>
              <li>K-POP lyrics and real K-Drama or film dialogue will be published only when licensed or otherwise lawfully usable.</li>
              <li>Current drama-style practice lines are original dialogue and are not represented as quotations from a real production.</li>
              <li>Rights-holder names and marks remain the property of their owners and do not imply endorsement.</li>
              <li>
                Copyright owners and other affected parties can report a concern at{" "}
                <a href={`mailto:${contactEmail}?subject=${encodeURIComponent("Seoul Keys copyright report")}`}>
                  {contactEmail}
                </a>. Reports are reviewed and disputed material may be limited or removed while a concern is assessed.
              </li>
            </ul>
          </section>

          <section id="children" className="legal-section">
            <p className="legal-kicker">아동·가족 안전 · CHILD SAFETY</p>
            <h2>A low-data learning environment</h2>
            <p>
              The service has no real-time public chat, direct messaging, public profile page, upload, or location-sharing feature.
              The optional community has public text posts and replies under chosen nicknames. Never publish a
              child’s name, contact details, school or other identifying information. Younger learners should not
              post personal information and should use the community only with a parent, guardian or teacher.
              Signed-in progress uses an email address and display name. It is intended for general language learning
              and is not designed to collect children’s information without appropriate safeguards. Younger learners
              should use the service with a parent, guardian, or teacher. Age-appropriate design, parental consent,
              and regional child-privacy requirements must be reviewed before marketing accounts to children.
            </p>
          </section>

          <section id="accessibility" className="legal-section">
            <p className="legal-kicker">접근성 · ACCESSIBILITY</p>
            <h2>Learning should remain operable</h2>
            <p>
              Seoul Keys supports keyboard navigation, visible focus states, semantic labels, responsive layouts,
              reduced reliance on color alone, and independent audio controls. Learners can turn both pronunciation
              and completion sounds off. Accessibility issues can be reported through the{" "}
              <Link href="/contact">contact page</Link> with the device, browser, page, and problem description.
            </p>
          </section>

          <section id="contact" className="legal-section launch-gate">
            <p className="legal-kicker">CONTACT & REPORTING</p>
            <h2>Questions, corrections, and rights requests</h2>
            <p>
              Questions about the service, privacy requests, accessibility problems, content corrections, and
              copyright reports can be sent to{" "}
              <a href={`mailto:${contactEmail}?subject=${encodeURIComponent("Seoul Keys inquiry")}`}>
                {contactEmail}
              </a>. Include the relevant page address and enough detail to identify the issue. Sensitive account or
              identity documents should not be included unless specifically requested through a secure process.
            </p>
            <p>
              The <Link href="/about">About page</Link> explains the service purpose, lesson approach, and content
              correction process. The <Link href="/contact">Contact page</Link> provides topic-specific email links.
            </p>
            <div className="launch-checklist">
              <span><b>✓</b> General questions and service feedback</span>
              <span><b>✓</b> Privacy and account-data requests</span>
              <span><b>✓</b> Accessibility and translation corrections</span>
              <span><b>✓</b> Copyright and content reports</span>
            </div>
            <p className="legal-note">
              These documents describe the current service and are not a substitute for advice from a qualified
              lawyer. They will be updated when the service, data practices, or third-party providers change.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
