/** App Store badge + Google Play button; Play shows "Coming soon" when no URL. */
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

export default function StoreButtons({ ios, android }: { ios: string; android: string | null }) {
  return (
    <div className="store-buttons">
      <a href={ios} className="store-badge">
        <img src="/assets/app-store-badge.svg" alt="Download on the App Store" />
      </a>
      <GooglePlayButton url={android} />
    </div>
  );
}
