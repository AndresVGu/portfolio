# Implementation Plan: apple-carousel

## Overview

Implementación de un carrusel horizontal estilo Apple en el portafolio Astro. El plan sigue un orden incremental: primero la lógica pura testeable, luego las claves i18n, luego el componente principal, y finalmente la integración en `App.astro`. Cada paso produce código funcional que se conecta al anterior.

## Tasks

- [x] 1. Crear módulo de lógica pura `carouselScrollState.ts`
  - Crear `src/scripts/carouselScrollState.ts` con las interfaces `ScrollDimensions` y `ScrollState` y la función exportada `checkScrollability`
  - La función debe retornar `canScrollLeft: scrollLeft > 0` y `canScrollRight: scrollLeft + clientWidth < scrollWidth - 1`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 1.1 Escribir property test — Property 2: botón izquierdo deshabilitado en scrollLeft=0
    - **Property 2: left button disabled when scrollLeft === 0**
    - Usar `fc.record({ scrollWidth: fc.integer({ min: 500, max: 5000 }), clientWidth: fc.integer({ min: 300, max: 500 }) })` con `scrollLeft: 0`
    - Verificar que `checkScrollability({ scrollLeft: 0, scrollWidth, clientWidth }).canScrollLeft === false`
    - **Validates: Requirements 3.2**

  - [ ]* 1.2 Escribir property test — Property 3: botón derecho deshabilitado al final
    - **Property 3: right button disabled when scrollLeft + clientWidth >= scrollWidth**
    - Generar `scrollLeft` en el rango `[scrollWidth - clientWidth, scrollWidth]` para garantizar que se alcanzó el final
    - Verificar que `checkScrollability({ scrollLeft, scrollWidth, clientWidth }).canScrollRight === false`
    - **Validates: Requirements 3.3**

  - [ ]* 1.3 Escribir property test — Property 4: actualización de estado tras scroll
    - **Property 4: button states reflect scroll position after scroll event**
    - Para cualquier combinación válida de `scrollLeft`, `scrollWidth`, `clientWidth`, verificar que `canScrollLeft === (scrollLeft > 0)` y `canScrollRight === (scrollLeft + clientWidth < scrollWidth)`
    - **Validates: Requirements 3.4**

- [x] 2. Agregar claves `CAROUSEL` a los archivos i18n
  - Agregar en `src/i18n/en.json`: `"CAROUSEL": { "scrollLeft": "Scroll left", "scrollRight": "Scroll right", "regionLabel": "Projects carousel" }`
  - Agregar en `src/i18n/es.json`: `"CAROUSEL": { "scrollLeft": "Desplazar a la izquierda", "scrollRight": "Desplazar a la derecha", "regionLabel": "Carrusel de proyectos" }`
  - Agregar en `src/i18n/fr.json`: `"CAROUSEL": { "scrollLeft": "Défiler à gauche", "scrollRight": "Défiler à droite", "regionLabel": "Carrousel de projets" }`
  - _Requirements: 6.1, 6.2, 6.3, 8.1, 8.2, 8.3_

  - [ ]* 2.1 Escribir property test — Property 8: aria-labels de botones coinciden con locale
    - **Property 8: button aria-labels match i18n.CAROUSEL for any locale**
    - Para cada locale (`en`, `es`, `fr`), verificar que `getI18N({ currentLocale: locale }).CAROUSEL.scrollLeft` y `.scrollRight` existen y no están vacíos
    - **Validates: Requirements 8.1, 8.2**

