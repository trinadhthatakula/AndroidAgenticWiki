# Architectural Blueprints & Enforcement

You are operating within an Android codebase. Before generating any structural code, creating ViewModels, or adding Repositories, you MUST analyze the user's project structure to determine the active architecture. 

## Agent Directive: Determine the Architecture
1. **Scan the root directory and `settings.gradle.kts`:**
   * If you see isolated modules like `:domain`, `:data`, and `:app`/`:presentation`, lock into **Clean Architecture**.
2. **Scan the `app/src/main/` directory and ViewModels:**
   * If you see generic `StateFlow` and functions exposing individual actions, lock into **Standard MVVM**.
   * If you see `Intent` or `Action` sealed classes being passed to a centralized `onEvent(event)` or `process(action)` function in the ViewModel, lock into **MVI (Model-View-Intent)**.
3. If the architecture is ambiguous, ask the user which pattern they prefer before proceeding.

---

## Pattern 1: Standard MVVM (Google Recommended)
*Use this for single-module or standard feature-module apps.*
* **Unidirectional Data Flow (UDF):** UI sends events to the ViewModel. ViewModel mutates a single `StateFlow<UiState>`. UI observes the state.
* **ViewModel:** Must not contain ANY `android.*` imports (except `ViewModel` itself). Zero references to `Context`, `View`, or Compose `Modifier`.
* **Data Layer:** Use Repository classes to abstract data sources (Room, Retrofit, DataStore). ViewModels communicate only with Repositories.

## Pattern 2: Strict Clean Architecture
*Use this for multi-module enterprise apps.*
* **`:domain` Layer:** Pure Kotlin. ZERO Android framework dependencies. Holds UseCases/Interactors and repository interfaces. Use Kotlin `Result` or sealed interfaces to strictly define operational success/failure states.
* **`:data` Layer:** Depends on `:domain`. NO UI elements. Implements the repository interfaces. Handles Room DB, network calls, and DataStore.
* **`:presentation` / `:app` Layer:** Depends on `:domain` (and usually `:data` for DI wiring). Holds all Compose UI and ViewModels. Each screen MUST have its own ViewModel managing an isolated UI State.

## Pattern 3: MVI (Model-View-Intent)
*Use this for highly complex, state-driven Compose apps.*
* **Strict State Machines:** The UI State must be a single data class representing the entire screen.
* **Intents:** The UI communicates with the ViewModel exclusively by passing a sealed interface/class (e.g., `ScreenEvent` or `ScreenIntent`).
* **Reducer:** The ViewModel processes the Intent and uses a reducer pattern to emit a new immutable state.

## Universal Anti-Patterns (FORBIDDEN IN ALL ARCHITECTURES)
* **God ViewModels:** ViewModels exceeding 400 lines of code. Break them down into smaller components or extract logic to UseCases.
* **State Hoarding:** Sharing state blindly across screens. Share state only when strictly necessary via minimal navigation arguments or a shared scoped dependency.
* **Leaking Data Models:** Never pass Room `@Entity` or Retrofit DTOs directly to the Compose UI. Map them to domain/UI models in the Data or Domain layer.