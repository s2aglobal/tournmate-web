import { useScrollReveal } from "../hooks/useScrollReveal";

export default function LandingPage() {
  useScrollReveal();

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-eyebrow">Built for players, by players</div>
            <h1>
              The Court
              <br />
              Is <span className="gradient-text">Yours.</span>
            </h1>
            <p className="hero-subtitle">
              Organize tournaments, join open play sessions, discover courts near
              you, and track every calorie burned — all in one app.
            </p>
            <div className="hero-actions">
              <a
                href="https://apps.apple.com/us/app/tournmate/id6765781689"
                className="store-badge"
              >
                <img
                  src="/assets/app-store-badge.svg"
                  alt="Download on the App Store"
                />
              </a>
              <a href="#features" className="btn-secondary">
                See features ↓
              </a>
            </div>
          </div>
          <div className="hero-phone-wrapper scale-in">
            <div className="phone-mockup large">
              <div className="phone-glow" />
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/play-tab.png"
                    alt="TournMate Play tab"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="social-proof fade-in">
        <div className="social-proof-inner">
          <div className="proof-item">
            <span className="proof-number">6+</span>
            <span className="proof-label">Tournament Formats</span>
          </div>
          <div className="proof-item">
            <span className="proof-number">100%</span>
            <span className="proof-label">Free to Use</span>
          </div>
          <div className="proof-item">
            <span className="proof-number">&#x1F34E;</span>
            <span className="proof-label">Apple Health Sync</span>
          </div>
          <div className="proof-item">
            <span className="proof-number">&#x1F30D;</span>
            <span className="proof-label">Global Coverage</span>
          </div>
        </div>
      </section>

      {/* Tournaments */}
      <section className="feature-section light" id="features">
        <div className="feature-inner">
          <div className="feature-text fade-in-left">
            <div className="feature-label purple">Tournaments</div>
            <h2>
              Host. Compete.
              <br />
              Win Glory.
            </h2>
            <p>
              Create single-elimination brackets or round-robin leagues in
              seconds. Handle registrations, seedings, live scores, and champion
              crowning — all from your phone.
            </p>
            <ul className="feature-list">
              <li>
                <span className="icon">&#x26A1;</span> Single elimination, round
                robin, Swiss, and more
              </li>
              <li>
                <span className="icon">&#x1F465;</span> Singles, doubles, mixed
                — every format covered
              </li>
              <li>
                <span className="icon">&#x1F4B0;</span> Entry fees, prize pools,
                and payment info built in
              </li>
              <li>
                <span className="icon">&#x1F4CA;</span> Live brackets with
                team-submitted scores
              </li>
            </ul>
          </div>
          <div className="feature-phones fade-in-right">
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/play-tab.png"
                    alt="Tournament list"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/tournament-detail.png"
                    alt="Tournament detail"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Play */}
      <section className="feature-section dark">
        <div className="feature-inner reversed">
          <div className="feature-text fade-in-right">
            <div className="feature-label green">Open Play</div>
            <h2>
              Find a Game.
              <br />
              Anytime.
            </h2>
            <p>
              No tournament? No problem. Post a casual session at your local
              court, set the skill level, and let nearby players find you.
            </p>
            <ul className="feature-list">
              <li>
                <span className="icon">&#x1F4CD;</span> Auto-detect venue with
                map integration
              </li>
              <li>
                <span className="icon">&#x1F3AF;</span> Filter by skill level
                and game type
              </li>
              <li>
                <span className="icon">&#x23F1;</span> Flexible durations from 1
                hour to open-ended
              </li>
              <li>
                <span className="icon">&#x270F;&#xFE0F;</span> Edit sessions on
                the fly as plans change
              </li>
            </ul>
          </div>
          <div className="feature-phones fade-in-left">
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/post-session.png"
                    alt="Post open play session"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Court Finder */}
      <section className="feature-section subtle">
        <div className="feature-inner">
          <div className="feature-text fade-in-left">
            <div className="feature-label orange">Court Finder</div>
            <h2>
              Discover Courts
              <br />
              Near You.
            </h2>
            <p>
              Search by zip code, see distance from your area, get directions,
              call the venue, or visit their website — all in a tap.
            </p>
            <ul className="feature-list">
              <li>
                <span className="icon">&#x1F5FA;&#xFE0F;</span> Map integration
                with one-tap navigation
              </li>
              <li>
                <span className="icon">&#x1F4DE;</span> Call, visit website, or
                get directions instantly
              </li>
              <li>
                <span className="icon">&#x1F4CF;</span> See how far each court
                is from your home area
              </li>
            </ul>
          </div>
          <div className="feature-phones fade-in-right">
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/courts.png"
                    alt="Court finder search"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/courts-results.png"
                    alt="Court search results"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calorie Tracking */}
      <section className="feature-section dark">
        <div className="feature-inner reversed">
          <div className="feature-text fade-in-right">
            <div className="feature-label red">Calorie Tracking</div>
            <h2>
              Every Rally
              <br />
              Counts.
            </h2>
            <p>
              Sync with Apple Health to automatically pull workout data, or use
              our science-backed MET estimation for manual tracking. Works for
              tournaments, open play, and solo court visits.
            </p>
            <ul className="feature-list">
              <li>
                <span className="icon">&#x231A;</span> Auto-detect Apple Watch
                workouts
              </li>
              <li>
                <span className="icon">&#x1F9EE;</span> MET-based estimation as
                fallback
              </li>
              <li>
                <span className="icon">&#x1F4C8;</span> Track total calories,
                sessions, and averages
              </li>
              <li>
                <span className="icon">&#x26A1;</span> Quick Play mode for
                casual court visits
              </li>
            </ul>
          </div>
          <div className="feature-phones fade-in-left">
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/quick-play.png"
                    alt="Quick play"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/profile.png"
                    alt="Profile stats"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile */}
      <section className="feature-section light">
        <div className="feature-inner">
          <div className="feature-text fade-in-left">
            <div className="feature-label blue">Your Profile</div>
            <h2>
              Track Your
              <br />
              Journey.
            </h2>
            <p>
              See your match stats, Elo skill rating, calorie history, and
              sportsmanship score — all in one place. Customize your avatar and
              manage your tournament area.
            </p>
            <ul className="feature-list">
              <li>
                <span className="icon">&#x1F3C5;</span> Elo rating with seed
                tiers
              </li>
              <li>
                <span className="icon">&#x1F4CA;</span> Wins, matches, and win
                rate at a glance
              </li>
              <li>
                <span className="icon">&#x1F525;</span> Calorie history with
                session breakdowns
              </li>
              <li>
                <span className="icon">&#x1F3A8;</span> Unique DiceBear avatars
              </li>
            </ul>
          </div>
          <div className="feature-phones fade-in-right">
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/profile-info.png"
                    alt="Profile with avatar"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/profile.png"
                    alt="Profile stats"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium */}
      <section className="feature-section subtle">
        <div className="feature-inner">
          <div className="feature-text fade-in-left">
            <div className="feature-label purple">Premium Experience</div>
            <h2>
              Beautifully
              <br />
              Crafted.
            </h2>
            <p>
              Every screen is designed with care — from the immersive dark-mode
              onboarding to the clean, intuitive profile setup. TournMate feels
              like a premium sports companion from the moment you open it.
            </p>
          </div>
          <div className="feature-phones fade-in-right">
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/welcome.png"
                    alt="Welcome screen"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen no-notch">
                  <img
                    src="/assets/screenshots/login.png"
                    alt="Login screen"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header fade-in">
            <h2>Get Started in 3 Steps</h2>
            <p>
              From download to your first match — it takes less than 2 minutes.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card fade-in">
              <div className="step-number">1</div>
              <h3>Create Your Profile</h3>
              <p>
                Sign up with Apple, Google, or email. Pick your avatar, set your
                skill level, and choose your home area.
              </p>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">2</div>
              <h3>Find or Host</h3>
              <p>
                Browse nearby tournaments and open play sessions, or create your
                own in seconds.
              </p>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">3</div>
              <h3>Play &amp; Track</h3>
              <p>
                Compete, submit scores, climb the rankings, and track every
                calorie burned on court.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="cta-section" id="download">
        <div className="cta-content fade-in">
          <img src="/assets/icon.png" alt="TournMate" className="cta-icon" />
          <h2>
            Ready to Step
            <br />
            on the Court?
          </h2>
          <p>
            Download TournMate free on the App Store and start your journey
            today.
          </p>
          <a
            href="https://apps.apple.com/us/app/tournmate/id6765781689"
            className="store-badge"
          >
            <img
              src="/assets/app-store-badge.svg"
              alt="Download on the App Store"
            />
          </a>
        </div>
      </section>
    </>
  );
}
