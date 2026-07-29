import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal & Safety Center — Seoul Keys",
  description: "Privacy, terms, cookies, advertising, copyright, child safety, and operating disclosures for Seoul Keys.",
};

const effectiveDate = "July 23, 2026";

export default function LegalCenter() {
  return (
    <main className="legal-shell">
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
          <span>Policy version 1.0</span>
          <span className="preview-status">Private preview · no ads</span>
        </div>
      </section>

      <div className="legal-layout">
        <nav className="legal-nav" aria-label="Legal center contents">
          <b>Contents</b>
          <a href="#snapshot">Current data snapshot</a>
          <a href="#privacy">Privacy policy</a>
          <a href="#terms">Terms of use</a>
          <a href="#cookies">Cookies & advertising</a>
          <a href="#copyright">Copyright & licensed content</a>
          <a href="#children">Children & family safety</a>
          <a href="#accessibility">Accessibility</a>
          <a href="#contact">Contact & launch status</a>
        </nav>

        <article className="legal-content">
          <section id="snapshot" className="legal-section">
            <p className="legal-kicker">PLAIN-LANGUAGE SUMMARY</p>
            <h2>What the site does today</h2>
            <p>
              Seoul Keys is currently a private educational preview. Signed-in learners receive a personal progress
              page and visit rewards. The service does not offer payments, uploads, public profiles, or advertising.
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
              <div><span>Licensed media</span><b>Not published yet</b></div>
            </div>
          </section>

          <section id="privacy" className="legal-section">
            <p className="legal-kicker">개인정보처리방침 · PRIVACY POLICY</p>
            <h2>Privacy by minimization</h2>
            <p>
              Seoul Keys uses the authenticated account email and display name to provide a personal learning page.
              It does not sell personal information, build advertising profiles, or ask learners for phone numbers,
              precise locations, contacts, photos, or payment details.
            </p>
            <h3>Information used by the current preview</h3>
            <div className="policy-table" role="table" aria-label="Current data processing">
              <div role="row"><b role="columnheader">Information</b><b role="columnheader">Purpose and retention</b></div>
              <div role="row"><span role="cell">Authenticated email address and display name</span><span role="cell">Identify the learner, secure account-owned progress, and display the personal page. Retained while the learning account remains active or until a valid deletion request is completed.</span></div>
              <div role="row"><span role="cell">Lesson number, completed sentences, practice time, accuracy, XP, visit streak, benefit balance, and earned badges</span><span role="cell">Provide progress sync, the personal dashboard, and repeat-visit benefits. Retained with the learning account.</span></div>
              <div role="row"><span role="cell">Interface language, keyboard layout, pronunciation and sound settings</span><span role="cell">Saved in browser storage until the learner clears site data.</span></div>
              <div role="row"><span role="cell">Daily lesson number and completion state</span><span role="cell">Saved on the device to resume the current day’s lesson; replaced as the lesson changes.</span></div>
              <div role="row"><span role="cell">Text typed into practice fields</span><span role="cell">Used in memory to score the exercise. The preview does not submit or persist it on a Seoul Keys server.</span></div>
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
              <li>Request information, correction, deletion, restriction, or objection where applicable once the operator contact channel is published.</li>
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
              <li><b>Third-party services.</b> Pre-generated speech models, optional browser speech, hosting, and future licensed media may be governed by additional provider terms.</li>
              <li><b>Liability.</b> To the extent allowed by law, the preview is provided as available. Mandatory consumer rights are not excluded.</li>
              <li><b>Changes.</b> Material changes will be dated and summarized on this page before they take effect where notice is required.</li>
            </ol>
          </section>

          <section id="cookies" className="legal-section">
            <p className="legal-kicker">쿠키·광고 정책 · COOKIES & ADS</p>
            <h2>No advertising cookies — product analytics only</h2>
            <p>
              The preview uses browser local storage for essential preferences and daily lesson continuity. It does
              not load Google AdSense, behavioral advertising, or social pixels.
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
            <h3>Before advertising is enabled</h3>
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
            <h2>Original lessons first; licensed media only with permission</h2>
            <p>
              The interface, original practice sentences, course structure, and original game presentation are
              Seoul Keys materials unless otherwise stated. Korean language facts and ordinary short expressions
              may not be proprietary, but a particular song lyric, screenplay, subtitle, recording, image, logo,
              character, or branded title can be protected by its owner.
            </p>
            <ul>
              <li>K-POP lyrics and real K-Drama or film dialogue will be published only when licensed or otherwise lawfully usable.</li>
              <li>Current drama-style preview lines are original practice dialogue and are not represented as quotations from a real production.</li>
              <li>Rights-holder names and marks remain the property of their owners and do not imply endorsement.</li>
              <li>A takedown channel and response workflow must be active before third-party media launches.</li>
            </ul>
          </section>

          <section id="children" className="legal-section">
            <p className="legal-kicker">아동·가족 안전 · CHILD SAFETY</p>
            <h2>A low-data learning environment</h2>
            <p>
              The preview has no public chat, direct messaging, public profile, upload, or location-sharing feature.
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
              and completion sounds off. Accessibility issues should be included in the future contact and reporting
              channel with the device, browser, page, and problem description.
            </p>
          </section>

          <section id="contact" className="legal-section launch-gate">
            <p className="legal-kicker">CONTACT & PUBLIC-LAUNCH GATE</p>
            <h2>Operator details required before public launch</h2>
            <p>
              This site is still a private preview. The owner must publish the legal operator name, a monitored
              privacy/support email address, and any address or registration information required by the operating
              jurisdiction before making the site public, accepting payments, enabling ads, collecting inquiries,
              or publishing licensed entertainment content.
            </p>
            <div className="launch-checklist">
              <span><b>✓</b> Privacy, terms, cookie, copyright, child-safety and accessibility framework</span>
              <span><b>✓</b> Current data inventory and local-storage disclosure</span>
              <span><b>○</b> Operator legal name and monitored email — owner input required</span>
              <span><b>○</b> Certified consent platform — required before applicable ad traffic</span>
              <span><b>○</b> Rights-holder licenses — required before real lyrics or screenplay excerpts</span>
            </div>
            <p className="legal-note">
              These documents are an operationally accurate product baseline, not a substitute for advice from a
              qualified lawyer familiar with the operator’s country and launch markets.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
