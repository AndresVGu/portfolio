# Andrés Villarreal — Personal Portfolio

A modern, multilingual personal portfolio built with **Astro**, **Tailwind CSS**, and vanilla TypeScript. Designed to showcase my work as a Full-Stack Engineer with a focus on performance, clean UI, and interactive experiences.

**Live:** [andresvillarreal.dev](https://andresvillarreal.netlify.app) &nbsp;·&nbsp; **Location:** Toronto, ON, Canada

---

## About Me

I'm a Full-Stack Engineer currently at **Rugged Books** (Ontario, Canada), where I was promoted from Electronics Specialist to lead the end-to-end development of a custom enterprise ERP system built from scratch. The platform covers inventory management, employee management, order processing, returns handling, purchase orders, and warehouse operations.

Previously I worked as a Full-Stack Developer at **Floridabama Autosales** (Alabama, USA — remote), building a business application for an automotive dealership using ASP.NET MVC and React. Before that, I was a Junior Web Developer at **V12 Comunicaciones** (Bogotá, Colombia), delivering custom apps, eCommerce platforms, and REST APIs for startups and enterprises.

I also hold a diploma in **Computer Programming & Analysis** from Niagara College Canada (2024), and I'm fluent in **English**, **French**, and **Spanish**.

**Current stack:** Java · Spring Boot · React · TypeScript · Tailwind CSS · PostgreSQL · .NET · Linux · AWS

---

## Features

- **Multilingual** — Full EN / ES / FR support via a custom i18n system
- **Dark / Light mode** — System preference detection + manual toggle
- **Interactive Experience Timeline** — Scroll-reveal parallax with grouped company entries, role cards, and a detail modal
- **About Bento Grid** — Interactive cells including:
  - Real-time clock (Toronto EST)
  - Interactive Leaflet map centered on the CN Tower
  - GitHub contribution heatmap (live data from API)
  - Terminal with typing animation
  - Auto-scrolling photocard carousel with holographic flip effect
- **Photocard Modal** — Pokémon/Magic-style holographic card with foil, shine, sparkle effects and 3D flip
- **Contact Form** — Functional contact section
- **Responsive** — Mobile, tablet, and desktop layouts
- **Performance** — Static generation (SSG), lazy loading, no heavy frameworks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro](https://astro.build) 5.x |
| Styling | [Tailwind CSS](https://tailwindcss.com) 3.x |
| Language | TypeScript |
| Map | [Leaflet](https://leafletjs.com) + CartoDB tiles |
| Fonts | Onest Variable |
| Deployment | [Netlify](https://netlify.com) |

---

## Project Structure

```
/
├── public/
│   ├── docs/          # CV / Resume PDF
│   ├── photocards/    # Gallery photos
│   └── projects/      # Project screenshots
├── src/
│   ├── components/    # Astro components
│   │   ├── About.astro
│   │   ├── Header.astro
│   │   ├── Profile.astro
│   │   ├── TimeLine.astro
│   │   ├── TimeLineGroup.astro
│   │   ├── TimeLineItem.astro
│   │   ├── ExperienceModal.astro
│   │   ├── PhotoCardModal.astro
│   │   └── ...
│   ├── i18n/          # Translation files (en, es, fr)
│   ├── layouts/       # Page layout
│   ├── pages/         # Routes (/, /es/, /fr/)
│   └── scripts/       # Vanilla JS (timeline, about)
└── package.json
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## i18n

Content is managed through JSON files in `src/i18n/`:

```
src/i18n/
├── en.json   # English
├── es.json   # Spanish
├── fr.json   # French
└── index.ts  # getI18N helper
```

Routes are automatically generated for each locale: `/` (EN), `/es/` (ES), `/fr/` (FR).

---

## Contact

- **Email:** andresvillarrealguti@gmail.com
- **LinkedIn:** [linkedin.com/in/avillarrealg](https://www.linkedin.com/in/avillarrealg/)
- **GitHub:** [github.com/AndresVGu](https://github.com/AndresVGu)
