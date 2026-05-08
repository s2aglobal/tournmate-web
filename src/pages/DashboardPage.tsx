import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../hooks/useAuth";

const APP_STORE_URL = "https://apps.apple.com/app/tournmate";

function avatarUrl(seed: string, style: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

export default function DashboardPage() {
  const { player, user } = useAuth();
  const displayName = player?.name ?? user?.displayName ?? "Player";
  const avatarStyle = player?.avatarId ?? "adventurer";
  const avatarSeed = player?.name ?? user?.email ?? "player";

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">
        <div className="dashboard-welcome">
          <img
            src={avatarUrl(avatarSeed, avatarStyle)}
            alt="Your avatar"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              margin: "0 auto 20px",
              border: "3px solid var(--brand-purple)",
            }}
          />
          <h1>Welcome, {displayName}!</h1>
          <p>
            Your account is all set. You&apos;re ready to participate in
            tournaments, join open play sessions, and compete with players around
            the world.
          </p>

          {player && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 32,
                marginTop: 24,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--brand-purple)",
                  }}
                >
                  {player.elo}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--gray-500)",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                  }}
                >
                  Elo Rating
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--brand-purple)",
                  }}
                >
                  {player.streak}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--gray-500)",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                  }}
                >
                  Win Streak
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="qr-card">
          <h2>Get the Full Experience</h2>
          <p>
            Scan the QR code with your phone to download TournMate on the App
            Store. The mobile app gives you access to all features including live
            brackets, court finder, calorie tracking, and more.
          </p>
          <div className="qr-wrapper">
            <QRCodeSVG
              value={APP_STORE_URL}
              size={180}
              bgColor="#ffffff"
              fgColor="#0F172A"
              level="M"
              includeMargin={false}
            />
          </div>
          <div>
            <a href={APP_STORE_URL} className="store-badge">
              <img
                src="/assets/app-store-badge.svg"
                alt="Download on the App Store"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
