# Bugfix Requirements Document

## Introduction

This document covers all bugs, inconsistencies, and logic errors found across the personal portfolio project built with Astro. The project supports three locales (en, es, fr) and includes components such as Profile, About, TimeLine, Projects (Test.astro), Certificates, ContactForm, Header, Footer, and various modals.

The analysis identified **8 distinct bugs** spanning: i18n shallow-merge data loss, incorrect years-of-experience calculation, hardcoded non-translated strings, a missing `lang` attribute on locale pages, a broken `<html lang>` on the ES/FR pages, a `utils.ts` file that is empty/missing, the `Projects.astro` component being unused dead code, and the `Modal.astro` component containing placeholder/demo content that is rendered in the DOM.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the locale is `es` or `fr` THEN the system uses a shallow object spread (`{ ...english, ...spanish }`) to merge translations, so top-level array keys like `EXPERIENCE`, `EDUCATION`, `PROJECTS`, and `ABOUT.cards.focusedItems` are fully replaced by the locale file — but if a locale file is missing any array entry or nested key, the English fallback is silently lost and the missing key throws a runtime error or renders `undefined`.

1.2 WHEN the current year is 2024 (graduation year) THEN the system calculates `years = 2024 - 2024 = 0`, so the profile description renders "+0 years" and the About section renders "more than 0 years of experience", which is factually incorrect and looks broken.

1.3 WHEN the user visits the site in English THEN the `About.astro` bento grid renders hardcoded English strings ("Building an ERP", "Coffee: 2", "Cycling", "Reading", "LOTR fan", "Based here") that are never translated, so French and Spanish visitors always see English text in those cells.

1.4 WHEN the user visits `/es/` or `/fr/` THEN the `<html>` element rendered by `Layout.astro` receives `lang={currentLocale}` correctly, but `src/pages/es/index.astro` and `src/pages/fr/index.astro` pass no `currentLocale` prop to `<App />`, so `App.astro` always defaults to `'en'` and all i18n content is rendered in English regardless of the URL.

1.5 WHEN `src/i18n/utils.ts` is imported or referenced THEN the system finds an empty file with no exports, causing any future consumer of that module to receive `undefined` for all imports without a compile-time error.

1.6 WHEN `src/components/Projects.astro` is present in the codebase THEN it is never imported or used anywhere (the active projects section uses `Test.astro`), creating dead code that contains its own hardcoded English-only project data that diverges from the i18n JSON files.

1.7 WHEN `src/components/Modal.astro` is present in the codebase THEN it contains a fully rendered Flowbite demo modal with placeholder "Terms of Service" content and a visible "TRigger" button, which is never imported but could accidentally be included and would render demo content to users.

1.8 WHEN the contact form validation runs and the `name` field is empty THEN the error message is constructed as `(label.textContent?.replace("*","").trim()) + " is required"`, but `labels?.[0]?.textContent` includes the `<span>` child text ("*") and surrounding whitespace, so the resulting message can be malformed (e.g., `"Name  is required"` with double space, or include stray characters).

---

### Expected Behavior (Correct)

2.1 WHEN the locale is `es` or `fr` THEN the system SHALL perform a deep merge of translation objects so that missing nested keys fall back to English values without losing array entries or throwing runtime errors.

2.2 WHEN the current year equals the graduation year (2024) THEN the system SHALL display a minimum of `1` year of experience (i.e., `years = Math.max(1, currentYear - graduationYear)`) so the description never reads "+0 years".

2.3 WHEN the user visits the site in any locale THEN the `About.astro` bento grid SHALL render the status items, interests, and location label using i18n strings from the active locale's translation file, so French and Spanish visitors see translated content.

2.4 WHEN the user visits `/es/` or `/fr/` THEN `App.astro` SHALL receive the correct `currentLocale` from `Astro.currentLocale` (already available in `App.astro`'s frontmatter) and pass it to all child components, so all rendered content matches the URL locale.

2.5 WHEN `src/i18n/utils.ts` is referenced THEN the system SHALL either contain valid utility exports (e.g., a `getLangFromUrl` helper) or be removed from the project to avoid confusion and potential import errors.

2.6 WHEN the codebase is maintained THEN `src/components/Projects.astro` SHALL either be removed or consolidated with `Test.astro` so there is a single source of truth for the projects section.

2.7 WHEN the codebase is maintained THEN `src/components/Modal.astro` SHALL either be removed or converted into a reusable generic modal component without placeholder content, so demo text is never accidentally rendered.

2.8 WHEN the contact form name field is empty and the user submits THEN the system SHALL display a clean, correctly formatted error message (e.g., `"Name is required"`) without double spaces or stray characters.

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the locale is `en` THEN the system SHALL CONTINUE TO render all content in English exactly as before, with no changes to the English translation file or its consumption.

3.2 WHEN the user has a valid positive years-of-experience value (current year > 2024) THEN the system SHALL CONTINUE TO calculate and display the correct number of years without modification.

3.3 WHEN the contact form is submitted with valid name, email, and message THEN the system SHALL CONTINUE TO submit to the Web3Forms API and show the success modal animation.

3.4 WHEN the user toggles the theme (light/dark/system) THEN the system SHALL CONTINUE TO persist the preference in `localStorage` and apply it correctly on page load and after ViewTransitions navigation.

3.5 WHEN the user navigates between sections using the header nav links THEN the system SHALL CONTINUE TO smooth-scroll to the correct section with header-height offset compensation.

3.6 WHEN the experience timeline renders grouped entries (same company, consecutive) THEN the system SHALL CONTINUE TO display the career progression group with the promoted badge and rocket animation in the modal.

3.7 WHEN the PhotoSwipe gallery is opened in the Certificates or Projects section THEN the system SHALL CONTINUE TO display images in the lightbox with correct navigation.

3.8 WHEN the user visits the site for the first time with a browser language of `es` or `fr` THEN the system SHALL CONTINUE TO auto-redirect to the correct locale route via the `lang-redirected` localStorage flag.
