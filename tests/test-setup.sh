#!/usr/bin/env bash
# ============================================================================
# tests/test-setup.sh — Smoke tests for orcha-setup.sh
# ============================================================================
#
# Validates that the setup script generates a correct .env.prod file for
# both email provider paths (SMTP and Resend). Runs non-interactively by
# piping input and verifies output structure and secret generation.
#
# Usage:
#   ./tests/test-setup.sh
#
# Exit code 0 = all tests pass, non-zero = at least one failure.
#
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SETUP_SCRIPT="${REPO_ROOT}/orcha-setup.sh"
ENV_FILE="${REPO_ROOT}/.env.prod"

PASS=0
FAIL=0

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Save and restore any pre-existing .env.prod so tests don't destroy real config
BACKUP_FILE=""
if [[ -f "$ENV_FILE" ]]; then
  BACKUP_FILE=$(mktemp)
  cp "$ENV_FILE" "$BACKUP_FILE"
fi

cleanup() {
  rm -f "$ENV_FILE"
  if [[ -n "$BACKUP_FILE" && -f "$BACKUP_FILE" ]]; then
    mv "$BACKUP_FILE" "$ENV_FILE"
  fi
}
trap cleanup EXIT

assert_contains() {
  local label="$1"
  local pattern="$2"
  local file="$3"
  if grep -q "$pattern" "$file"; then
    echo "  PASS: $label"
    ((PASS++))
  else
    echo "  FAIL: $label — expected pattern '${pattern}' not found in ${file}"
    ((FAIL++))
  fi
}

assert_not_contains() {
  local label="$1"
  local pattern="$2"
  local file="$3"
  if ! grep -q "$pattern" "$file"; then
    echo "  PASS: $label"
    ((PASS++))
  else
    echo "  FAIL: $label — pattern '${pattern}' should NOT be in ${file}"
    ((FAIL++))
  fi
}

# Verify a variable is present and its value is not empty or a placeholder
assert_var_set() {
  local label="$1"
  local varname="$2"
  local file="$3"
  local value
  value=$(grep "^${varname}=" "$file" | head -1 | cut -d= -f2-)
  if [[ -n "$value" && "$value" != "CHANGE_ME" ]]; then
    echo "  PASS: $label"
    ((PASS++))
  else
    echo "  FAIL: $label — ${varname} is empty or placeholder (got: '${value}')"
    ((FAIL++))
  fi
}

# ============================================================================
# Test 1: SMTP path
# ============================================================================

echo "=== Test: SMTP email provider ==="
rm -f "$ENV_FILE"

# Piped input order matches the prompts in orcha-setup.sh:
#   1. Domain
#   2. Let's Encrypt email
#   3. Email choice (1 = SMTP)
#   4. SMTP host
#   5. SMTP port (accept default)
#   6. SMTP user
#   7. SMTP password
printf '%s\n' \
  "test.orcha.dev" \
  "admin@test.orcha.dev" \
  "1" \
  "smtp.mailgun.org" \
  "" \
  "postmaster@test.orcha.dev" \
  "smtp-secret-123" \
| bash "$SETUP_SCRIPT" >/dev/null 2>&1

if [[ ! -f "$ENV_FILE" ]]; then
  echo "  FAIL: .env.prod was not created"
  ((FAIL++))
