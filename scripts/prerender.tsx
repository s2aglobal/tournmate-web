// SSR entry used only at build time by scripts/static-routes.mjs. It renders
// the legal pages to static HTML so crawlers (Google OAuth verification,
// Google Play's privacy-policy check) see the full text without running JS.
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import PrivacyPage from "../src/pages/PrivacyPage";
import TermsPage from "../src/pages/TermsPage";

const pages = {
  privacy: {
    title: "Privacy Policy — TournMate",
    description:
      "How TournMate collects, uses, stores, shares and deletes your information, including Google user data.",
    Page: PrivacyPage,
  },
  terms: {
    title: "Terms & Conditions — TournMate",
    description: "The terms and conditions for using TournMate.",
    Page: TermsPage,
  },
} as const;

export type Route = keyof typeof pages;
export const routes = Object.keys(pages) as Route[];

export function render(route: Route) {
  const { title, description, Page } = pages[route];
  const html = renderToStaticMarkup(
    <StaticRouter location={`/${route}`}>
      <Page />
    </StaticRouter>
  );
  return { title, description, html };
}
