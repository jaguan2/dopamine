# O.E.C. Japanese Express · Sushi 'n Hibachi

Redesigned website for O.E.C.'s two Tampa Bay locations:

- **O.E.C. Japanese Express** — 2438 66th St N, St. Petersburg, FL 33710 · 727-345-4088
- **O.E.C. Japanese Sushi 'n Hibachi** — 13847 Walsingham Rd, Largo, FL 33774 · 727-366-6126

A fully static site (no build step, no framework) styled after traditional
Japanese design: washi-paper backgrounds, sumi-ink dark sections, vermilion
(shu-iro) accents, seigaiha wave patterns and Mincho display typography.

## Structure

```
index.html          Home — hero, story, specialties, gallery, locations & hours
menu.html           Full menu — 29 categories / 282 items, search + category nav
css/style.css       Design system
js/menu-data.js     Menu data (generated — see below)
js/site.js          Nav, reveal animations, menu rendering, search, scrollspy
assets/             Seal + seigaiha SVGs, food photography
```

## Running locally

It's static — open `index.html` in a browser, or serve the folder:

```
python -m http.server 8000
```

## Menu data

`js/menu-data.js` was parsed from the restaurant's live online menu
(oecjapanesesushinhibachi.com, July 2026). Each category carries an English
name, a Japanese label, a menu-page group, an optional note, and its items
(`name`, `desc`, `prices[{label, amount}]`, `spicy`). To update prices or
items, edit that file directly — the menu page renders entirely from it.

## Deploying

Any static host works (GitHub Pages, Netlify, Cloudflare Pages). The only
external dependency is Google Fonts (Shippori Mincho + Zen Kaku Gothic New).
