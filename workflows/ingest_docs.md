# Runbook: Android Engineering Ingestion Protocol (Wiki Edition)

**Trigger:** You will be asked to "ingest" a specific file located in the `/inbox/` directory.

**Objective:** Dissect the raw documentation, extract strict engineering rules or architectural blueprints, and map them into the existing vault structure. 

## Execution Steps:

### Step 1 — Read the Target
Read the specified file in `/inbox/`. Identify:
- New library dependencies (groupId, artifactId)
- API deprecations or removals
- Recommended architectural patterns

### Step 2 — Update Constraints
Based on the document's content:
- **Build Rules:** If the document specifies new dependencies or Gradle plugins, update `/rules/build_constraints.md`.
- **UI Rules:** If the document specifies Compose performance tips or Material guidelines, update `/rules/ui_standards.md`.
- **Anti-Patterns:** If the document explicitly bans a practice, append it to `/anti_patterns.md`.

### Step 3 — Generate a Blueprint
If the document outlines a complex implementation (e.g., a new Navigation setup or DI wiring), generate a new markdown file in the `/blueprints/` directory named appropriately.
* The blueprint MUST provide the exact skeleton code needed to implement the feature.

### Step 4 — Link the Knowledge
Ensure any new blueprint generated in Step 3 is cross-referenced in the `AGENTS.md` router so future agents know to read it when asked about that feature.

### Step 5 — Cleanup
Once extraction is complete and verified, move the raw file from `/inbox/` to `/archive/`.