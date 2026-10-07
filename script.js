(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    /* ---------- Mobile navigation ---------- */
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("primary-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });

      nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Open menu");
        });
      });
    }

    /* ---------- Sticky header shadow ---------- */
    var header = document.getElementById("site-header");
    function onScroll() {
      if (!header) return;
      if (window.scrollY > 12) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- Forms: _page + LeadrVision submission ---------- */
    var forms = document.querySelectorAll('form[action*="vision.leadrai.com"]');

    forms.forEach(function (form) {
      var pageField = form.querySelector('input[name="_page"]');
      if (pageField) pageField.value = window.location.href;

      form.addEventListener("submit", function (event) {
        // Graceful fallback: allow a plain POST if fetch is unavailable.
        if (typeof window.fetch !== "function") return;

        event.preventDefault();

        var data = new FormData(form);
        data.set("_page", window.location.href);

        var body = {};
        data.forEach(function (value, key) {
          if (value instanceof File) return;
          body[key] = value;
        });

        var submitBtn = form.querySelector('button[type="submit"]');
        var originalLabel = submitBtn ? submitBtn.textContent : "";
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending\u2026";
        }

        fetch(form.action, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body)
        })
          .then(function (res) {
            return res.json().catch(function () {
              return { ok: res.ok };
            });
          })
          .then(function (result) {
            if (result && (result.ok === true || result.ok === "true")) {
              showSuccess(form);
            } else {
              // Fall back to a normal browser submission so the lead is not lost.
              form.submit();
            }
          })
          .catch(function () {
            form.submit();
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalLabel;
            }
          });
      });
    });

    function showSuccess(form) {
      var success = document.getElementById("form-success");
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
      if (history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set("submitted", "1");
        history.replaceState({}, "", url.toString());
      }
    }

    /* ---------- Show confirmation after a plain HTML submission ---------- */
    var params = new URLSearchParams(window.location.search);
    if (params.get("submitted") === "1") {
      var success = document.getElementById("form-success");
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });
})();
