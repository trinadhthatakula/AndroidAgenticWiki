# Blueprint: MVVM + StateFlow State Management Contract
> **Stack:** Kotlin 2.3.21 · Jetpack Compose · StateFlow · Sealed Interfaces · Kotlin Result
> **Enforcement:** Read before creating any ViewModel, UiState, or screen-level Composable.

---

## 0. The Principle This Entire Document Enforces

> **One screen. One ViewModel. One UiState. One source of truth.**

Every deviation from this — split flows, multiple state objects, shared ViewModels across screens — requires explicit justification in a code comment. Default is strict. Exceptions are documented, not assumed.

---

## 1. UiState Contract

### 1.1 The correct model: sealed interface

Every screen's state is a sealed interface with mutually exclusive cases. No screen can be simultaneously loading and showing data.

```kotlin
sealed interface ProfileUiState {
    data object Loading : ProfileUiState
    data class Success(
        val user: UserProfile,
        val preferences: UserPreferences,
        val recentOrders: List<Order>?
    ) : ProfileUiState
    data class Error(val message: String) : ProfileUiState
}
```

### 1.2 When to use `data class` UiState instead

Use a `data class` (not sealed interface) when:
- The screen has a persistent content view that overlays loading/error states (e.g., a pull-to-refresh list).
- Multiple independent async operations populate different UI regions simultaneously.
- The screen should never be fully blank — it always shows *something*.

```kotlin
data class FeedUiState(
    val posts: List<Post> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null
)
```

Even then, `isLoading` and `error` live *inside* the same data class — not as separate StateFlows.

### 1.3 One-off events: `SharedFlow`, not `StateFlow`

Navigation actions and snackbar triggers are events — they fire once and are consumed. They must not be modeled as state.

```kotlin
// In ViewModel
private val _events = MutableSharedFlow<ProfileEvent>(
    extraBufferCapacity = 1,
    onBufferOverflow = BufferOverflow.DROP_OLDEST
)
val events: SharedFlow<ProfileEvent> = _events.asSharedFlow()

sealed interface ProfileEvent {
    data class NavigateTo(val destination: ProfileDestination) : ProfileEvent
    data class ShowSnackbar(val message: String) : ProfileEvent
}

// Emit from ViewModel
viewModelScope.launch { _events.emit(ProfileEvent.NavigateTo(ProfileDestination.Settings)) }

// Collect in Composable
val lifecycleOwner = LocalLifecycleOwner.current
LaunchedEffect(viewModel.events, lifecycleOwner) {
    viewModel.events
        .flowWithLifecycle(lifecycleOwner.lifecycle)
        .collect { event ->
            when (event) {
                is ProfileEvent.NavigateTo -> navController.navigate(event.destination.route)
                is ProfileEvent.ShowSnackbar -> snackbarHostState.showSnackbar(event.message)
            }
        }
}
```

---

## 2. ViewModel Contract

### 2.1 Full structure

```kotlin
class ProfileViewModel(
    private val observeUserProfileUseCase: ObserveUserProfileUseCase,
    private val getUserPreferencesUseCase: GetUserPreferencesUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    private val _events = MutableSharedFlow<ProfileEvent>(
        extraBufferCapacity = 1,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    val events: SharedFlow<ProfileEvent> = _events.asSharedFlow()

    init {
        loadScreen()
    }

    private fun loadScreen() {
        // Combine independent flows into a single state emission
        combine(
            observeUserProfileUseCase(),
            getUserPreferencesUseCase()
        ) { profileResult, prefsResult ->
            when {
                profileResult is Result.Error -> ProfileUiState.Error(profileResult.message)
                profileResult is Result.Success && prefsResult is Result.Success ->
                    ProfileUiState.Success(
                        user = profileResult.data,
                        preferences = prefsResult.data,
                        recentOrders = null 
                    )
                else -> ProfileUiState.Loading
            }
        }
        .onEach { _uiState.value = it }
        .catch { e -> _uiState.value = ProfileUiState.Error(e.message ?: "Unknown error") }
        .launchIn(viewModelScope)
    }

    fun onAction(action: ProfileAction) {
        when (action) {
            ProfileAction.RefreshRequested -> loadScreen()
            is ProfileAction.OrderClicked ->
                viewModelScope.launch {
                    _events.emit(ProfileEvent.NavigateTo(ProfileDestination.OrderDetail(action.orderId)))
                }
        }
    }
}
```

### 2.2 Action contract (MVI-lite)

User interactions flow into the ViewModel through a single `onAction(action: ScreenAction)` function. No individual `onXyzClicked()` methods scattered across the ViewModel.

```kotlin
sealed interface ProfileAction {
    data object RefreshRequested : ProfileAction
    data class OrderClicked(val orderId: String) : ProfileAction
    data object SettingsOpened : ProfileAction
}
```

