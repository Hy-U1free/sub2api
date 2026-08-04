# Fork Update Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Sub2API's in-app update button follow a configurable GitHub fork release source while preserving the upstream default.

**Architecture:** The backend owns update-source selection through `UPDATE_GITHUB_REPOSITORY`, defaults to `Wei-Shaw/sub2api`, and includes the selected repository in version responses. The frontend consumes that repository value for display-adjacent update helpers, especially rollback commands, so RainYun production can use fork releases without editing generated UI after deploy.

**Tech Stack:** Go backend service tests, Vue/Pinia TypeScript frontend, GitHub Actions release/sync workflows.

---

### Task 1: Backend Update Repository Configuration

**Files:**
- Modify: `backend/internal/service/update_service.go`
- Modify: `backend/internal/service/update_service_test.go`

- [x] **Step 1: Write failing tests**

Add tests proving `UPDATE_GITHUB_REPOSITORY=Hy-U1free/sub2api` is used for latest release checks and rollback release checks, and invalid values fall back to `Wei-Shaw/sub2api`.

- [ ] **Step 2: Run backend unit tests to verify failure**

Run: `go test -tags=unit ./internal/service -run 'TestUpdateService.*Repository' -count=1`
Expected before implementation: tests fail because the service still passes `Wei-Shaw/sub2api`.

- [ ] **Step 3: Implement minimal backend support**

Add an `updateRepository` field to `UpdateService`, resolve it from `UPDATE_GITHUB_REPOSITORY`, and use it in `FetchLatestRelease` and `FetchRecentReleases`. Include `update_repository` in `UpdateInfo`.

- [ ] **Step 4: Run backend tests**

Run: `go test -tags=unit ./internal/service -run 'TestUpdateService.*Repository|TestUpdateServicePerformUpdateNoUpdateReturnsSentinel|TestUpdateServiceListRollbackVersions' -count=1`
Expected: pass.

### Task 2: Frontend Repository-Aware Commands

**Files:**
- Modify: `frontend/src/api/admin/system.ts`
- Modify: `frontend/src/stores/app.ts`
- Modify: `frontend/src/components/common/VersionBadge.vue`

- [ ] **Step 1: Add frontend type/store fields**

Add `update_repository` to `VersionInfo`, persist it in the app store, and return it from cached version data.

- [ ] **Step 2: Update command generation**

Replace hardcoded `Wei-Shaw/sub2api` and `weishaw/sub2api` in `VersionBadge.vue` with computed values based on `appStore.updateRepository`.

- [ ] **Step 3: Run frontend typecheck or targeted tests**

Run: `pnpm run typecheck`
Expected: pass.

### Task 3: Fork Upstream Sync Workflow

**Files:**
- Create: `.github/workflows/sync-upstream.yml`

- [ ] **Step 1: Add manual/scheduled sync workflow**

Create a workflow that fetches `Wei-Shaw/sub2api`, merges `upstream/main` into fork `main`, and pushes the result when there is no conflict.

- [ ] **Step 2: Keep release workflow unchanged**

The existing release workflow already publishes releases and GHCR images under the fork repository owner/name.

### Task 4: Publish Changes

**Files:**
- All modified files from Tasks 1-3

- [ ] **Step 1: Verify diff**

Inspect the changed files and confirm the scope is only update-source plumbing and sync workflow.

- [ ] **Step 2: Push to `Hy-U1free/sub2api`**

Use GitHub web/API/git credentials to commit the changes to fork `main`.

- [ ] **Step 3: Configure RainYun later**

Set `UPDATE_GITHUB_REPOSITORY=Hy-U1free/sub2api` for the official RainYun Sub2API service when it is deployed. Do not modify RainYun `new-api`.
