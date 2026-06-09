/* ---------------------------------------------
   Navbar behavior
--------------------------------------------- */
const navbar = document.getElementById("navbar");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const railDots = Array.from(document.querySelectorAll(".scroll-rail-dot"));
const railProgress = document.getElementById("scrollRailProgress");
const heroSection = document.getElementById("home");

const setNavbarState = () => {
  if (!navbar) return;

  const scrolled = window.scrollY > 50;
  navbar.classList.toggle("scrolled", scrolled);

  if (heroSection) {
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    navbar.classList.toggle("over-dark", heroBottom > 0 && !scrolled);
  }
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
   Reading progress bar
--------------------------------------------- */
const readingProgress = document.getElementById("readingProgress");

if (readingProgress) {
  const updateReadingProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
    readingProgress.style.width = `${ratio * 100}%`;
  };

  updateReadingProgress();
  window.addEventListener("scroll", updateReadingProgress);
  window.addEventListener("resize", updateReadingProgress);
}


/* ---------------------------------------------
   Back to top
--------------------------------------------- */
const backToTop = document.getElementById("backToTop");

if (backToTop) {
  const toggleBackToTop = () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 500);
  };

  toggleBackToTop();
  window.addEventListener("scroll", toggleBackToTop);

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  });
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
    const revealInCert = Array.from(section.querySelectorAll(".reveal"));
    const certIndex = revealInCert.indexOf(element);
    const dirs = ["reveal-left", "reveal-scale", "reveal-right", "reveal-up"];
    return dirs[certIndex % dirs.length];
  }

  return "reveal-up";
};


