# Strict Build & Dependency Rules

This file acts as the ultimate source of truth for dependency management and build configurations in this project. Agents MUST read and adhere to these constraints before modifying any `build.gradle.kts` or `libs.versions.toml` files.

## Core Tech Stack & Versions

- **Kotlin:** 2.3.21
- **AGP (Android Gradle Plugin):** 9.2.0+ 
  - **CRITICAL RULE:** Do NOT use the legacy `kotlin-android` plugin. You MUST use declarative setups only.
- **Compose BOM:** 2026.04.01
- **Firebase:** BOM 34.12.0 
  - **CRITICAL RULE:** Firebase KTX versions are permanently discontinued. Reject any `-ktx` artifact extensions (e.g., use `firebase-analytics` NOT `firebase-analytics-ktx`).

## Navigation & Routing

- **Mandated Standard:** **Navigation 3** is the mandated standard for all new navigation implementations and migrations. Avoid legacy Navigation 2.x patterns.
- **Skill Routing:** If you are tasked with building or refactoring navigation, you MUST first read the official Google skill guidelines located at:
  `external_skills/android-skills/navigation/navigation-3/SKILL.md`

## AGP Migration — Skill Routing

If the project is running on an AGP version older than 9.2.0, do NOT attempt to migrate the build scripts from memory. LLM hallucination of Gradle DSL changes is strictly forbidden.

- **Mandatory Action:** Before touching any `.gradle.kts` files, you MUST read the official migration skill located at:
  `external_skills/android-skills/build/agp/agp-9-upgrade/SKILL.md`

## Design & UI Tooling

- **DESIGN.md Protocol:** Use `@google/design.md` (alpha) for defining and linting the project's visual identity.
  - **Tooling Constraint:** `npx @google/design.md lint DESIGN.md` MUST pass before any UI-related PR is merged.
  - **Single Source of Truth:** All colors, typography, and spacing tokens MUST be defined in `DESIGN.md` and exported/mapped to Compose `MaterialTheme`. Do not hardcode hex values directly into Compose modifiers.