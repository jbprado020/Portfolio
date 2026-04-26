/* ---------------------------------------------
   Navbar behavior
--------------------------------------------- */
const navbar = document.getElementById("navbar");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const railDots = Array.from(document.querySelectorAll(".scroll-rail-dot"));
const railProgress = document.getElementById("scrollRailProgress");

const setNavbarState = () => {
  if (!navbar) {
    return;
  }

  navbar.classList.toggle("scrolled", window.scrollY > 50);
};

setNavbarState();
window.addEventListener("scroll", setNavbarState);


/* ---------------------------------------------
   Active nav link per visible section
--------------------------------------------- */
const navSections = navLinks
  .map((link) => {
    const id = link.getAttribute("href");
    return id ? document.querySelector(id) : null;
  })
  .filter(Boolean);

const setActiveNav = (sectionId) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", isActive);
  });

  railDots.forEach((dot) => {
    const isActive = dot.dataset.railTarget === sectionId;
    dot.classList.toggle("is-active", isActive);
  });
};

const setScrollRailProgress = () => {
  if (!railProgress) {
    return;
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
  railProgress.style.transform = `scaleY(${ratio.toFixed(4)})`;
};

setScrollRailProgress();
window.addEventListener("scroll", setScrollRailProgress);
window.addEventListener("resize", setScrollRailProgress);

if (navSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    }
  );

  navSections.forEach((section) => sectionObserver.observe(section));
}


/* ---------------------------------------------
   Scroll reveal
--------------------------------------------- */
const revealElements = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const toolsFilterButtons = Array.from(document.querySelectorAll(".tools-filter-btn"));
const toolBands = Array.from(document.querySelectorAll(".tool-band[data-tools-category]"));

const resolveRevealDirection = (element) => {
  const section = element.closest("section");
  const sectionId = section?.id;

  if (element.classList.contains("about-text")) {
    return "reveal-left";
  }

  if (element.classList.contains("about-stats")) {
    return "reveal-right";
  }

  if (element.classList.contains("tool-band") ||
      element.classList.contains("project-card") ||
      element.classList.contains("cert-card")) {
    return "reveal-scale";
  }

  if (sectionId === "education") {
    return "reveal-left";
  }

  if (sectionId === "contact") {
    const revealInContact = Array.from(section.querySelectorAll(".reveal"));
    const contactIndex = revealInContact.indexOf(element);
    return contactIndex % 2 === 0 ? "reveal-left" : "reveal-right";
  }

  if (sectionId === "certifications") {
    return "reveal-right";
  }

  return "reveal-up";
};


/* ---------------------------------------------
   Card hover pointer tracking
--------------------------------------------- */
if (canHover && !reducedMotion) {
  const interactiveCards = document.querySelectorAll(
    ".tool-band, .project-card, .cert-card"
  );

  interactiveCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty("--fx-x", `${x.toFixed(2)}%`);
      card.style.setProperty("--fx-y", `${y.toFixed(2)}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--fx-x", "50%");
      card.style.setProperty("--fx-y", "0%");
    });
  });
}

/* ---------------------------------------------
   Tools filtering
--------------------------------------------- */
if (toolsFilterButtons.length && toolBands.length) {
  const filterHideDurationMs = reducedMotion ? 0 : 180;
  const filterInClassDurationMs = reducedMotion ? 0 : 330;

  const setActiveToolsFilterButton = (activeFilter) => {
    toolsFilterButtons.forEach((button) => {
      const isActive = button.dataset.toolsFilter === activeFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  };

  const applyToolsFilter = (filterKey) => {
    toolBands.forEach((band) => {
      const category = band.dataset.toolsCategory;
      const shouldShow = filterKey === "all" || category === filterKey;

      if (shouldShow) {
        band.hidden = false;
        band.classList.remove("is-filter-out");

        if (!reducedMotion) {
          band.classList.remove("is-filter-in");
          // Force reflow so repeated clicks can retrigger entry animation.
          void band.offsetWidth;
          band.classList.add("is-filter-in");
          window.setTimeout(() => {
            band.classList.remove("is-filter-in");
          }, filterInClassDurationMs);
        }
      } else {
        band.classList.remove("is-filter-in");

        if (reducedMotion) {
          band.hidden = true;
          return;
        }

        band.classList.add("is-filter-out");
        window.setTimeout(() => {
          band.hidden = true;
          band.classList.remove("is-filter-out");
        }, filterHideDurationMs);
      }
    });
  };

  toolsFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filterKey = button.dataset.toolsFilter;

      if (!filterKey) {
        return;
      }

      setActiveToolsFilterButton(filterKey);
      applyToolsFilter(filterKey);
    });
  });

  setActiveToolsFilterButton("all");
  applyToolsFilter("all");
}

if (reducedMotion) {
  revealElements.forEach((element) => element.classList.add("visible"));
} else {
  const sectionStaggerMap = new Map();

  revealElements.forEach((element) => {
    const directionClass = resolveRevealDirection(element);
    element.classList.add(directionClass);

    const section = element.closest("section") || document.body;
    const currentIndex = sectionStaggerMap.get(section) || 0;
    const delay = Math.min(currentIndex * 70, 280);

    element.style.setProperty("--reveal-delay", `${delay}ms`);
    sectionStaggerMap.set(section, currentIndex + 1);
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}
