import { useEffect, useState, type CSSProperties } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { sportIcon, sportName, useSiteConfig } from "../services/siteConfig";

const SHOT = "/assets/screenshots/v2";

/** Hero screens for the live sports; any other live sport falls back to the picker. */
const HERO_SCREENS: Record<string, { src: string; tagline: string; color: string }> = {
  pickleball: { src: `${SHOT}/play-pickleball.webp`, tagline: "Dink. Drive. Dominate.", color: "#175CB3" },
  badminton: { src: `${SHOT}/play-badminton.webp`, tagline: "Smash. Rally. Win.", color: "#5A0E9C" },
  tennis: { src: `${SHOT}/play-tennis.webp`, tagline: "Serve. Volley. Ace.", color: "#1F7A45" },
};

/**
 * App Store custom product pages per sport (App Store Connect → Custom Product
 * Pages). Sports without one link to the default App Store page.
 */
const SPORT_STORE_PAGES: Record<string, string> = {
  pickleball: "https://apps.apple.com/us/app/tournmate/id6765781689?ppid=47a9c6af-cbae-460f-abd6-7212d6328701",
};

/** App Store in-app event; the hero link hides itself once the event ends. */
const STORE_EVENT = {
  url: "https://apps.apple.com/us/app/id6765781689?eventid=6819148170",
  label: "New: Pickleball & Tennis are here",
  endsAt: new Date("2026-11-05T23:59:00-06:00"),
};

function Phone({ src, alt, large, glow }: { src: string; alt: string; large?: boolean; glow?: boolean }) {
  return (
    <div className={`phone-mockup${large ? " large" : ""}`}>
      {glow && <div className="phone-glow" />}
      <div className="phone-frame">
        <div className="phone-screen">
          <img src={src} alt={alt} loading={large ? "eager" : "lazy"} width={600} height={1304} />
        </div>
      </div>
    </div>
  );
}

function GooglePlayButton({ url }: { url: string | null }) {
  const icon = (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.2 2.4c-.3.3-.4.7-.4 1.2v16.8c0 .5.1.9.4 1.2l9.3-9.6-9.3-9.6Zm10.6 10.9 2.6 2.7-11.2 6.4c-.4.2-.8.3-1.2.2l9.8-9.3Zm0-2.6L5 1.4c.4-.1.8 0 1.2.2L17.4 8l-2.6 2.7Zm3.9.3L20.6 12c.8.5.8 1.6 0 2.1l-2 1.1-2.8-2.9 2.9-1.3Z" />
    </svg>
  );
  if (!url) {
    return (
      <span className="store-btn soon" aria-label="Coming soon to Google Play">
        {icon}
        <span>
          <small>Coming soon to</small>
          Google Play
        </span>
      </span>
    );
  }
  return (
    <a className="store-btn" href={url} aria-label="Get it on Google Play">
      {icon}
      <span>
        <small>Get it on</small>
        Google Play
      </span>
    </a>
  );
}

function StoreButtons({ ios, android }: { ios: string; android: string | null }) {
  return (
    <div className="store-buttons">
      <a href={ios} className="store-badge">
        <img src="/assets/app-store-badge.svg" alt="Download on the App Store" />
      </a>
      <GooglePlayButton url={android} />
    </div>
  );
}