/* ---------------------------------------------
   Card hover pointer tracking
--------------------------------------------- */
if (canHover && !reducedMotion) {
  const interactiveCards = document.querySelectorAll(
    ".tool-band, .project-card, .cert-card, .stat-item"
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
  const filterHideDurationMs = reducedMotion ? 0 : 260;
  const filterStaggerMs = reducedMotion ? 0 : 60;
  let activeToolsFilterRequest = 0;

  const setActiveToolsFilterButton = (activeFilter) => {
    toolsFilterButtons.forEach((button) => {
      const isActive = button.dataset.toolsFilter === activeFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  };

  const applyToolsFilter = (filterKey) => {
    const filterRequestId = ++activeToolsFilterRequest;

    toolBands.forEach((band, index) => {
      const category = band.dataset.toolsCategory;
      const shouldShow = filterKey === "all" || category === filterKey;
      const staggerDelay = `${index * filterStaggerMs}ms`;

      band.style.setProperty("--tools-stagger", staggerDelay);

      if (shouldShow) {
        if (band.hidden) {
          band.hidden = false;
        }
        band.classList.remove("is-filter-out");

        if (!reducedMotion) {
          band.classList.add("is-filter-out");
          void band.offsetWidth;
          window.requestAnimationFrame(() => {
            if (filterRequestId === activeToolsFilterRequest) {
              band.classList.remove("is-filter-out");
            }
          });
        }
      } else {
        if (reducedMotion) {
          band.hidden = true;
          return;
        }

        band.classList.add("is-filter-out");

        const hideAfterTransition = (event) => {
          if (event.propertyName !== "opacity") {
            return;
          }

          if (filterRequestId !== activeToolsFilterRequest) {
            band.removeEventListener("transitionend", hideAfterTransition);
            return;
          }

          band.hidden = true;
          band.removeEventListener("transitionend", hideAfterTransition);
        };

        band.addEventListener("transitionend", hideAfterTransition);

        window.setTimeout(() => {
          if (filterRequestId === activeToolsFilterRequest && !band.hidden) {
            band.hidden = true;
          }
        }, filterHideDurationMs + (index * filterStaggerMs));
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

/* ---------------------------------------------
   Section divider reveal
--------------------------------------------- */
const sectionDivs = document.querySelectorAll("section[id]");
if (sectionDivs.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("sect-visible");
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  sectionDivs.forEach((section) => sectionObserver.observe(section));
}


/* ---------------------------------------------
   Skill bar reveal
--------------------------------------------- */
const skillBars = document.querySelectorAll(".tool-chip-bar");

if (skillBars.length && !reducedMotion) {
  const barObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  skillBars.forEach((bar) => barObserver.observe(bar));
} else if (skillBars.length) {
  skillBars.forEach((bar) => bar.classList.add("is-visible"));
}


/* ---------------------------------------------
   Hero split animation — triggers after 2.5s
--------------------------------------------- */
const heroSplit = document.getElementById("heroSplit");
const heroStage = document.querySelector(".hero-stage");
const heroRole = document.getElementById("heroRole");

const typeText = (element, text, speed = 38) => {
  if (!element) return;
  element.textContent = "";
  element.classList.add("is-typing");

  let i = 0;
  const tick = () => {
    if (i < text.length) {
      element.textContent = text.slice(0, ++i);
      window.setTimeout(tick, speed);
    } else {
      element.classList.remove("is-typing");
      element.classList.add("typed-done");
    }
  };
  tick();
};

if (heroSplit && !reducedMotion) {
  window.setTimeout(() => {
    heroSplit.classList.add("is-split");
    // Fade in bottom elements after split transition completes (1.1s)
    window.setTimeout(() => {
      if (heroStage) heroStage.classList.add("split-done");
      // Start typing after a short delay once elements are visible
      window.setTimeout(() => {
        typeText(heroRole, "// Backend Developer · CS Student");
      }, 200);
    }, 1100);
  }, 2500);
} else if (heroStage) {
  heroStage.classList.add("split-done");
  if (heroRole) heroRole.textContent = "// Backend Developer · CS Student";
}


/* ---------------------------------------------
   Certificate modal
--------------------------------------------- */
const certModal = document.getElementById("certModal");

if (certModal) {
  const modalOverlay = certModal.querySelector(".cert-modal-overlay");
  const modalClose = certModal.querySelector(".cert-modal-close");
  const modalWrap = certModal.querySelector(".cert-modal-wrap");
  const modalImage = certModal.querySelector(".cert-modal-image");
  const modalHeader = certModal.querySelector(".cert-modal-header");
  const modalTitle = certModal.querySelector(".cert-modal-title");
  const modalDesc = certModal.querySelector(".cert-modal-desc");
  const modalMeta = certModal.querySelector(".cert-modal-meta");
  const modalTags = certModal.querySelector(".cert-modal-tags");

  const openModal = (card) => {
    const img = card.querySelector(".cert-image img");
    if (img) {
      modalImage.innerHTML = `<img src="${img.src}" alt="${img.alt}" />`;
    } else {
      modalImage.innerHTML = "";
    }

    const badge = card.querySelector(".cert-badge");
    const org = card.querySelector(".cert-org");
    const date = card.querySelector(".cert-date");
    const title = card.querySelector(".cert-title");
    const desc = card.querySelector(".cert-desc");
    const credId = card.querySelector(".cert-id strong");
    const verifyLink = card.querySelector(".cert-verify");
    const tags = card.querySelectorAll(".tag");

    modalHeader.innerHTML =
      (badge ? badge.outerHTML : "") +
      `<div class="cert-issuer">${org ? org.outerHTML : ""}${date ? date.outerHTML : ""}</div>`;

    modalTitle.textContent = title ? title.textContent : "";
    modalDesc.textContent = desc ? desc.textContent : "";

    let metaHtml = "";
    if (credId) {
      const clone = credId.closest(".cert-id").cloneNode(true);
      metaHtml += clone.outerHTML;
    }
    if (verifyLink) {
      const clone = verifyLink.cloneNode(true);
      metaHtml += clone.outerHTML;
    }
    modalMeta.innerHTML = metaHtml;

    modalTags.innerHTML = "";
    tags.forEach((tag) => {
      modalTags.appendChild(tag.cloneNode(true));
    });

    certModal.classList.add("is-open");
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    certModal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
  };

  document.querySelectorAll(".cert-card--featured").forEach((card) => {
    card.addEventListener("click", () => openModal(card));
  });

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && certModal.classList.contains("is-open")) {
      closeModal();
    }
  });
}


/* ---------------------------------------------
   Nav toggle (hamburger)
--------------------------------------------- */
const navToggle = document.querySelector(".nav-toggle");
const mobileNavLinks = document.querySelector(".nav-links");

if (navToggle && mobileNavLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = mobileNavLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-active");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  mobileNavLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNavLinks.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    const isNav = event.target.closest("#navbar");
    if (!isNav && mobileNavLinks.classList.contains("is-open")) {
      mobileNavLinks.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}


/* ---------------------------------------------
   Contact form (mailto)
--------------------------------------------- */
const contactForm = document.getElementById("contactForm");
const formFeedback = document.getElementById("formFeedback");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("formName").value.trim();
    const email = document.getElementById("formEmail").value.trim();
    const message = document.getElementById("formMessage").value.trim();

    if (!name || !email || !message) {
      formFeedback.textContent = "Please fill in all fields.";
      formFeedback.className = "contact-form-feedback is-error";
      return;
    }

    const subject = encodeURIComponent(`Portfolio Message from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.open(`mailto:jbprado013@gmail.com?subject=${subject}&body=${body}`, "_blank");

    formFeedback.textContent = "Thank you! Your message has been prepared.";
    formFeedback.className = "contact-form-feedback is-success";
    contactForm.reset();
  });
}