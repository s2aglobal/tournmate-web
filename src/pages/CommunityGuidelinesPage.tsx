import { Link } from "react-router-dom";

// Linked from the apps' review sheet, report sheet and "review removed"
// notice (https://www.tournmate.com/community-guidelines), so keep the URL.
export default function CommunityGuidelinesPage() {
  return (
    <main className="legal-page">
      <h1>Community Guidelines</h1>
      <p className="legal-meta">Last updated November 16, 2026</p>

      <div className="legal-content">
        <p>
          TournMate is for people who love playing sport together. These
          guidelines apply to everything you post or share in the app,
          including sportsmanship reviews and live video. Breaking them can get
          your content removed.
        </p>

        <h2>1. Be respectful</h2>
        <p>
          Write about others the way you would want them to write about you.
          No swearing, insults or name-calling, in any language. Keep it about
          what happened on court.
        </p>

        <h2>2. Rate sportsmanship, not skill</h2>
        <p>
          Sportsmanship ratings are about how someone plays, not how well. Fair
          line calls, being on time, shaking hands and helping new players are
          what count. A tough loss is not a reason for a low rating, and your
          Elo already shows skill.
        </p>

        <h2>3. No personal info, links or contact details</h2>
        <p>Reviews are public, so don&apos;t include:</p>
        <ul>
          <li>phone numbers, including ones written out in words;</li>
          <li>email addresses;</li>
          <li>social media handles or &ldquo;DM me&rdquo; style requests;</li>
          <li>website links;</li>
          <li>anyone&apos;s address or other private details.</li>
        </ul>
        <p>
          To meet up with players, use sessions and tournaments in the app.
        </p>

        <h2>4. No harassment, hate or threats</h2>
        <p>
          We remove content that harasses or bullies someone, attacks people
          for who they are (such as race, religion, gender, sexual orientation,
          disability or age), threatens violence, or is sexual. Don&apos;t post
          fake reviews or rate people you haven&apos;t played with.
        </p>

        <h2>5. Live video</h2>
        <ul>
          <li>Only film matches where everyone being filmed agrees to it.</li>
          <li>
            Minors may only be filmed with the consent of a parent or guardian.
          </li>
          <li>
            Never film in changing rooms, toilets or other private areas.
          </li>
          <li>
            Stop filming if someone asks you to, and keep the stream about the
            match.
          </li>
        </ul>

        <h2>6. How reports work</h2>
        <ul>
          <li>
            Anyone can report a review from the &ldquo;&hellip;&rdquo; menu
            next to it.
          </li>
          <li>
            A review is hidden for everyone after 3 reports, and our team then
            looks at it. We may remove it or bring it back.
          </li>
          <li>
            If your review is removed, it stops counting toward that
            player&apos;s rating, and you can write a new one.
          </li>
          <li>
            People who break these guidelines repeatedly can lose access to
            ratings or live streaming.
          </li>
        </ul>

        <h2>7. Contact</h2>
        <p>
          Questions, or something we should look at? Email us at{" "}
          <a href="mailto:contact@s2agloballlc.com">contact@s2agloballlc.com</a>.
          See also our <Link to="/terms">Terms &amp; Conditions</Link> and{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
