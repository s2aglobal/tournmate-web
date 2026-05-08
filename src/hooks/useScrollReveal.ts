import { useEffect } from "react";

/**
 * Attaches an IntersectionObserver that adds `.visible` to elements
 * with scroll-animation classes (.fade-in, .fade-in-left, .fade-in-right, .scale-in).
 * Call once per page component.
 */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    const targets = document.querySelectorAll(
      ".fade-in, .fade-in-left, .fade-in-right, .scale-in"
    );
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
