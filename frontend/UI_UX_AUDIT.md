# SIH Dual-Hazard Decision Support System — Comprehensive UI/UX Audit

**Document:** `frontend/UI_UX_AUDIT.md`  
**Role:** UI/UX Refinement & Visual Design Engineer  
**Date:** September 2026  
**Status:** Audit Complete — Baseline Established  
**Scope:** Strict UI/UX refinement across all existing pages, components, and design assets. **Zero feature additions, removals, or functional logic changes.**

---

## 1. Executive Summary

This audit evaluates the current visual presentation, usability, layout responsiveness, accessibility, and visual consistency of the SIH Dual-Hazard Flood + Landslide Early Warning and Decision Support System frontend. 

While the functional feature set and backend integration are complete and verified (including What-If simulation, alternative route risk evaluation, historical trend trajectory, dual-hazard risk assessment, and alert lifecycles), the visual presentation currently relies heavily on ad-hoc inline styles, lacks a cohesive component-level design system, exhibits inconsistent spacing and button hierarchies, and requires optimization to look and feel like a **national-scale disaster intelligence and early-warning dashboard** suitable for emergency authorities, government operators, and SIH jury evaluation.

---

## 2. Current State Assessment

### 2.1 Current Design System & Tokens
- **Files:** `frontend/src/styles/tokens.css`, `frontend/src/styles/globals.css`.
- **Strengths:** 
  - Defined CSS variables for dark theme backgrounds (`--bg-dark-900` to `--bg-dark-600`), primary blues, accent colors (cyan, teal, purple), and 5 risk tiers (LOW, MODERATE, HIGH, VERY_HIGH, CRITICAL).
  - Modern fonts imported via Google Fonts: `Inter` (body) and `Outfit` (display).
- **Weaknesses:**
  - Token adoption is incomplete. Many components use hardcoded RGBA values (e.g., `rgba(59, 130, 246, 0.15)`, `rgba(220, 38, 38, 0.4)`, `rgba(30, 41, 59, 0.9)`).
  - Lacks standardized typography classes (`text-display`, `text-h1`, `text-h2`, `text-caption`, `tabular-nums`).
  - Lacks reusable component classes for buttons, input groups, cards, badges, and layout grids.
  - Almost 90% of styling across pages and components is applied as repetitive **inline React styles** (`style={{ ... }}`), making maintenance difficult and causing visual drift.

### 2.2 Current Navigation & Header
- **Component:** `src/components/common/Header.tsx`.
- **Structure:** Brand title, 6 NavLinks (Overview `/`, Risk Center `/risk-center`, Simulator `/simulator`, Routes `/routes`, History `/history`, Alerts `/alerts`), Live/Demo toggle button, location pill, and data freshness badge.
- **UX & Visual Issues:**
  - On viewports < 1200px, the header wraps into multiple awkward rows because all elements are in a single `flex-wrap: wrap` container.
  - Brand identity looks generic with a plain shield icon; lacks the visual authority of an official emergency management system.
  - Active navigation state uses a basic semi-transparent background with no animated indicator line or distinct highlight.
  - No mobile hamburger drawer or collapsible menu on screens < 768px.

### 2.3 Current Pages Analysis
1. **Overview / Dashboard (`src/pages/Dashboard.tsx`):**
   - Combines coordinate search, benchmark presets, dual-hazard assessment banner, interactive map, environmental cards (weather, terrain, satellite), hazard branch risk cards, and active alerts.
   - **Issues:** Hardcoded `gridTemplateColumns: '2fr 1fr'` and `gridTemplateColumns: '1fr 1fr 1fr'` with inline styles; does not stack cleanly on tablet/mobile. Primary banner gradient is subtle and lacks visual punch.
2. **Risk Center (`src/pages/RiskCenter.tsx`):**
   - Presents Flood and Landslide branch cards, SHAP Feature Importance, and PostGIS Impact Summary.
   - **Issues:** Top header repeats identical coordinate logic; grid is a static `1fr 1fr` that breaks on screens < 1024px; typography hierarchy between SHAP weights and impact metrics needs tighter alignment.
