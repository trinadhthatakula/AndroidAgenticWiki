# Blueprint: DESIGN.md Implementation
> **Stack:** @google/design.md (alpha) · Compose Material 3
> **Enforcement:** Read before defining any UI theme, colors, or spacing tokens.

This blueprint defines how to implement and enforce a `DESIGN.md` based design system as the single source of truth in an Android project.

## 0. Prerequisites & Tooling Setup
Unlike standard Android dependencies, `@google/design.md` is a Node-based CLI tool. 
* **Requirement:** The host machine and the CI/CD environment MUST have Node.js installed.
* **Initialization:** It is recommended to initialize a basic `package.json` in your Android project root to lock the tool version.
  ```bash
  npm init -y
  npm install -D @google/design.md
  ```

## 1. Project Root Setup
Create a `DESIGN.md` file in the root of the project to hold the design tokens.

```markdown
---
name: AppVisualIdentity
colors:
  primary: "#1A1C1E"
  on-primary: "#FFFFFF"
  secondary: "#6C7278"
  background: "#F7F5F2"
  surface: "#FFFFFF"
typography:
  headline-large:
    fontFamily: Public Sans
    fontSize: 2.5rem
    fontWeight: 700
  body-medium:
    fontFamily: Public Sans
    fontSize: 1rem
rounded:
  small: 4px
  medium: 8px
  large: 16px
spacing:
  small: 8px
  medium: 16px
  large: 24px
---

## Overview
This file serves as the strict, single source of truth for all UI tokens.
```

## 2. CI/CD Enforcement
Do not rely on developers to manually check the file. Add a linting check to your GitHub Actions or GitLab CI pipeline.

```yaml
# Example snippet for GitHub Actions
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
- name: Install design.md CLI
  run: npm ci
- name: Lint DESIGN.md
  run: npx @google/design.md lint DESIGN.md
```

## 3. Compose Token Mapping
In your `:ui-theme` or `:designsystem` module, map these exact tokens to Compose objects and `MaterialTheme`.

### Spacing & Rounding
```kotlin
object Spacing {
    val Small = 8.dp
    val Medium = 16.dp
    val Large = 24.dp
}

object Shapes {
    val Small = RoundedCornerShape(4.dp)
    val Medium = RoundedCornerShape(8.dp)
    val Large = RoundedCornerShape(16.dp)
}
```

### Color Mapping
```kotlin
private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF1A1C1E),
    onPrimary = Color(0xFFFFFFFF),
    secondary = Color(0xFF6C7278),
    background = Color(0xFFF7F5F2),
    surface = Color(0xFFFFFFFF)
)
```

## 4. Usage in Composables
Always prefer `MaterialTheme` or the central token objects. Hardcoding hex values or raw DP values inside UI modifiers is strictly forbidden.

```kotlin
@Composable
fun PrimaryButton(onClick: () -> Unit) {
    Button(
        onClick = onClick,
        shape = Shapes.Medium,
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary
        )
    ) {
        Text(
            text = "Execute",
            modifier = Modifier.padding(horizontal = Spacing.Small)
        )
    }
}
```

## 5. Migration Checklist
- [ ] Verify Node.js is installed locally and in CI.
- [ ] Initialize `package.json` and install `@google/design.md`.
- [ ] Create initial `DESIGN.md` in the project root.
- [ ] Run `npx @google/design.md lint DESIGN.md` to validate syntax.
- [ ] Replace all hardcoded `Color(0xFF...)` with `MaterialTheme.colorScheme` references.
- [ ] Replace all hardcoded `padding(16.dp)` with semantic `Spacing` object references.
