/* O.E.C. — shared site behavior + menu rendering */
(function () {
  "use strict";

  /* ---------------- shared: mobile nav ---------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  /* ---------------- shared: footer year ---------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------- shared: reveal on scroll ---------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------------- shared: back to top ---------------- */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- menu page ---------------- */
  var root = document.getElementById("menu-root");
  if (!root || typeof MENU === "undefined") return;

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function priceHTML(prices) {
    if (!prices.length) return "";
    return prices.map(function (p) {
      var label = p.label ? '<span class="plabel">(' + esc(p.label) + ")</span> " : "";
      return label + "$" + p.amount;
    }).join(" · ");
  }

  /* group categories preserving order */
  var groups = [];
  var byGroup = {};
  MENU.forEach(function (cat) {
    if (!byGroup[cat.group]) {
      byGroup[cat.group] = [];
      groups.push(cat.group);
    }
    byGroup[cat.group].push(cat);
  });

  var GROUP_JP = {
    "Starters & Soups": "前菜・汁物",
    "Sushi Bar": "寿司",
    "Hibachi & Kitchen": "鉄板・台所",
    "Bento & Lunch": "弁当・ランチ",
    "Drinks, Desserts & Sides": "飲物・甘味"
  };

  /* render */
  var html = "";
  groups.forEach(function (g) {
    html += '<h2 class="menu-group-title" id="group-' + slug(g) + '">' +
      esc(g) + '<span class="jp" lang="ja">' + (GROUP_JP[g] || "") + "</span></h2>";
    byGroup[g].forEach(function (cat) {
      html += '<section class="menu-category" id="cat-' + slug(cat.category) + '" data-group="' + slug(g) + '">';
      html += '<div class="menu-category-head"><h3>' + esc(cat.category) + "</h3>" +
        '<span class="jp" lang="ja">' + esc(cat.jp || "") + "</span></div>";
      if (cat.note) html += '<p class="menu-category-note">' + esc(cat.note) + "</p>";
      html += '<div class="menu-items">';
      cat.items.forEach(function (it) {
        html += '<div class="menu-item" data-text="' +
          esc((it.name + " " + it.desc + " " + cat.category).toLowerCase()) + '">';
        html += '<div class="menu-item-row"><span class="menu-item-name">' + esc(it.name);
        if (it.spicy) html += '<span class="spicy" title="Spicy" aria-label="Spicy">&#127798;</span>';
        html += '</span><span class="leader" aria-hidden="true"></span>' +
          '<span class="menu-item-price">' + priceHTML(it.prices) + "</span></div>";
        if (it.desc) html += '<p class="menu-item-desc">' + esc(it.desc) + "</p>";
        html += "</div>";
      });
      html += "</div></section>";
    });
  });
  root.innerHTML = html;

  /* group chips */
  var chips = document.getElementById("group-chips");
  if (chips) {
    chips.innerHTML = groups.map(function (g) {
      return '<a href="#group-' + slug(g) + '">' + esc(g) + "</a>";
    }).join("");
  }

  /* category rail */
  var rail = document.getElementById("menu-rail");
  if (rail) {
    var railHTML = "";
    groups.forEach(function (g) {
      railHTML += "<h3>" + esc(g) + "</h3>";
      byGroup[g].forEach(function (cat) {
        railHTML += '<a href="#cat-' + slug(cat.category) + '" data-cat="cat-' + slug(cat.category) + '">' +
          esc(cat.category) + "</a>";
      });
    });
    rail.innerHTML = railHTML;
  }

  /* scrollspy for rail + chips */
  var railLinks = rail ? rail.querySelectorAll("a") : [];
  var sections = root.querySelectorAll(".menu-category");
  if (sections.length && "IntersectionObserver" in window) {
    var current = null;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) current = en.target.id;
      });
      if (current) {
        railLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("data-cat") === current);
        });
      }
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* search filter */
  var input = document.getElementById("menu-search-input");
  var empty = document.getElementById("menu-empty");
  if (input) {
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var any = false;
      sections.forEach(function (sec) {
        var vis = 0;
        sec.querySelectorAll(".menu-item").forEach(function (item) {
          var show = !q || item.getAttribute("data-text").indexOf(q) !== -1;
          item.style.display = show ? "" : "none";
          if (show) vis++;
        });
        sec.style.display = vis ? "" : "none";
        if (vis) any = true;
      });
      /* hide group titles with no visible categories */
      root.querySelectorAll(".menu-group-title").forEach(function (title) {
        var gslug = title.id.replace(/^group-/, "");
        var visible = false;
        root.querySelectorAll('.menu-category[data-group="' + gslug + '"]').forEach(function (sec) {
          if (sec.style.display !== "none") visible = true;
        });
        title.style.display = visible ? "" : "none";
      });
      if (empty) empty.style.display = any ? "none" : "block";
    });
  }
})();