3. **What-If Scenario Simulator (`src/pages/Simulator.tsx`, `WhatIfSimulator.tsx`):**
   - Form sliders for rainfall anomaly, peak intensity, event duration, and soil moisture; baseline vs. scenario comparison; probability shift bars.
   - **Issues:** Sliders use default native browser styling with basic accent color; lacks refined thumb and track styling; layout is hardcoded `1fr 1fr`; mobile users struggle with tight horizontal comparison columns.
4. **Alternative Route Risk Evaluator (`src/pages/Routes.tsx`, `RouteRiskPanel.tsx`, `RouteOverlay.tsx`):**
   - Corridor selection, travel mode, risk strategy, candidate route cards, synchronized Leaflet map with polyline geometry and hazard hotspots.
   - **Issues:** Grid is static `1.1fr 1.4fr`; candidate route cards have uneven padding and metric columns; hotspot pins on the map use default Leaflet pin icons rather than custom styled emergency marker badges.
5. **Prediction History & Trends (`src/pages/History.tsx`, `RiskTrendChart.tsx`):**
   - Header, SVG multi-line trend chart (24h, 7d, 30d), chronological audit table.
   - **Issues:** Table has basic inline borders and no alternating row contrast; table lacks sticky header when scrolling; SVG chart tooltip has a fixed position (`top: 10px, right: 15px`) rather than smoothly following the cursor or hovered data point.
6. **Hazard Alerts & Warnings (`src/pages/Alerts.tsx`, `AlertPanel.tsx`):**
   - Status tabs (All, Active, Acknowledged, Resolved), severity dropdown, alert list with Acknowledge/Resolve actions and trigger reasoning.
   - **Issues:** Filter tab buttons look basic and lack visual weight; alert cards have varying vertical alignment; resolve and acknowledge buttons lack clear hover and active feedback.

### 2.4 Typography & Hierarchy
- Fonts: `Inter` and `Outfit` are well-chosen, but font sizing is erratic:
  - Headers oscillate between `1.15rem`, `1.25rem`, `1.3rem`, `1.4rem`.
  - Body text ranges between `0.7rem`, `0.72rem`, `0.75rem`, `0.78rem`, `0.8rem`, `0.85rem`.
  - Numbers lack `font-variant-numeric: tabular-nums`, leading to subtle width shifts when values update.
  - Subtitles and labels often lack sufficient contrast (`--text-muted` at `0.7rem` can be difficult to read in emergency conditions).

### 2.5 Color System & Risk Communication
- Risk Palette:
  - Low (`#10b981` / green)
  - Moderate (`#eab308` / yellow)
  - High (`#f97316` / orange)
  - Very High (`#ef4444` / red)
  - Critical (`#dc2626` / deep crimson)
- Hazard Separation:
  - Flood: Cool Blue / Cyan (`#3b82f6` / `#06b6d4`)
  - Landslide: Warm Amber / Terracotta (`#f97316` / `#ea580c`)
- **Issues:**
  - Some cards mix flood blues and high-risk orange within the same container without clear branch visual framing.
  - Need stronger dual-hazard architectural framing: Flood (Hydrological Branch) vs. Landslide (Geotechnical Branch) feeding into the Fusion Engine.

### 2.6 Map UI & GIS Experience
- **Components:** `BaseMap.tsx`, `Map.tsx`, `LayerControl.tsx`, `HazardOverlay.tsx`, `RouteOverlay.tsx`.
- **Issues:**
  - Map container borders are thin (`1px solid var(--card-border)`), looking like a standard web container rather than an integrated GIS situational console.
  - `LayerControl.tsx` is a raw popover with checkboxes; it lacks categorized sections (Base Cartography, Multi-Hazard Overlays, Infrastructure Exposure, Evacuation Corridors).
  - Coordinates display on click is not highlighted with a tactical crosshair or prominent HUD badge.
  - Map zoom controls use default Leaflet styles with minimal dark mode adaptation.

### 2.7 Forms, Buttons, and Inputs
- Inputs (coordinate inputs, sliders, select dropdowns):
  - Coordinate inputs (`latInput`, `lonInput`) are plain unstyled HTML number inputs with inline `width: 80px`.
  - Sliders in What-If Simulator lack tactile feel, step markers, and clear minimum/maximum boundary callouts.
  - Buttons have disparate padding and border-radii (`var(--radius-sm)` vs `var(--radius-md)` vs `var(--radius-full)`).
  - Missing visible `:focus-visible` focus rings for keyboard navigation.

