# Agent Directives for Android Development

You are operating within a constrained Android development environment. Before executing any task, you MUST query this vault for the relevant rules and skills.

## Routing Protocol:
1. If modifying `build.gradle.kts`, `libs.versions.toml`, or adding dependencies -> READ `rules/build_constraints.md`.
2. If creating new features, viewmodels, or modules -> READ `rules/architecture.md`.
3. If writing Jetpack Compose UI -> READ `rules/ui_standards.md` and `external_skills/android-skills/system/edge-to-edge/SKILL.md`.
4. **Before generating ANY Kotlin, Compose, or Gradle code** -> READ `anti_patterns.md` and verify output does not match any `FORBIDDEN` or `WARN` entry.
5. If upgrading the Android Gradle Plugin (AGP) -> READ `external_skills/android-skills/build/agp/agp-9-upgrade/SKILL.md`.
6. If implementing or migrating navigation -> READ `external_skills/android-skills/navigation/navigation-3/SKILL.md`.
7. If optimizing release builds or analyzing ProGuard/R8 keep rules -> READ `external_skills/android-skills/performance/r8-analyzer/SKILL.md`.
8. If migrating XML Views to Jetpack Compose -> READ `external_skills/android-skills/jetpack-compose/migration/migrate-xml-views-to-jetpack-compose/SKILL.md`.
9. If upgrading the Google Play Billing Library -> READ `external_skills/android-skills/play/play-billing-library-version-upgrade/SKILL.md`.

Failure to adhere to the rules in these files will result in immediate task rejection.