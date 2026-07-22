(() => {
  "use strict";

  const documentElement = document.documentElement;

  // ---------- Reveal init — fail-safe progressive enhancement ----------
  try {
    // CSS hides reveal elements only after this flag is added.
    documentElement.classList.add("has-js");

    const reveals = Array.from(document.querySelectorAll(".reveal"));
    const showReveal = (element) => element.classList.add("is-visible");

    if ("IntersectionObserver" in window && reveals.length) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            showReveal(entry.target);
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -7% 0px",
        }
      );

      reveals.forEach((element) => revealObserver.observe(element));
    } else {
      const revealAll = () => {
        window.requestAnimationFrame(() => reveals.forEach(showReveal));
      };

      if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
      ) {
        revealAll();
      } else {
        window.addEventListener("DOMContentLoaded", revealAll, { once: true });
        window.addEventListener("load", revealAll, { once: true });
      }
    }
  } catch (error) {
    // Remove the animation flag and force content visible if initialization fails.
    documentElement.classList.remove("has-js");
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("is-visible");
    });
    console.error("Reveal initialization failed:", error);
  }

  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const languageToggle = document.querySelector(".language-toggle");
  const typingText = document.querySelector(".typing-text");
  const roleLine = document.querySelector(".role-line");
  const form = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  const feedbackForm = document.querySelector("#feedback-form");
  const feedbackFormStatus = document.querySelector("#feedback-form-status");
  const serviceSelect = document.querySelector("#service");
  const currentYear = document.querySelector("#current-year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let currentLanguage = "en";
  let typingTimer;
  let roleIndex = 0;
  let characterIndex = 0;
  let deleting = false;

  // ---------- Header ----------
  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // ---------- Mobile navigation ----------
  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.hidden = true;
    body.classList.remove("menu-open");

    const label =
      currentLanguage === "en"
        ? menuToggle.dataset.ariaEn
        : menuToggle.dataset.ariaTr;
    menuToggle.setAttribute("aria-label", label);
  };

  const openMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "true");
    mobileMenu.hidden = false;
    body.classList.add("menu-open");
    menuToggle.setAttribute(
      "aria-label",
      currentLanguage === "en" ? "Close menu" : "Menüyü kapat"
    );
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  // ---------- Language system ----------
  const updateLanguage = (language) => {
    currentLanguage = language;
    documentElement.lang = language;

    document.querySelectorAll("[data-en][data-tr]").forEach((element) => {
      const translation = element.dataset[language];
      if (translation !== undefined) {
        element.textContent = translation;
      }
    });

    document
      .querySelectorAll("[data-placeholder-en][data-placeholder-tr]")
      .forEach((element) => {
        element.placeholder =
          language === "en"
            ? element.dataset.placeholderEn
            : element.dataset.placeholderTr;
      });

    document
      .querySelectorAll("[data-aria-en][data-aria-tr]")
      .forEach((element) => {
        element.setAttribute(
          "aria-label",
          language === "en" ? element.dataset.ariaEn : element.dataset.ariaTr
        );
      });

    const currentLabel = languageToggle?.querySelector(".language-current");
    const nextLabel = languageToggle?.querySelector(".language-next");

    if (currentLabel && nextLabel) {
      currentLabel.textContent = language.toUpperCase();
      nextLabel.textContent = language === "en" ? "TR" : "EN";
    }

    restartTyping();
    closeMenu();

    try {
      localStorage.setItem("selen-portfolio-language", language);
    } catch {
      // The page still works when storage is unavailable.
    }
  };

  languageToggle?.addEventListener("click", () => {
    updateLanguage(currentLanguage === "en" ? "tr" : "en");
  });

  // ---------- Typing effect ----------
  const getRoles = () => {
    if (!roleLine) return [];
    const raw =
      currentLanguage === "en"
        ? roleLine.dataset.rolesEn
        : roleLine.dataset.rolesTr;

    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const typeRole = () => {
    const roles = getRoles();
    if (!typingText || roles.length === 0) return;

    const role = roles[roleIndex % roles.length];

    if (reduceMotion) {
      typingText.textContent = role;
      return;
    }

    if (!deleting) {
      characterIndex += 1;
      typingText.textContent = role.slice(0, characterIndex);

      if (characterIndex >= role.length) {
        deleting = true;
        typingTimer = window.setTimeout(typeRole, 1450);
        return;
      }

      typingTimer = window.setTimeout(typeRole, 55);
      return;
    }

    characterIndex -= 1;
    typingText.textContent = role.slice(0, characterIndex);

    if (characterIndex <= 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingTimer = window.setTimeout(typeRole, 280);
      return;
    }

    typingTimer = window.setTimeout(typeRole, 30);
  };

  const restartTyping = () => {
    window.clearTimeout(typingTimer);
    roleIndex = 0;
    characterIndex = 0;
    deleting = false;

    const roles = getRoles();
    if (typingText && roles.length) {
      typingText.textContent = reduceMotion ? roles[0] : "";
      typeRole();
    }
  };

  restartTyping();

  // Restore the saved language only after the typing system is initialized.
  try {
    const savedLanguage = localStorage.getItem("selen-portfolio-language");
    if (savedLanguage === "tr") {
      updateLanguage("tr");
    }
  } catch {
    // Ignore storage restrictions.
  }


  // ---------- Active navigation ----------
  const sections = document.querySelectorAll("main section[id]");
  const navigationLinks = document.querySelectorAll(".desktop-nav a");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navigationLinks.forEach((link) => {
            const targetId = link.getAttribute("href")?.replace("#", "");
            link.classList.toggle("active", targetId === entry.target.id);
          });
        });
      },
      {
        rootMargin: "-35% 0px -58% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // ---------- Cursor glow ----------
  const cursorGlow = document.querySelector(".cursor-glow");

  if (cursorGlow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener(
      "pointermove",
      (event) => {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
        cursorGlow.style.opacity = "1";
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      cursorGlow.style.opacity = "0";
    });
  }

  // ---------- Tutoring CTA prefill ----------
  document.querySelectorAll("[data-service-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetValue = button.dataset.serviceTarget;

      window.setTimeout(() => {
        if (serviceSelect) {
          serviceSelect.value = targetValue;
          serviceSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, 420);
    });
  });

  // ---------- Form guard ----------
  const guardFormEndpoint = (targetForm, targetStatus) => {
    targetForm?.addEventListener("submit", (event) => {
      const action = targetForm.getAttribute("action") || "";

      if (action.includes("YOUR_FORM_ID")) {
        event.preventDefault();
        if (targetStatus) {
          targetStatus.textContent =
            currentLanguage === "en"
              ? "Setup required: replace YOUR_FORM_ID in index.html with your Formspree endpoint."
              : "Kurulum gerekli: index.html içindeki YOUR_FORM_ID alanını Formspree endpoint'inizle değiştirin.";
        }
      }
    });
  };

  guardFormEndpoint(form, formStatus);
  guardFormEndpoint(feedbackForm, feedbackFormStatus);

  // ---------- Placeholder-link guard ----------
  document.querySelectorAll("[data-placeholder-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.getAttribute("href") === "#") {
        event.preventDefault();
        console.info(
          `Add your ${link.dataset.placeholderLink} URL in index.html before publishing.`
        );
      }
    });
  });

  // ---------- Footer year ----------
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // All initializers completed. Normal reveal behavior can remain active.
  window.clearTimeout(revealFailSafe);
})();
