# UI & Graphics Standards

You are enforcing modern, high-performance Jetpack Compose UI standards. Before generating or modifying any UI code, you MUST adhere to the following rules.

## Design System (Material 3)
* **Stable Material 3:** Use stable Material 3 components (`androidx.compose.material3:*`) universally. 
* **Avoid Alpha APIs:** Do NOT use experimental Material Expressive variants or alpha Material 3 components unless explicitly instructed by the user. 
* **Theming:** Rely on `MaterialTheme.colorScheme` and `MaterialTheme.typography`. Do not hardcode hex colors or raw font sizes into UI elements.

## Compose Performance
* **Graphics Layer:** All transitions and animations MUST run in the graphics layer (`Modifier.graphicsLayer`) whenever possible (e.g., animating alpha, scale, or translation). This prevents unnecessary layout recomposition and dropped frames.
* **State Deferral:** Pass state as lambdas (e.g., `() -> String`) to deeply nested composables instead of direct values to defer state reads to the composition or layout phases.

## Structural Constraints
* **Scaffold Padding:** Do NOT spam multiple nested `Scaffold` components. If nesting is absolutely required, you MUST explicitly handle, add, or multiply the `PaddingValues`. Every `Scaffold` provides inner padding values that must be applied to its immediate child to prevent UI overlap with system bars or bottom navigation.

## System UI & Edge-to-Edge
* **Enforcement:** All Activities MUST call `enableEdgeToEdge()` before `setContent`. Projects targeting Android SDK 35+ have this enforced by the system.
* **Skill Routing:** For full implementation guidance—including handling IME (keyboard) insets, list content padding, and dialog edge-to-edge rendering—you MUST READ the official skill:
  `external_skills/android-skills/system/edge-to-edge/SKILL.md`