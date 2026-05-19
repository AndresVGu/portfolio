# Requirements Document

## Introduction

Este feature agrega un carrusel horizontal estilo Apple a la página de portafolio personal construida con Astro y Tailwind CSS. El carrusel se coloca **después** de la sección de proyectos existente (`Test.astro`) como una sección adicional e independiente. Muestra los proyectos del portafolio como tarjetas navegables con scroll suave, botones de navegación izquierda/derecha que se deshabilitan automáticamente según la posición del scroll, y adaptación responsiva entre móvil y escritorio. El componente es un archivo `.astro` puro (sin frameworks externos), soporta i18n (en, es, fr) y respeta el sistema de temas claro/oscuro existente.

## Glossary

- **Carousel**: El componente `AppleCarousel.astro` — contenedor principal del carrusel horizontal.
- **CarouselTrack**: El elemento HTML interno con scroll horizontal que contiene todas las tarjetas.
- **CarouselCard**: Cada tarjeta individual que representa un proyecto del portafolio dentro del carrusel.
- **NavButton**: Botón de navegación izquierda o derecha que controla el desplazamiento del CarouselTrack.
- **ScrollState**: Estado lógico que determina si el CarouselTrack puede desplazarse hacia la izquierda (`canScrollLeft`) o hacia la derecha (`canScrollRight`).
- **ScrollStep**: La cantidad de píxeles que el CarouselTrack se desplaza por cada click en un NavButton (300px).
- **i18n**: Sistema de internacionalización del proyecto que soporta los locales `en`, `es` y `fr`.
- **SectionContainer**: Componente Astro existente que envuelve secciones de la página con padding y estilos consistentes.
- **App.astro**: Componente raíz que orquesta todas las secciones de la página.

---

## Requirements

### Requirement 1: Estructura del componente Carousel

**User Story:** As a portfolio visitor, I want to see a horizontally scrollable carousel of projects after the existing projects section, so that I can browse all projects in a visually engaging way without replacing the current layout.

#### Acceptance Criteria

1. THE Carousel SHALL render as a standalone Astro component (`AppleCarousel.astro`) located at `src/components/AppleCarousel.astro`.
2. THE App.astro SHALL include the Carousel component in a new `SectionContainer` placed immediately after the existing `#projects` SectionContainer.
3. THE Carousel SHALL NOT modify, replace, or affect the existing `Test.astro` projects section in any way.
4. THE Carousel SHALL accept a `currentLocale` prop of type `string` with a default value of `'en'`.
5. THE Carousel SHALL use the `getI18N` utility to retrieve the `PROJECTS` array from the i18n system and render one CarouselCard per project entry.

---

### Requirement 2: Scroll horizontal y navegación

**User Story:** As a portfolio visitor, I want to scroll through project cards horizontally using navigation buttons or native scroll, so that I can navigate the carousel intuitively on any device.

#### Acceptance Criteria

1. THE CarouselTrack SHALL support horizontal scroll with `overflow-x: auto` and `scroll-behavior: smooth`.
2. THE CarouselTrack SHALL hide the scrollbar visually while remaining functionally scrollable (using CSS `scrollbar-width: none` and `::-webkit-scrollbar { display: none }`).
3. WHEN a user clicks the right NavButton, THE CarouselTrack SHALL scroll right by exactly 300px using `scrollBy({ left: 300, behavior: 'smooth' })`.
4. WHEN a user clicks the left NavButton, THE CarouselTrack SHALL scroll left by exactly 300px using `scrollBy({ left: -300, behavior: 'smooth' })`.
5. THE CarouselTrack SHALL support native touch/mouse drag scroll on mobile devices without requiring the NavButtons.

---

### Requirement 3: Estado de los botones de navegación (ScrollState)

**User Story:** As a portfolio visitor, I want the navigation buttons to be visually disabled when there is no more content to scroll in that direction, so that I understand the carousel boundaries at a glance.

#### Acceptance Criteria

1. THE Carousel SHALL initialize the ScrollState by evaluating `scrollLeft` and `scrollWidth` of the CarouselTrack immediately after the DOM is ready.
2. WHEN the CarouselTrack `scrollLeft` equals `0`, THE left NavButton SHALL have its `disabled` attribute set to `true` and SHALL render with reduced opacity (`opacity-40`) and `cursor-not-allowed`.
3. WHEN the CarouselTrack `scrollLeft + clientWidth` equals or exceeds `scrollWidth`, THE right NavButton SHALL have its `disabled` attribute set to `true` and SHALL render with reduced opacity (`opacity-40`) and `cursor-not-allowed`.
4. WHEN the CarouselTrack emits a `scroll` event, THE Carousel SHALL re-evaluate the ScrollState and update both NavButtons accordingly.
5. WHEN a NavButton is disabled, THE Carousel SHALL prevent the scroll action associated with that button from executing.