- [x] 3. Crear componente `AppleCarousel.astro`
  - Crear `src/components/AppleCarousel.astro` con la prop `currentLocale?: string` (default `'en'`)
  - En el frontmatter: importar `getI18N`, definir `PROJECT_IMAGES` (array de 6 rutas), construir `projectsWithImages` con `i18n.PROJECTS.map((p, i) => ({ ...p, image: PROJECT_IMAGES[i] ?? '' }))`
  - _Requirements: 1.1, 1.4, 1.5, 4.1, 4.2_

  - [x] 3.1 Implementar el CarouselTrack con tarjetas inline
    - Renderizar el `div[data-carousel-track]` con `role="region"`, `aria-label={i18n.CAROUSEL.regionLabel}` y clases Tailwind: `flex gap-4 overflow-x-auto scroll-smooth py-10 md:py-20 pl-4 carousel-hide-scrollbar`
    - Renderizar cada tarjeta con `{projectsWithImages.map(...)}`: `flex-shrink-0 w-[230px] h-[320px] md:w-96 md:h-[480px] rounded-2xl overflow-hidden cursor-pointer bg-cover bg-center transition-transform duration-300 ease-in-out hover:scale-[1.03]`
    - Incluir overlay `bg-gradient-to-b from-transparent to-black/70` y bloque de texto con `title` y `subtitle`
    - Agregar `<style>` mínimo para `.carousel-hide-scrollbar { scrollbar-width: none; }` y `::webkit-scrollbar { display: none; }`
    - _Requirements: 2.1, 2.2, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3_

  - [x] 3.2 Implementar los NavButtons con accesibilidad
    - Renderizar botón izquierdo con `data-carousel-btn-left`, `aria-label={i18n.CAROUSEL.scrollLeft}`, `aria-disabled="true"`, `disabled`, y clases Tailwind para dark mode y estado disabled
    - Renderizar botón derecho con `data-carousel-btn-right`, `aria-label={i18n.CAROUSEL.scrollRight}`, y las mismas clases
    - _Requirements: 2.3, 2.4, 3.2, 3.3, 5.4, 7.2, 8.1, 8.2, 8.4_

  - [x] 3.3 Implementar el bloque `<script>` con lógica de scroll
    - Usar `document.addEventListener('astro:page-load', ...)` para compatibilidad con View Transitions
    - Usar `querySelectorAll('[data-carousel-root]').forEach(...)` para soportar múltiples instancias
    - Implementar `checkScrollability()` inline (replica la lógica de `carouselScrollState.ts`) y `setBtn(btn, isDisabled)` que setea `btn.disabled` y `aria-disabled`
    - Registrar listeners de `click` en ambos botones (`scrollBy({ left: ±300, behavior: 'smooth' })`) y listener `scroll` con `{ passive: true }` en el track
    - Llamar `checkScrollability()` al final para establecer el estado inicial
    - _Requirements: 2.3, 2.4, 3.1, 3.4, 3.5, 8.4_

  - [ ]* 3.4 Escribir property test — Property 5: botón deshabilitado no ejecuta scroll
    - **Property 5: disabled button does not invoke scrollBy**
    - Para `direction` en `['left', 'right']`, simular click en botón con `disabled=true` y verificar que `scrollBy` no fue invocado (spy con `vi.fn()`)
    - **Validates: Requirements 3.5**

  - [ ]* 3.5 Escribir property test — Property 9: sincronización disabled / aria-disabled
    - **Property 9: aria-disabled mirrors disabled for any button state**
    - Para cualquier combinación de `scrollLeft`, `scrollWidth`, `clientWidth`, aplicar el estado a los botones y verificar que `btn.disabled === (btn.getAttribute('aria-disabled') === 'true')` para ambos botones
    - **Validates: Requirements 8.4**

- [x] 4. Checkpoint — Verificar componente aislado
  - Asegurarse de que `AppleCarousel.astro` compila sin errores de TypeScript (`astro check`)
  - Verificar que todos los tests de propiedad implementados hasta aquí pasan
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Integrar `AppleCarousel` en `App.astro`
  - Agregar `import AppleCarousel from '@/components/AppleCarousel.astro'` en el frontmatter de `src/components/App.astro`
  - Agregar un nuevo `<SectionContainer id="carousel-projects">` con `<AppleCarousel currentLocale={currentLocale} />` inmediatamente después del `SectionContainer id="projects"` existente
  - NO modificar el `SectionContainer id="projects"` ni `Test.astro`
  - _Requirements: 1.2, 1.3, 5.5, 6.1, 6.2, 7.1, 7.3, 7.4_

  - [ ]* 5.1 Escribir property test — Property 1: cardinalidad del carrusel
    - **Property 1: card count equals PROJECTS.length for any locale**
    - Para cada locale (`en`, `es`, `fr`), renderizar `AppleCarousel` y verificar que el número de elementos `[data-carousel-card]` es igual a `getI18N({ currentLocale: locale }).PROJECTS.length`
    - **Validates: Requirements 1.5**

  - [ ]* 5.2 Escribir property test — Property 6: contenido de tarjeta coincide con i18n
    - **Property 6: card title and subtitle match PROJECTS[i] for any locale**
    - Para cualquier locale y cualquier índice `i` en `[0, 5]`, verificar que el HTML de la tarjeta `i` contiene `PROJECTS[i].title` y `PROJECTS[i].subtitle`
    - **Validates: Requirements 4.1, 6.3**

  - [ ]* 5.3 Escribir property test — Property 7: encabezado de sección coincide con locale
    - **Property 7: section heading equals i18n.TITLES.projects for any locale**
    - Para cada locale, verificar que el `h2` del componente tiene `textContent === i18n.TITLES.projects`
    - **Validates: Requirements 6.1**

- [x] 6. Checkpoint final — Verificar integración completa
  - Ejecutar `astro check` para confirmar que no hay errores de TypeScript en ningún archivo modificado
  - Verificar que todos los tests de propiedad pasan con `npx vitest --run`
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Los tests de propiedad requieren instalar `fast-check` como devDependency: `npm install --save-dev fast-check`
- El test runner del proyecto es Vitest (estándar en proyectos Astro); si no está configurado, instalarlo con `npm install --save-dev vitest`
- Cada tarea referencia los requisitos específicos para trazabilidad
- El orden de las tareas garantiza que nunca haya código huérfano: la lógica pura (tarea 1) es usada por el componente (tarea 3), que es integrado en App.astro (tarea 5)
- Los checkpoints (tareas 4 y 6) validan el estado acumulado antes de continuar
