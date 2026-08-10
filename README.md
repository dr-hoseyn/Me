# Hossein Hatami — Portfolio

A product-focused personal portfolio for [Hossein Hatami](https://github.com/dr-hoseyn), covering live web products, Telegram commerce systems, and open-source network infrastructure tools.

**Live site:** [dr-hoseyn.github.io/Me](https://dr-hoseyn.github.io/Me/)

## Featured work

- [PANA Gelato](https://panagelato.ir/en) — bilingual, mobile-first brand website for an artisan gelato shop.
- [ToolGrym](https://toolgrym.com/) — privacy-first financial calculators with visible formulas and worked examples.
- [@TeliroShopBOT](https://t.me/TeliroShopBOT) — Telegram storefront for digital services.
- [@hajhoseyn_bot](https://t.me/hajhoseyn_bot) — V2Ray reseller partner purchase bot.
- Gemion reseller platform — multi-tenant Telegram commerce management, guided onboarding, live pricing, and reseller controls.

The site also presents selected repositories including Tunnel Panel, WaterWall Manager (`wwctl`), Tunnel Manager, VM Network Tuner, Bifrost Installer, and Online Exam Serverless.

## Design direction

The visual system pairs a precise, editorial layout with network-topology details rather than generic portfolio chrome. Its signature element is the interactive signal map in the hero, connecting Hossein's core areas: product web, Telegram systems, and network tooling.

- Display type: Syne
- Body type: Manrope
- Utility/data type: IBM Plex Mono
- Deep graphite surfaces with one restrained mineral-blue accent
- Asymmetric project and open-source grids with compact technical metadata
- Responsive from small mobile screens to wide desktops
- Reduced-motion support and visible keyboard focus states
- Semantic sections, skip navigation, and accessible controls

## Stack

- Semantic HTML5
- Modern CSS (Grid, custom properties, responsive layouts)
- Lightweight vanilla JavaScript
- Google Fonts
- GitHub Pages

There is no build step and no framework dependency. The site is intentionally simple to maintain and fast to serve.

## Run locally

Clone the repository and serve the folder with any static server:

```bash
git clone https://github.com/dr-hoseyn/Me.git
cd Me
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Project structure

```text
.
├── index.html      # Content, SEO metadata, and structured data
├── style.css       # Visual system and responsive layouts
├── script.js       # Navigation, reveal motion, and signal-map interaction
├── robots.txt      # Search crawler rules
├── sitemap.xml     # GitHub Pages sitemap
└── README.md
```

## Deployment

GitHub Pages serves the repository from the `main` branch. Pushing a change to `main` updates the live portfolio after GitHub Pages finishes publishing.

## Contact

- GitHub: [@dr-hoseyn](https://github.com/dr-hoseyn)
- Telegram: [@haj_hoseyn](https://t.me/haj_hoseyn)

© Hossein Hatami.