export default function LandingPage() {
  useScrollReveal();
  const config = useSiteConfig();
  const liveSports = config.live.filter((s) => s in HERO_SCREENS);
  const soonCount = config.categories.reduce(
    (n, c) => n + c.sports.filter((s) => !config.live.includes(s)).length,
    0,
  );

  // Hero sport switcher: rotates through the live sports until the visitor picks one.
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    if (pinned || liveSports.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % liveSports.length), 3500);
    return () => window.clearInterval(timer);
  }, [pinned, liveSports.length]);
  const activeSport = liveSports[active % Math.max(liveSports.length, 1)] ?? "pickleball";

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            {Date.now() < STORE_EVENT.endsAt.getTime() && (
              <a className="hero-event" href={STORE_EVENT.url}>
                <span className="hero-event-dot" />
                {STORE_EVENT.label}
                <span aria-hidden="true">→</span>
              </a>
            )}
            <div className="hero-eyebrow">Pickleball · Badminton · Tennis</div>
            <h1>
              The Court
              <br />
              Is <span className="gradient-text">Yours.</span>
            </h1>
            <p className="hero-subtitle">
              Run tournaments, join open play, find courts near you and track
              your rating, all built around the sport you play.
            </p>
            <div className="sport-switcher" role="tablist" aria-label="Choose a sport">
              {liveSports.map((sport, i) => (
                <button
                  key={sport}
                  type="button"
                  role="tab"
                  aria-selected={sport === activeSport}
                  className={`sport-chip${sport === activeSport ? " active" : ""}`}
                  style={{ "--chip": HERO_SCREENS[sport].color } as CSSProperties}
                  onClick={() => {
                    setActive(i);
                    setPinned(true);
                  }}
                >
                  <img src={sportIcon(sport, 96)} alt="" />
                  {sportName(sport)}
                </button>
              ))}
            </div>
            <p className="sport-tagline" aria-live="polite">
              {HERO_SCREENS[activeSport]?.tagline}
            </p>
            <div className="hero-actions">
              <StoreButtons
                ios={SPORT_STORE_PAGES[activeSport] ?? config.iosStoreURL}
                android={config.androidStoreURL}
              />
            </div>
          </div>
          <div className="hero-phone-wrapper scale-in">
            <div className="phone-mockup large">
              <div className="phone-glow" />
              <div className="phone-frame">
                <div className="phone-screen hero-screens">
                  {liveSports.map((sport) => (
                    <img
                      key={sport}
                      src={HERO_SCREENS[sport].src}
                      alt={`TournMate Play tab for ${sportName(sport)}`}
                      width={600}
                      height={1304}
                      className={sport === activeSport ? "active" : ""}
                    />
                  ))}
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
            <span className="proof-number">{config.live.length}</span>
            <span className="proof-label">Sports Live</span>
          </div>
          <div className="proof-item">
            <span className="proof-number">{soonCount}+</span>
            <span className="proof-label">Sports Coming</span>
          </div>
          <div className="proof-item">
            <span className="proof-number">6</span>
            <span className="proof-label">Tournament Formats</span>
          </div>
          <div className="proof-item">
            <span className="proof-number">100%</span>
            <span className="proof-label">Free to Use</span>
          </div>
        </div>
      </section>

      {/* Sports */}
      <section className="sports-section" id="sports">
        <div className="container">
          <div className="section-header fade-in">
            <div className="feature-label purple">Pick your sport</div>
            <h2>One app. Every court.</h2>
            <p>
              Each sport gets its own scoring, rules and look. Switch anytime and
              your tournaments, rankings and alerts follow.
            </p>
          </div>
          <div className="sport-categories fade-in">
            {config.categories.map((category) => (
              <div className="sport-category" key={category.id}>
                <h3>{category.title}</h3>
                <div className="sport-grid">
                  {category.sports.map((sport) => {
                    const live = config.live.includes(sport);
                    const page = live ? SPORT_STORE_PAGES[sport] : undefined;
                    const Tile = page ? "a" : "div";
                    return (
                      <Tile
                        key={sport}
                        href={page}
                        aria-label={page ? `Get TournMate for ${sportName(sport)} on the App Store` : undefined}
                        className={`sport-tile${live ? " live" : ""}${page ? " linked" : ""}`}
                        style={
                          live && HERO_SCREENS[sport]
                            ? ({ "--tile": HERO_SCREENS[sport].color } as CSSProperties)
                            : undefined
                        }
                      >
                        <span className={`sport-badge${live ? " live" : ""}`}>
                          {live ? "Live" : "Soon"}
                        </span>
                        <img src={sportIcon(sport, 192)} alt="" loading="lazy" />
                        <span className="sport-name">{sportName(sport)}</span>
                      </Tile>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="sports-note fade-in">
            More sports roll out right in the app, with no update needed. Pick the
            sport you play and we'll let you know when it goes live.
          </p>
        </div>
      </section>

      {/* Tournaments */}
      <section className="feature-section dark" id="features">
        <div className="feature-inner">
          <div className="feature-text fade-in-left">
            <div className="feature-label purple">Tournaments</div>
            <h2>
              Host. Compete.
              <br />
              Win Glory.
            </h2>
            <p>
              Create an event in minutes with a step-by-step wizard. Registrations,
              brackets, live scores and standings are all handled for you.
            </p>
            <ul className="feature-list">
              <li>
                <span className="icon">&#x26A1;</span> Single &amp; double
                elimination, round robin, group + knockout, Swiss and manual draw
              </li>
              <li>
                <span className="icon">&#x1F3BE;</span> Sport-correct scoring:
                games to 21, games to 11, or sets and tiebreaks
              </li>
              <li>
                <span className="icon">&#x1F4CA;</span> Live standings with
                head-to-head tie-breakers
              </li>
              <li>
                <span className="icon">&#x1F4C4;</span> Share or print draws,
                matches and standings as a PDF
              </li>
            </ul>
          </div>
          <div className="feature-phones fade-in-right">
            <Phone src={`${SHOT}/tennis-standings.webp`} alt="Tennis round robin standings" />
            <Phone src={`${SHOT}/matches.webp`} alt="Tournament matches with scores" />
          </div>
        </div>
      </section>

      {/* Find your next game */}
      <section className="feature-section light">
        <div className="feature-inner reversed">
          <div className="feature-text fade-in-right">
            <div className="feature-label green">Open Play</div>
            <h2>
              Find Your
              <br />
              Next Game.
            </h2>
            <p>
              No tournament this weekend? Join a pickup session nearby, or host your
              own and let local players find you.
            </p>
            <ul className="feature-list">
              <li>
                <span className="icon">&#x1F50D;</span> Sort by soonest, nearest,
                lowest price or filling fast
              </li>
              <li>
                <span className="icon">&#x1F3AF;</span> Filter by skill level and
                game type
              </li>
              <li>
                <span className="icon">&#x1F465;</span> See who's coming before you
                show up
              </li>
              <li>
                <span className="icon">&#x1F514;</span> Alerts for new events near
                you, for the sport you play
              </li>
            </ul>
          </div>
          <div className="feature-phones fade-in-left">
            <Phone src={`${SHOT}/open-play.webp`} alt="Pickleball open play sessions" />
            <Phone src={`${SHOT}/sort-filter.webp`} alt="Sort and filter tournaments" />
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
              Search by ZIP code or your current location and see courts and clubs
              for your sport. Get directions, call, or visit their website in a tap.
            </p>
            <ul className="feature-list">
              <li>
                <span className="icon">&#x1F5FA;&#xFE0F;</span> Courts, clubs and
                sports facilities on the map
              </li>
              <li>
                <span className="icon">&#x1F4CF;</span> See how far each court is
                from you
              </li>
              <li>
                <span className="icon">&#x1F4DE;</span> Directions, call or website
                instantly
              </li>
            </ul>
          </div>
          <div className="feature-phones fade-in-right">
            <Phone src={`${SHOT}/courts-pickleball.webp`} alt="Find pickleball courts" />
            <Phone src={`${SHOT}/courts-tennis.webp`} alt="Find tennis courts" />
          </div>
        </div>
      </section>

      {/* Profile, rating & calories */}
      <section className="feature-section dark">
        <div className="feature-inner reversed">
          <div className="feature-text fade-in-right">
            <div className="feature-label blue">Your Game</div>
            <h2>
              Track Your
              <br />
              Journey.
            </h2>
            <p>
              A separate Elo rating for every sport you play, your match history,
              and the calories you burn on court, all in your profile.
            </p>
            <ul className="feature-list">
              <li>
                <span className="icon">&#x1F3C5;</span> Per-sport Elo ratings and
                fairer, Elo-based seeding
              </li>
              <li>
                <span className="icon">&#x1F525;</span> Calories from Apple Health
                or Health Connect, or a quick estimate
              </li>
              <li>
                <span className="icon">&#x1F91D;</span> Sportsmanship ratings after
                every event
              </li>
              <li>
                <span className="icon">&#x1F3A8;</span> A unique avatar that's all
                yours
              </li>
            </ul>
          </div>
          <div className="feature-phones fade-in-left">
            <Phone src={`${SHOT}/profile.webp`} alt="Player profile" />
            <Phone src={`${SHOT}/sport-picker.webp`} alt="Sport picker with 16 sports" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header fade-in">
            <h2>Get Started in 3 Steps</h2>
            <p>
              From download to your first match, it takes less than 2 minutes.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card fade-in">
              <div className="step-number">1</div>
              <h3>Pick Your Sport</h3>
              <p>
                Sign up with Apple, Google or email, choose your sport, avatar,
                skill level and home area.
              </p>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">2</div>
              <h3>Find or Host</h3>
              <p>
                Browse tournaments and open play near you, or create your own in
                minutes.
              </p>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">3</div>
              <h3>Play &amp; Climb</h3>
              <p>
                Submit scores, watch the standings update live and grow your rating
                in every sport you play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Android */}
      <section className="android-banner">
        <div className="android-banner-inner fade-in">
          <div className="android-banner-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.341a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0ZM4.977 15.341a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0ZM14.4 3.21l.9-1.56a.375.375 0 0 0-.65-.376l-.912 1.58A6.735 6.735 0 0 0 12 2.625c-.956 0-1.863.194-2.688.535L8.25 1.274a.375.375 0 0 0-.65.376l.9 1.56A6.752 6.752 0 0 0 5.25 9v.375h13.5V9A6.752 6.752 0 0 0 14.4 3.21ZM5.25 11.625v5.625A1.5 1.5 0 0 0 6.75 18.75h10.5a1.5 1.5 0 0 0 1.5-1.5v-5.625H5.25ZM3.375 9.75A.375.375 0 0 0 3 10.125v6.75a1.5 1.5 0 0 0 1.5 1.5.375.375 0 0 0 .375-.375v-8.25zM21 10.125a.375.375 0 0 0-.375-.375H20.25v8.625a.375.375 0 0 0 .375.375 1.5 1.5 0 0 0 1.5-1.5v-6.75A.375.375 0 0 0 21 10.125Z" />
            </svg>
          </div>
          {config.androidStoreURL ? (
            <>
              <div className="android-banner-text">
                <div className="android-banner-label">Now on Android</div>
                <h2>TournMate is on Google Play.</h2>
                <p>
                  Same tournaments, same rankings, same friends. Your account works
                  on both iPhone and Android.
                </p>
              </div>
              <a href={config.androidStoreURL} className="android-banner-cta">
                Get it on Google Play
              </a>
            </>
          ) : (
            <>
              <div className="android-banner-text">
                <div className="android-banner-label">Coming to Android</div>
                <h2>TournMate for Android is almost here.</h2>
                <p>
                  It's in final review on Google Play. Register now and we'll let you
                  know the moment it lands.
                </p>
              </div>
              <a href="/login" className="android-banner-cta">
                Register &amp; Get Notified
              </a>
            </>
          )}
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
            Download TournMate free and play pickleball, badminton and tennis your
            way, with more sports on the way.
          </p>
          <StoreButtons ios={config.iosStoreURL} android={config.androidStoreURL} />
        </div>
      </section>
    </>
  );
}
