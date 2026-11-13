export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-meta">
        Effective Date: April 1, 2026 &nbsp;|&nbsp; Last Updated: November 13, 2026
      </p>

      <div className="legal-content">
        <h2>1. Introduction</h2>
        <p>
          TournMate (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a
          sports tournament and open play app for iOS, Android and the web,
          operated by s2aglobal LLC. This Privacy Policy explains what
          information we collect, how we use it, who we share it with, how long
          we keep it, and the choices you have when you use the TournMate apps
          and website (together, the &quot;App&quot;).
        </p>

        <h2>2. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li>
            <strong>Personal Information:</strong> Name, email address, phone
            number, date of birth.
          </li>
          <li>
            <strong>Usage Data:</strong> App interactions, device information, IP
            address.
          </li>
          <li>
            <strong>Optional Data:</strong> Profile details (skill level, playing
            hand, avatar), tournament participation history, and calorie tracking
            data.
          </li>
          <li>
            <strong>Health Data (Apple Health on iOS):</strong> With your
            explicit permission, we read workout and active energy data from
            Apple HealthKit. We do not write to HealthKit.
          </li>
          <li>
            <strong>Health Data (Health Connect on Android):</strong> With your
            explicit permission, we read exercise sessions and active calories
            burned from Health Connect, only to estimate the calories for a
            session you choose to log. We do not write to Health Connect. You can
            revoke access at any time in the Health Connect app.
          </li>
          <li>
            <strong>Location Data:</strong> When you use the Court Finder or sort
            events by &ldquo;Nearest to me&rdquo;, we may access your device
            location to find nearby venues and order results by distance. To find
            nearby courts, your location is sent to Google Maps Platform for that
            search. We do not continuously track your location or store it on our
            servers.
          </li>
          <li>
            <strong>Sign-in provider data:</strong> If you sign in with Google,
            we receive your name, email address and profile picture from your
            Google account. If you sign in with Apple, we receive your name and
            email address (or Apple&apos;s private relay address if you choose
            to hide your email).
          </li>
          <li>
            <strong>Profile photos:</strong> If you upload a profile photo, we
            store it and check it automatically for inappropriate content before
            it is shown to other users.
          </li>
          <li>
            <strong>Tournament and match data:</strong> Tournaments and sessions
            you create or join, teams, schedules, live scores, results and
            standings.
          </li>
          <li>
            <strong>Feedback:</strong> Messages you send us from the App,
            together with your app version and device model.
          </li>
          <li>
            <strong>Crash reports and notification tokens:</strong> Diagnostic
            data when the App crashes, and a device token so we can send the
            notifications you have allowed.
          </li>
          <li>
            <strong>Camera and microphone:</strong> Used only when you take a
            profile photo or, as a tournament organizer, live stream a match.
          </li>
          <li>
            <strong>YouTube account (organizers only, optional):</strong> See
            Section 4, Google User Data.
          </li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Create and manage your account.</li>
          <li>
            Facilitate tournament participation and open play sessions.
          </li>
          <li>Provide calorie tracking and fitness estimates.</li>
          <li>Display nearby courts and venues.</li>
          <li>
            Show your name, profile photo and results to other players in
            tournaments and sessions you take part in.
          </li>
          <li>Let organizers live stream matches (see Section 4).</li>
          <li>
            Keep the App safe, including moderating profile photos and
            preventing abuse.
          </li>
          <li>Improve app performance and user experience.</li>
          <li>
            Communicate updates, notifications, and important announcements.
          </li>
        </ul>

        <h2>4. Google User Data</h2>
        <p>
          This section explains how TournMate accesses, uses, stores, shares and
          deletes data obtained from Google accounts.
        </p>
        <h3>Data we access</h3>
        <ul>
          <li>
            <strong>Google Sign-In</strong> (scopes: <code>openid</code>,{" "}
            <code>email</code>, <code>profile</code>): your name, email address
            and profile picture.
          </li>
          <li>
            <strong>YouTube</strong> (scope:{" "}
            <code>https://www.googleapis.com/auth/youtube</code>): requested only
            if you are a tournament organizer and choose{" "}
            <strong>Connect YouTube</strong> to live stream a match. We use this
            access only to create a live broadcast on your own YouTube channel,
            set it to unlisted, start and end it, and read its status (for
            example whether it is live and how many people are watching). We do
            not read, change or delete your other videos, playlists,
            subscriptions, comments or channel settings.
          </li>
        </ul>
        <h3>How we use it</h3>
        <ul>
          <li>
            Google Sign-In data is used to create your TournMate account,
            identify you when you sign in, and show your name and photo to other
            players in tournaments you join.
          </li>
          <li>
            YouTube access is used only to run live streams you start. Each
            stream is published to your YouTube channel as an unlisted video so
            that people following the tournament can watch it inside TournMate.
            You can end a stream at any time.
          </li>
        </ul>
        <h3>How we store it</h3>
        <ul>
          <li>
            Your name, email address and profile picture are stored in your
            TournMate account on Google Firebase.
          </li>
          <li>
            YouTube access tokens are stored securely on your device. We never
            see your Google password, and we do not store YouTube tokens on our
            servers.
          </li>
          <li>
            For each live stream we store the YouTube video ID, start and end
            time and viewer counts, so the stream and its replay can be shown in
            the tournament.
          </li>
        </ul>
        <h3>How we share it</h3>
        <ul>
          <li>
            We do not sell Google user data, use it for advertising, or transfer
            it to anyone except as needed to provide the App (our hosting
            provider, Google Firebase), to comply with the law, or with your
            consent.
          </li>
          <li>
            Live streams can be watched by anyone who views the tournament in
            TournMate or has the stream link. Your YouTube channel name may be
            visible on YouTube.
          </li>
        </ul>
        <h3>Removing access and deleting data</h3>
        <ul>
          <li>
            You can disconnect YouTube in the App at any time, or revoke
            TournMate&apos;s access from your Google account at{" "}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
              myaccount.google.com/permissions
            </a>
            .
          </li>
          <li>
            Broadcasts created on your channel belong to you and can be deleted
            in YouTube Studio.
          </li>
          <li>
            Deleting your TournMate account removes the Google data we store, as
            described in Section 7.
          </li>
        </ul>
        <p>
          <strong>Limited Use:</strong> TournMate&apos;s use and transfer of
          information received from Google APIs adheres to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
        <p>
          <strong>YouTube API Services:</strong> Live streaming uses YouTube API
          Services. By connecting YouTube you agree to the{" "}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
            YouTube Terms of Service
          </a>
          . Google&apos;s handling of your data is described in the{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google Privacy Policy
          </a>
          .
        </p>

        <h2>5. Payments Disclaimer</h2>
        <p>
          TournMate does not process payments. Any payments — including
          tournament entry fees and open play session costs — are handled
          directly between users and event organizers. We do not collect, store,
          or have access to any payment card or financial account information.
        </p>

        <h2>6. Data Sharing</h2>
        <p>We do not sell your personal data. We may share data with:</p>
        <ul>
          <li>
            <strong>Other players:</strong> Your name, profile photo, teams,
            scores and results are visible to people in tournaments and sessions
            you join. Live streams are visible as described in Section 4.
          </li>
          <li>
            <strong>Service Providers:</strong> Companies that operate the App
            for us under their own privacy and security terms: Google Firebase
            (authentication, database, file storage, cloud functions,
            notifications, analytics and crash reporting), Google Cloud Vision
            (automatic profile photo moderation), Google Maps Platform (nearby
            courts) and YouTube API Services (live streaming).
          </li>
          <li>
            <strong>Legal Requirements:</strong> If required by law, regulation,
            or legal process.
          </li>
          <li>
            <strong>Safety:</strong> To protect the rights, property, or safety
            of TournMate, our users, or the public.
          </li>
        </ul>
        <p>
          We will never sell your health data (Apple HealthKit or Health Connect),
          share it with third parties, or use it for advertising purposes. Our use
          of information received from Health Connect adheres to the Health
          Connect Permissions policy, including its Limited Use requirements.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain your data only as long as necessary to provide our services
          or comply with legal obligations. If you delete your account, we will
          remove your personal data within a reasonable timeframe.
        </p>

        <h3 id="delete-account">Deleting your account</h3>
        <p>
          You can delete your account at any time in the app: open{" "}
          <strong>Profile</strong>, scroll down and tap{" "}
          <strong>Delete Account</strong>. This permanently deletes your login and
          your player profile.
        </p>
        <p>
          You can also request deletion without the app by emailing{" "}
          <a href="mailto:contact@s2agloballlc.com?subject=TournMate%20account%20deletion">
            contact@s2agloballlc.com
          </a>{" "}
          from the address you signed up with. We delete your account, profile,
          calorie records and ratings you gave within 30 days. Tournament and
          match results you took part in may be kept in anonymized form so other
          players&apos; brackets and standings stay correct.
        </p>

        <h2>8. Your Rights</h2>
        <p>Depending on your location, you may have rights to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data.</li>
          <li>Object to or restrict certain processing of your data.</li>
          <li>
            Data portability (receive your data in a structured format).
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:contact@s2agloballlc.com">contact@s2agloballlc.com</a>
          .
        </p>

        <h2>9. Data Security</h2>
        <p>
          We implement reasonable technical and organizational security measures
          to protect your information, including encryption in transit and at
          rest. However, no method of transmission over the Internet or
          electronic storage is 100% secure.
        </p>

        <h2>10. Children&apos;s Privacy &amp; Age Requirement</h2>
        <p>
          TournMate requires users to be at least <strong>13 years of age</strong>{" "}
          to create an account. We verify this by requiring a date of birth
          during account setup. We do not knowingly collect personal data from
          children under 13.
        </p>
        <p>
          If you believe a child under 13 has provided us with personal data,
          please contact us at{" "}
          <a href="mailto:contact@s2agloballlc.com">contact@s2agloballlc.com</a>{" "}
          and we will take steps to delete it promptly.
        </p>
        <p>
          <strong>Why we collect date of birth:</strong> In addition to age
          verification, your date of birth is used to determine eligibility for
          age-restricted tournament categories (e.g., Under 17, Senior 35+).
          Your exact date of birth is stored securely and is never displayed
          publicly.
        </p>

        <h2>11. International Users</h2>
        <p>
          By using the App, you consent to the transfer and processing of your
          data in the United States and other countries where our service
          providers operate.
        </p>

        <h2>12. Third-Party Services</h2>
        <p>
          The App integrates with third-party services including Firebase
          (Google: Authentication, Firestore, Cloud Messaging, Analytics and
          Crashlytics, Cloud Storage, Cloud Functions), Google Cloud Vision,
          Google Maps Platform, YouTube API Services, Apple HealthKit, Google
          Health Connect, Apple Sign-In, Google Sign-In, and DiceBear. These
          services have their own privacy policies, including the{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google Privacy Policy
          </a>{" "}
          and the{" "}
          <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">
            Apple Privacy Policy
          </a>
          , and we encourage you to review them.
        </p>

        <h2>13. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last
          Updated&quot; date at the top of this page indicates when the policy
          was last revised.
        </p>

        <h2>14. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy, please
          contact us at:
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:contact@s2agloballlc.com">contact@s2agloballlc.com</a>
        </p>
      </div>
    </main>
  );
}