This keeps the ViewModel's public API surface minimal and testable. Composables call `viewModel.onAction(ProfileAction.RefreshRequested)` — they never call business logic directly.

---

## 3. Why Separate StateFlows Are Rejected

Do not create multiple `StateFlow` variables for a single screen. 

```kotlin
// REJECTED
private val _items = MutableStateFlow<List<Item>>(emptyList())
val items: StateFlow<List<Item>> = _items.asStateFlow()

private val _isLoading = MutableStateFlow(true)
val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
```

**Problems:**
1. Two separate `collectAsStateWithLifecycle()` calls in the Composable — two subscription points, two recomposition triggers.
2. Race condition: `_isLoading.value = false` and `_items.value = data` are two separate assignments. A frame can render between them with `isLoading = false` and `items = emptyList()` — showing an empty state flash.
3. No way to represent `Error` state — it evaporates silently.
4. Adding a third piece of state requires a third StateFlow — the problem compounds.

---

## 4. Result Handling Contract

### 4.1 Domain `Result` type — the standard

Use a sealed interface `Result` in `:domain`. Never use Kotlin's stdlib `kotlin.Result` for domain operations — it conflates exceptions with business errors.

```kotlin
// domain/model/Result.kt
sealed interface Result<out T> {
    data class Success<T>(val data: T) : Result<T>
    data class Error(val message: String, val cause: Throwable? = null) : Result<Nothing>
}
```

### 4.2 Consuming Result in ViewModel — no silent drops

Every `Result.Error` must produce a visible state change. This is non-negotiable.

```kotlin
// FORBIDDEN — silent error drop
.onEach { result ->
    if (result is Result.Success) {
        _userProfile.value = result.data  // Error case: nothing happens
    }
}

// CORRECT — every branch handled
.onEach { result ->
    _uiState.update { current ->
        when (result) {
            is Result.Success -> current.copy(data = result.data, error = null)
            is Result.Error -> current.copy(error = result.message)
        }
    }
}
```

---

## 5. Collecting State in Compose

**Always use `collectAsStateWithLifecycle()`** — never `collectAsState()`. The lifecycle-aware variant stops collection when the app is backgrounded, saving CPU and battery.

```kotlin
@Composable
fun ProfileScreen(viewModel: ProfileViewModel = koinViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when (val state = uiState) {
        is ProfileUiState.Loading -> LoadingContent()
        is ProfileUiState.Success -> ProfileContent(state)
        is ProfileUiState.Error -> ErrorContent(state.message, onRetry = { viewModel.onAction(ProfileAction.RefreshRequested) })
    }
}
```

**Smart-cast the `when` branch.** The `val state = uiState` assignment before the `when` block allows Kotlin to smart-cast `state` to the concrete subtype inside each branch — access `state.data` directly without another cast.

---

## 6. ViewModel + UseCase Layer Boundary

### 6.1 The violation: repository in ViewModel

Never inject a `Repository` directly into a ViewModel. This is a layer boundary violation.

The Presentation layer talks to Domain (UseCases) only. Domain talks to Data (Repositories). Presentation never imports a Repository interface.

```kotlin
// CORRECT — ViewModel only sees UseCases
class ProfileViewModel(
    private val observeUserProfileUseCase: ObserveUserProfileUseCase,
    private val getRecentOrdersUseCase: GetRecentOrdersUseCase // wraps the repository call
) : ViewModel()
```

Create the missing UseCase:

```kotlin
// domain/usecase/GetRecentOrdersUseCase.kt
class GetRecentOrdersUseCase(
    private val repository: OrderRepository
) {
    operator fun invoke(): Flow<Result<Order?>> =
        repository.observeOrders().map { result ->
            when (result) {
                is Result.Success -> Result.Success(result.data.firstOrNull())
                is Result.Error -> result
            }
        }
}
```

---

## 7. `combine` for Multi-Source State

When a screen requires data from multiple independent sources, use `combine` — never chain sequential `viewModelScope.launch` calls.

```kotlin
// REJECTED — sequential launches, independent state updates, race conditions
init {
    viewModelScope.launch { loadUser() }
    viewModelScope.launch { loadOrders() }
}

// CORRECT — atomic state update when all sources emit
combine(
    observeUserProfileUseCase(),
    getRecentOrdersUseCase.asFlow() // wrap suspend in flow if needed
) { userResult, orderResult ->
    buildUiState(userResult, orderResult)
}
.catch { e -> emit(ProfileUiState.Error(e.message ?: "Error")) }
.onEach { _uiState.value = it }
.launchIn(viewModelScope)
```

`combine` waits for all flows to emit at least once before producing an output. This prevents partial states.