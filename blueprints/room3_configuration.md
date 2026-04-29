# Blueprint: Room 3.0 Configuration
> **Stack:** Room 3.0.0-alpha03 (or latest) · `androidx.room3` · KSP · BundledSQLiteDriver · Kotlin Coroutines
> **Enforcement:** ONLY read/apply this if the user explicitly requests Room 3.0, or if the `libs.versions.toml` already contains `androidx.room3` dependencies. If the project uses standard `androidx.room` (Room 2.x), ignore this file entirely.

This blueprint defines the correct implementation architecture for Room 3.0, which introduces massive breaking API changes and full Kotlin Multiplatform (KMP) support.

---

## 0. Critical Breaking Changes From Room 2.x

| What changed | Room 2.x (old) | Room 3.0 (current) |
|---|---|---|
| Maven group | `androidx.room:room-*` | `androidx.room3:room3-*` |
| Class package | `androidx.room.RoomDatabase` | `android.room3.RoomDatabase` |
| DB builder API | `Room.databaseBuilder(ctx, class, name)` | `Room.databaseBuilder<T>(name)` + `setDriver()` |
| Blocking DAOs | Allowed | **Compile error** |
| KAPT | Supported | **Removed** — KSP only |
| Code generation | Java or Kotlin | **Kotlin only** |
| SQLite backend | SupportSQLite | SQLiteDriver (`BundledSQLiteDriver`) |

---

## 1. `libs.versions.toml` — Room 3.0 Entries

```toml
[versions]
room3  = "3.0.0-alpha03" # Or latest version
ksp    = "2.3.21-2.0.1"  # Must match Kotlin version prefix

[plugins]
room3  = { id = "androidx.room3", version.ref = "room3" }
ksp    = { id = "com.google.devtools.ksp", version.ref = "ksp" }

[libraries]
room3-runtime  = { module = "androidx.room3:room3-runtime",  version.ref = "room3" }
room3-compiler = { module = "androidx.room3:room3-compiler", version.ref = "room3" }
# Optional — only if using Paging 3
room3-paging   = { module = "androidx.room3:room3-paging",   version.ref = "room3" }
# Temporary SupportSQLite bridge — migration only, remove when done
room3-sqlite-wrapper = { module = "androidx.room3:room3-sqlite-wrapper", version.ref = "room3" }
```

---

## 2. Module `build.gradle.kts` Setup

### Android-only Project
```kotlin
plugins {
    alias(libs.plugins.android.application) // or android.library
    alias(libs.plugins.ksp)
    alias(libs.plugins.room3)
}

room3 {
    schemaDirectory("$projectDir/schemas")
}

dependencies {
    implementation(libs.room3.runtime)
    ksp(libs.room3.compiler)
    // Optional Paging support
    implementation(libs.room3.paging)
}
```

### KMP Project
```kotlin
plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.android.kmp.library)
    alias(libs.plugins.ksp)
    alias(libs.plugins.room3)
}

room3 {
    schemaDirectory("$projectDir/schemas")
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation(libs.room3.runtime)
            implementation(libs.sqlite.bundled) // androidx.sqlite:sqlite-bundled
        }
    }
}

// KSP — target each platform
dependencies {
    add("kspAndroid",           libs.room3.compiler)
    add("kspIosSimulatorArm64", libs.room3.compiler)
    add("kspIosX64",            libs.room3.compiler)
    add("kspIosArm64",          libs.room3.compiler)
}
```

---

## 3. `@Database` Definition

```kotlin
// Package is now android.room3, not androidx.room
import android.room3.RoomDatabase

@Database(
    entities = [UserEntity::class, ItemEntity::class],
    version = 1
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun itemDao(): ItemDao
}
```

If using Paging, register the converter at the `@Database` level:

```kotlin
import android.room3.RoomDatabase
import androidx.room3.paging.PagingSourceDaoReturnTypeConverter

@Database(
    entities = [UserEntity::class],
    version = 1,
    daoReturnTypeConverters = [PagingSourceDaoReturnTypeConverter::class]  // Required for Paging 3
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
```

---

## 4. `@Dao` Contract

**Rule:** Every function must be `suspend` or return `Flow`. No exceptions. Non-suspend, non-reactive functions are a compile error in Room 3.0.

```kotlin
import android.room3.Dao
import android.room3.Insert
import android.room3.OnConflictStrategy
import android.room3.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {

    // One-shot read — suspend
    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getById(id: String): UserEntity?

    // One-shot write — suspend
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(user: UserEntity)

    // One-shot delete — suspend
    @Query("DELETE FROM users WHERE id = :id")
    suspend fun deleteById(id: String)

    // Reactive stream — Flow (no suspend keyword)
    @Query("SELECT * FROM users ORDER BY name DESC")
    fun observeAll(): Flow<List<UserEntity>>
}
```

---

## 5. Database Builder Execution

### Android Implementation
```kotlin
import android.room3.RoomDatabase
import androidx.sqlite.driver.bundled.BundledSQLiteDriver
import kotlinx.coroutines.Dispatchers

// Example implementation block
val db = Room.databaseBuilder<AppDatabase>(
    name = context.getDatabasePath("app.db").absolutePath
)
.setDriver(BundledSQLiteDriver())
.setQueryCoroutineContext(Dispatchers.IO)
.build()
```

### KMP Implementation (`expect`/`actual`)

```kotlin
// commonMain — expect declaration
expect fun createDatabase(): AppDatabase

// androidMain — actual implementation
import android.room3.RoomDatabase
import androidx.sqlite.driver.bundled.BundledSQLiteDriver
import kotlinx.coroutines.Dispatchers

actual fun createDatabase(): AppDatabase {
    val dbFile = androidContext().getDatabasePath("app.db")
    return Room.databaseBuilder<AppDatabase>(
        name = dbFile.absolutePath
    )
    .setDriver(BundledSQLiteDriver())
    .setQueryCoroutineContext(Dispatchers.IO)
    .build()
}

// iosMain — actual implementation
import android.room3.RoomDatabase
import androidx.sqlite.driver.bundled.BundledSQLiteDriver
import kotlinx.coroutines.Dispatchers
import platform.Foundation.NSFileManager
import platform.Foundation.NSDocumentDirectory
import platform.Foundation.NSUserDomainMask

actual fun createDatabase(): AppDatabase {
    val docDir = NSFileManager.defaultManager.URLForDirectory(
        directory = NSDocumentDirectory,
        inDomain = NSUserDomainMask,
        appropriateForURL = null,
        create = false,
        error = null
    )!!.path!!
    return Room.databaseBuilder<AppDatabase>(
        name = "$docDir/app.db"
    )
    .setDriver(BundledSQLiteDriver())
    .setQueryCoroutineContext(Dispatchers.IO)
    .build()
}
```

---

## 6. Migration From Room 2.x — Checklist

- [ ] Update `libs.versions.toml` — group `androidx.room3`, artifacts `room3-*`
- [ ] Update plugin: `androidx.room` → `androidx.room3`
- [ ] Update Gradle block: `room { }` → `room3 { }`
- [ ] Update all `import androidx.room.*` → `import android.room3.*` in source files
- [ ] Replace `Room.databaseBuilder(ctx, class, name)` with `Room.databaseBuilder<T>(name)` + `setDriver(BundledSQLiteDriver())`
- [ ] Audit all DAOs — convert every blocking function to `suspend` or `Flow`
- [ ] Remove any `kapt(room-compiler)` — replace with `ksp(libs.room3.compiler)`
- [ ] If using Paging: add `PagingSourceDaoReturnTypeConverter` to `@Database`