---

### Requirement 4: Tarjetas de proyecto (CarouselCard)

**User Story:** As a portfolio visitor, I want each project card in the carousel to display the project title, subtitle, and a background image, so that I can quickly identify each project.

#### Acceptance Criteria

1. THE CarouselCard SHALL display the project `title` and `subtitle` fields sourced from the `PROJECTS` i18n array.
2. THE CarouselCard SHALL render a background image using the same image paths already used in `Test.astro` for each corresponding project.
3. THE CarouselCard SHALL have a fixed width of `230px` on mobile viewports (max-width < 768px) and `384px` on desktop viewports (min-width ≥ 768px).
4. THE CarouselCard SHALL have a fixed height of `320px` on mobile and `480px` on desktop.
5. THE CarouselCard SHALL apply a gradient overlay (`bg-gradient-to-b from-transparent to-black/70`) so that text is legible over the background image.
6. WHEN a user hovers over a CarouselCard on desktop, THE CarouselCard SHALL apply a subtle scale transform (`scale(1.03)`) with a CSS transition of `300ms ease`.

---

### Requirement 5: Diseño responsivo

**User Story:** As a portfolio visitor on any device, I want the carousel to adapt its card sizes and layout to my screen size, so that the experience is comfortable on both mobile and desktop.

#### Acceptance Criteria

1. WHILE the viewport width is less than `768px`, THE CarouselCard SHALL render at `230px` width and `320px` height.
2. WHILE the viewport width is `768px` or greater, THE CarouselCard SHALL render at `384px` width and `480px` height.
3. THE CarouselTrack SHALL use `display: flex` with `gap: 1rem` so cards are evenly spaced regardless of viewport.
4. THE NavButtons SHALL remain visible and functional on all viewport sizes.
5. THE Carousel container SHALL have a `max-width` consistent with the rest of the page layout (matching `SectionContainer` constraints).

---

### Requirement 6: Soporte i18n

**User Story:** As a visitor browsing the portfolio in Spanish or French, I want the carousel section title and project data to appear in my selected language, so that the experience is consistent with the rest of the page.

#### Acceptance Criteria

1. THE Carousel SHALL render the section heading using the `i18n.TITLES.projects` key so it matches the locale of the current page.
2. THE Carousel SHALL pass the `currentLocale` prop to `getI18N` to retrieve the correct `PROJECTS` array for the active locale.
3. WHEN the locale is `es` or `fr`, THE Carousel SHALL display project titles, subtitles, and button labels in the corresponding language without requiring additional translation keys beyond those already defined in `en.json`, `es.json`, and `fr.json`.

---

### Requirement 7: Compatibilidad con el sistema de temas

**User Story:** As a portfolio visitor using dark mode, I want the carousel to respect the dark/light theme toggle, so that it looks consistent with the rest of the portfolio.

#### Acceptance Criteria

1. THE CarouselCard SHALL use Tailwind CSS `dark:` variants for background, border, and text colors so it adapts automatically when the `dark` class is toggled on the `<html>` element.
2. THE NavButtons SHALL use `dark:` variants for their background and icon colors.
3. THE Carousel section container SHALL use `dark:` variants for any background or border styles applied to the wrapper element.
4. IF the user toggles the theme while the Carousel is visible, THEN THE Carousel SHALL update its visual appearance without requiring a page reload.

---

### Requirement 8: Accesibilidad

**User Story:** As a user navigating with a keyboard or screen reader, I want the carousel to be accessible, so that I can browse projects without relying solely on mouse interaction.

#### Acceptance Criteria

1. THE left NavButton SHALL have an `aria-label` attribute with a descriptive value (e.g., `"Scroll left"` / `"Desplazar a la izquierda"` / `"Défiler à gauche"`) sourced from the i18n system.
2. THE right NavButton SHALL have an `aria-label` attribute with a descriptive value sourced from the i18n system.
3. THE CarouselTrack SHALL have `role="region"` and an `aria-label` attribute identifying it as the projects carousel.
4. WHEN a NavButton has `disabled` set to `true`, THE NavButton SHALL also have `aria-disabled="true"` so screen readers announce the disabled state.
5. THE CarouselCard SHALL include an `alt` attribute on any `<img>` element with a descriptive value derived from the project title.