else
  echo "  PASS: .env.prod created"
  ((PASS++))

  # Domain & TLS
  assert_contains "ORCHA_DOMAIN set" "^ORCHA_DOMAIN=test.orcha.dev$" "$ENV_FILE"
  assert_contains "LETS_ENCRYPT_EMAIL set" "^LETS_ENCRYPT_EMAIL=admin@test.orcha.dev$" "$ENV_FILE"

  # Service ports (defaults)
  assert_contains "backend port default" "^__DOCKER_ORCHA_BACKEND_PORT=4000$" "$ENV_FILE"
  assert_contains "support port default" "^__DOCKER_ORCHA_SUPPORT_PORT=3001$" "$ENV_FILE"
  assert_contains "ai port default" "^__DOCKER_ORCHA_AI_PORT=8000$" "$ENV_FILE"

  # Postgres
  assert_contains "postgres user" "^__DOCKER_POSTGRES_USER=orcha$" "$ENV_FILE"
  assert_contains "postgres db" "^__DOCKER_POSTGRES_DB=orcha$" "$ENV_FILE"
  assert_var_set "postgres password generated" "__DOCKER_POSTGRES_PASSWORD" "$ENV_FILE"

  # Redis (defaults)
  assert_contains "redis hostname" "^__DOCKER_REDIS_HOSTNAME=redis$" "$ENV_FILE"
  assert_contains "redis port" "^__DOCKER_REDIS_PORT=6379$" "$ENV_FILE"

  # Session secret
  assert_var_set "session secret generated" "__DOCKER_ORCHA_SESSION_SECRET" "$ENV_FILE"

  # MinIO
  assert_contains "minio user" "^MINIO_ROOT_USER=orcha$" "$ENV_FILE"
  assert_var_set "minio password generated" "MINIO_ROOT_PASSWORD" "$ENV_FILE"
  assert_contains "upload bucket" "^__DOCKER_UPLOADS_BUCKET=orcha-uploads$" "$ENV_FILE"
  assert_contains "docs bucket" "^__DOCKER_DOCS_BUCKET=orcha-docs$" "$ENV_FILE"

  # SMTP-specific vars present
  assert_contains "SMTP host present" "^__DOCKER_SMTP_HOST=smtp.mailgun.org$" "$ENV_FILE"
  assert_contains "SMTP port default" "^__DOCKER_SMTP_PORT=587$" "$ENV_FILE"
  assert_contains "SMTP user present" "^__DOCKER_SMTP_USER=postmaster@test.orcha.dev$" "$ENV_FILE"
  assert_contains "SMTP pass present" "^__DOCKER_SMTP_PASS=smtp-secret-123$" "$ENV_FILE"

  # Resend vars should NOT be present
  assert_not_contains "no Resend key in SMTP mode" "RESEND_API_KEY" "$ENV_FILE"

  # VAPID keys — either generated or placeholder (both acceptable, depends on npx)
  assert_contains "VAPID public key present" "^__DOCKER_VAPID_PUBLIC_KEY=" "$ENV_FILE"
  assert_contains "VAPID private key present" "^__DOCKER_VAPID_PRIVATE_KEY=" "$ENV_FILE"
fi

echo ""

# ============================================================================
# Test 2: Resend path
# ============================================================================

echo "=== Test: Resend email provider ==="
rm -f "$ENV_FILE"

# Piped input:
#   1. Domain
#   2. Let's Encrypt email
#   3. Email choice (2 = Resend)
#   4. Resend API key
printf '%s\n' \
  "resend.orcha.dev" \
  "ops@resend.orcha.dev" \
  "2" \
  "re_test_abc123xyz" \
| bash "$SETUP_SCRIPT" >/dev/null 2>&1

if [[ ! -f "$ENV_FILE" ]]; then
  echo "  FAIL: .env.prod was not created"
  ((FAIL++))
else
  echo "  PASS: .env.prod created"
  ((PASS++))

  # Domain set correctly for this run
  assert_contains "ORCHA_DOMAIN set" "^ORCHA_DOMAIN=resend.orcha.dev$" "$ENV_FILE"

  # Resend-specific var present
  assert_contains "Resend API key present" "^__DOCKER_RESEND_API_KEY=re_test_abc123xyz$" "$ENV_FILE"

  # SMTP vars should NOT be present
  assert_not_contains "no SMTP host in Resend mode" "__DOCKER_SMTP_HOST" "$ENV_FILE"
  assert_not_contains "no SMTP port in Resend mode" "__DOCKER_SMTP_PORT" "$ENV_FILE"
  assert_not_contains "no SMTP user in Resend mode" "__DOCKER_SMTP_USER" "$ENV_FILE"
  assert_not_contains "no SMTP pass in Resend mode" "__DOCKER_SMTP_PASS" "$ENV_FILE"

  # Secrets still generated
  assert_var_set "session secret generated" "__DOCKER_ORCHA_SESSION_SECRET" "$ENV_FILE"
  assert_var_set "postgres password generated" "__DOCKER_POSTGRES_PASSWORD" "$ENV_FILE"
  assert_var_set "minio password generated" "MINIO_ROOT_PASSWORD" "$ENV_FILE"
fi

echo ""

# ============================================================================
# Test 3: Overwrite protection (decline)
# ============================================================================

echo "=== Test: Overwrite protection ==="

# Leave .env.prod from the previous test in place
echo "dummy" > "$ENV_FILE"

# Answer "N" to overwrite prompt — script should exit without touching the file
output=$(printf '%s\n' "N" | bash "$SETUP_SCRIPT" 2>&1 || true)

content=$(cat "$ENV_FILE")
if [[ "$content" == "dummy" ]]; then
  echo "  PASS: existing .env.prod preserved when declining overwrite"
  ((PASS++))
else
  echo "  FAIL: .env.prod was modified despite declining overwrite"
  ((FAIL++))
fi

echo ""

# ============================================================================
# Summary
# ============================================================================

TOTAL=$((PASS + FAIL))
echo "=== Results: ${PASS}/${TOTAL} passed ==="

if [[ $FAIL -gt 0 ]]; then
  echo "FAILED: ${FAIL} test(s) did not pass."
  exit 1
fi

echo "All tests passed."
exit 0