### 2.8 Tables & Charts
- **History Table:**
  - Table cells have inline padding `0.75rem`.
  - No hover row highlight; no zebra striping or subtle elevation.
  - Long table overflows horizontally without a stylized scroll indicator.
- **Risk Trend Chart:**
  - SVG lines are well-drawn, but gridlines are plain dashed lines without crisp axis labels.
  - Fixed tooltip overlay in upper right corner disconnects the reading from the hovered point.

### 2.9 Responsive Behavior
- Desktop (> 1280px): Functional, but excessive whitespace in some grid gutters.
- Laptop / Tablet (768px – 1200px): Multi-column grids (`2fr 1fr`, `1.1fr 1.4fr`, `1fr 1fr 1fr`) become squished; header wraps into 3-4 cluttered rows.
- Mobile (< 768px): Several panels overflow horizontally; maps become difficult to interact with; sliders and route cards become crowded.

### 2.10 Accessibility & Micro-Interactions
- Contrast: Certain secondary texts (`#64748b` on `#121824`) have a contrast ratio of ~3.2:1, failing WCAG AA (4.5:1 requirement).
- Focus States: Interactive buttons rely on browser defaults or lack focus indicators entirely.
- Micro-interactions: Cards have instant hover snaps rather than smooth hardware-accelerated transitions.

---

## 3. UI/UX Problem Statements & Improvement Plan

| Area | Current Problem | Proposed Design Refinement (No Logic Changes) |
|---|---|---|
| **Design System** | Scattered inline styles and hardcoded RGBA values across 20+ files. | Standardize in `tokens.css` and a clean `design-system.css` module with utility classes (`.btn`, `.card-intel`, `.metric-box`, `.input-tactical`). |
| **Visual Language** | Generic dark theme resembling an admin template. | Elevate to an official "National Disaster Intelligence Console": tactical grid styling, crisp 1px borders with glow accents, status beacon dots, structured badges. |
| **Information Hierarchy** | Important risk metrics are competing visually with ancillary data. | Enforce 3-tier hierarchy: (1) Primary Risk HUD / Status Beacon, (2) Geospatial Map & Situational Overlays, (3) Detailed Telemetry & Exposure Breakdowns. |
| **Map Situational Console** | Basic Leaflet frame with default buttons and generic popover layer control. | Transform map into a command-grade GIS viewport: HUD coordinates overlay, structured layer manager grouped by category, customized emergency pin icons. |
| **Dual-Hazard Branching** | Flood and Landslide branches can be visually confused. | Distinct, persistent branch styling: Blue/Cyan theme for Hydrological Flood, Terracotta/Amber theme for Geotechnical Landslide, unified Fusion banner for Combined Risk. |
| **What-If Simulator** | Plain HTML range sliders; cramped comparison columns. | Premium tactical sliders with track progress fills, clear hypothesis summary card, distinct Before vs. After split comparison with animated risk delta indicators. |
| **Route Risk Panel** | Generic cards; candidate routes look like a standard list. | Evacuation corridor cards with distinct rank badges, hazard hotspot counters, road condition tags, and prominent comparative risk badges (strictly non-safe). |
| **Alert Management** | Flat alert cards with minimal distinction between active and resolved. | Elevated alert badges, pulsing status beacon for `ACTIVE` critical alerts, clear operator action buttons with crisp hover feedback. |
| **Responsive Design** | Fixed column ratios break on tablets and laptops. | Implement responsive CSS grid breakpoints (`@media (max-width: 1024px)`, `@media (max-width: 768px)`) that reflow gracefully into stacked views. |
| **Accessibility** | Low-contrast text labels; missing focus-visible outlines. | Lift text contrast to pass WCAG AA (minimum 4.5:1); add accessible focus rings and ARIA attributes on interactive controls. |

---

## 4. Non-Negotiable Constraints Confirmed
- **Zero product features added, removed, or altered.**
- **Zero backend API endpoint or contract modifications.**
- **Zero machine learning, fusion logic, or formula alterations.**
- **Zero fake data or synthetic numbers introduced.**
- **All 7 test suites (27 tests) and production build must continue to pass 100%.**
