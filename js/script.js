document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================
     1. NAVEGAÇÃO ATIVA
  ========================================================== */
  function initActiveNav() {
    const listItems = document.querySelectorAll(".list li");
    const header = document.querySelector("header");

    const sections = [...listItems]
      .map((item) => {
        const link = item.querySelector('a[href^="#"]');
        const id = link?.getAttribute("href").slice(1);
        const section = id ? document.getElementById(id) : null;

        return section ? { item, section } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    function updateActive() {
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      let current = sections[0];

      sections.forEach((entry) => {
        if (entry.section.getBoundingClientRect().top <= headerHeight + 40) {
          current = entry;
        }
      });

      // Garante a seleção da última seção no final da página.
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;

      if (atBottom && window.scrollY > 0) {
        current = sections[sections.length - 1];
      }

      listItems.forEach((item) => {
        item.classList.toggle("active", item === current.item);
      });
    }

    let scheduled = false;

    window.addEventListener(
      "scroll",
      () => {
        if (scheduled) return;

        scheduled = true;

        requestAnimationFrame(() => {
          updateActive();
          scheduled = false;
        });
      },
      { passive: true },
    );

    window.addEventListener("resize", updateActive);
    window.addEventListener("load", updateActive);
    window.addEventListener("pageshow", updateActive);

    updateActive();
  }

  /* ==========================================================
     2. TEMA CLARO / ESCURO
     Sol no tema escuro; lua no tema claro.
  ========================================================== */
  function initThemeToggle() {
    const STORAGE_KEY = "theme";
    const html = document.documentElement;
    const toggleBtn = document.querySelector(".theme-toggle");
    const toggleIcon = toggleBtn?.querySelector("i");

    function applyTheme(theme) {
      const isLight = theme === "light";

      html.setAttribute("data-theme", theme);

      if (toggleIcon) {
        toggleIcon.className = isLight
          ? "fa-regular fa-moon"
          : "fa-regular fa-sun";
      }

      if (toggleBtn) {
        const label = isLight ? "Ativar tema escuro" : "Ativar tema claro";

        toggleBtn.setAttribute("aria-label", label);
        toggleBtn.setAttribute("title", label);
      }
    }

    function getInitialTheme() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved === "dark" || saved === "light") {
          return saved;
        }
      } catch {
        // Usa a preferência do sistema se o armazenamento estiver bloqueado.
      }

      return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }

    applyTheme(getInitialTheme());

    toggleBtn?.addEventListener("click", () => {
      const current = html.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";

      applyTheme(next);

      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // A troca de tema funciona mesmo sem salvar a preferência.
      }
    });
  }

  /* ==========================================================
     3. MENU MOBILE
  ========================================================== */
  function initMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".navbar");

    if (!menuToggle || !nav) return;

    const menuIcon = menuToggle.querySelector("i");
    const navLinks = nav.querySelectorAll("a");
    let previousOverflow = "";

    function setMenuOpen(isOpen) {
      const wasOpen = nav.classList.contains("open");

      nav.classList.toggle("open", isOpen);
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Fechar menu" : "Abrir menu",
      );

      if (menuIcon) {
        menuIcon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
      }

      if (isOpen && !wasOpen) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      } else if (!isOpen && wasOpen) {
        document.body.style.overflow = previousOverflow;
      }
    }

    menuToggle.addEventListener("click", () => {
      setMenuOpen(!nav.classList.contains("open"));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
  }

  initActiveNav();
  initThemeToggle();
  initMobileMenu();
});

(() => {
  function initHeaderEffect() {
    const header = document.querySelector("header");

    if (!header) return;

    function updateHeader() {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    }

    // Aplica o fundo imediatamente ao clicar em um link interno.
    header.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => {
        header.classList.add("is-scrolled");
      });
    });

    // Mantém o fundo durante a rolagem e remove ao voltar ao topo.
    window.addEventListener("scroll", updateHeader, {
      passive: true,
    });

    window.addEventListener("pageshow", updateHeader);

    updateHeader();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeaderEffect, {
      once: true,
    });
  } else {
    initHeaderEffect();
  }
})();
