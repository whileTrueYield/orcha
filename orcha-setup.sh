#!/usr/bin/env bash
# orcha-setup.sh — Interactive production configuration generator
#
# Generates .env.prod for a self-hosted Orcha deployment. Auto-generates
# cryptographic secrets; prompts only for infrastructure-specific values.
# The generated file is consumed by docker-compose.prod.yaml via `make prod`.
#
# Usage:  ./orcha-setup.sh                      (interactive)
#         printf 'val\nval\n...' | ./orcha-setup.sh  (piped / scripted)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env.prod"

# --- Colors (only when terminal supports them) ---
if [[ -t 1 ]] && command -v tput &>/dev/null && [[ $(tput colors 2>/dev/null || echo 0) -ge 8 ]]; then
  RED=$(tput setaf 1) GREEN=$(tput setaf 2) YELLOW=$(tput setaf 3)
  BOLD=$(tput bold) RESET=$(tput sgr0)
else
  RED="" GREEN="" YELLOW="" BOLD="" RESET=""
fi

die()  { echo "${RED}ERROR:${RESET} $1" >&2; exit 1; }
warn() { echo "${YELLOW}WARNING:${RESET} $1"; }
info() { echo "${GREEN}==>${RESET} $1"; }

# Prompt with optional default. Prints to stderr so $(ask ...) only captures the answer.
ask() {
  local default="${2:-}"
  [[ -n "$default" ]] && printf "%s [%s]: " "$1" "$default" >&2 || printf "%s: " "$1" >&2
  read -r answer; echo "${answer:-$default}"
}

# Like ask() but hides input in interactive terminals.
ask_secret() {
  local default="${2:-}"
  [[ -n "$default" ]] && printf "%s [%s]: " "$1" "$default" >&2 || printf "%s: " "$1" >&2
  if [[ -t 0 ]]; then read -rs answer; echo "" >&2; else read -r answer; fi
  echo "${answer:-$default}"
}

# Remove partial .env.prod on interrupt so we don't leave a half-baked config.
CLEANUP_NEEDED=false
cleanup() {
  if [[ "$CLEANUP_NEEDED" == true && -f "$ENV_FILE" ]]; then
    rm -f "$ENV_FILE"
    echo ""; warn "Setup interrupted. Partial ${ENV_FILE} removed."
  fi
  exit 130
}
trap cleanup INT TERM

# === 1. Prerequisites ========================================================

info "Checking prerequisites..."

command -v docker &>/dev/null \
  || die "Docker is not installed. Install: https://docs.docker.com/engine/install/"
docker compose version &>/dev/null \
  || die "'docker compose' plugin not found. Install: https://docs.docker.com/compose/install/"
command -v openssl &>/dev/null \
  || die "openssl not found. Install via your package manager (apt/brew/yum)."

info "Docker $(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1), Compose $(docker compose version --short) — OK"

# === 2. Existing file guard ===================================================

if [[ -f "$ENV_FILE" ]]; then
  warn ".env.prod already exists at ${ENV_FILE}"
  overwrite=$(ask "Overwrite it? (y/N)" "N")
  [[ "$overwrite" =~ ^[Yy]$ ]] || { echo "Keeping existing .env.prod. Nothing to do."; exit 0; }
fi

echo ""
echo "${BOLD}Orcha production setup${RESET}"
echo "This will generate .env.prod with your deployment settings."
echo ""

# === 3. User input ============================================================

echo "${BOLD}Domain & TLS${RESET}"
echo "Orcha needs a domain with a DNS A record pointing to this server."
echo "Traefik will auto-obtain a Let's Encrypt TLS certificate for it."
echo ""
DOMAIN=$(ask "Domain name (e.g. orcha.example.com)")
[[ -n "$DOMAIN" ]] || die "Domain name is required."
LE_EMAIL=$(ask "Let's Encrypt email (certificate expiry notifications)")
[[ -n "$LE_EMAIL" ]] || die "Let's Encrypt email is required."
echo ""

echo "${BOLD}Email provider${RESET}"
echo "Required for invitations, password resets, and notifications."
echo "  1) SMTP   — any SMTP server (Mailgun, SES, self-hosted, etc.)"
echo "  2) Resend — https://resend.com (just needs an API key)"
echo ""
EMAIL_CHOICE=$(ask "Choose email provider (1 or 2)" "1")
SMTP_HOST="" SMTP_PORT="" SMTP_USER="" SMTP_PASS="" RESEND_KEY=""

case "$EMAIL_CHOICE" in
  1) echo ""
     SMTP_HOST=$(ask "SMTP host (e.g. smtp.mailgun.org)")
     [[ -n "$SMTP_HOST" ]] || die "SMTP host is required."
     SMTP_PORT=$(ask "SMTP port" "587")
     SMTP_USER=$(ask "SMTP username")
     [[ -n "$SMTP_USER" ]] || die "SMTP username is required."
     SMTP_PASS=$(ask_secret "SMTP password")
     [[ -n "$SMTP_PASS" ]] || die "SMTP password is required." ;;
  2) echo ""
     RESEND_KEY=$(ask_secret "Resend API key (starts with re_)")
     [[ -n "$RESEND_KEY" ]] || die "Resend API key is required." ;;
  *) die "Invalid email provider choice: expected 1 or 2, got '${EMAIL_CHOICE}'." ;;
esac
echo ""

# === 4. Auto-generate secrets =================================================

info "Generating secrets..."
SESSION_SECRET=$(openssl rand -base64 32)
PG_PASS=$(openssl rand -base64 24)
MINIO_PASS=$(openssl rand -base64 24)

# VAPID keys need npx + web-push. Best-effort; leave placeholders if unavailable.
VAPID_PUB="CHANGE_ME" VAPID_PRIV="CHANGE_ME" VAPID_WARN=""
if command -v npx &>/dev/null; then
  info "Generating VAPID push-notification keys (npx web-push)..."
  if vj=$(npx --yes web-push generate-vapid-keys --json 2>/dev/null); then
    VAPID_PUB=$(echo "$vj" | grep -o '"publicKey":"[^"]*"' | cut -d'"' -f4)
    VAPID_PRIV=$(echo "$vj" | grep -o '"privateKey":"[^"]*"' | cut -d'"' -f4)
    [[ -n "$VAPID_PUB" && -n "$VAPID_PRIV" ]] || { VAPID_PUB="CHANGE_ME"; VAPID_PRIV="CHANGE_ME"; VAPID_WARN=1; }
  else VAPID_WARN=1; fi
else VAPID_WARN=1; fi

if [[ -n "$VAPID_WARN" ]]; then
  warn "Could not auto-generate VAPID keys (npx not found or web-push failed)."
  echo "  Generate manually:  npx web-push generate-vapid-keys"
  echo "  Then update the CHANGE_ME placeholders in .env.prod."
fi

# === 5. Write .env.prod =======================================================

info "Writing ${ENV_FILE}..."
CLEANUP_NEEDED=true

# Only include the chosen email provider's vars
if [[ "$EMAIL_CHOICE" == "1" ]]; then
  EMAIL_BLOCK="# SMTP
__DOCKER_SMTP_HOST=${SMTP_HOST}
__DOCKER_SMTP_PORT=${SMTP_PORT}
__DOCKER_SMTP_USER=${SMTP_USER}
__DOCKER_SMTP_PASS=${SMTP_PASS}"
else
  EMAIL_BLOCK="# Resend (https://resend.com)
__DOCKER_RESEND_API_KEY=${RESEND_KEY}"
fi

cat > "$ENV_FILE" <<ENVFILE
# ============================================================================
# Orcha — production environment configuration
# Generated by orcha-setup.sh on $(date -u +"%Y-%m-%d %H:%M:%S UTC")
#
# docker-compose.prod.yaml reads __DOCKER_ prefixed vars from this file
# and maps them into each service's runtime environment.
# ============================================================================

# --- Domain & TLS ---------------------------------------------------------
ORCHA_DOMAIN=${DOMAIN}
LETS_ENCRYPT_EMAIL=${LE_EMAIL}

# --- Service ports (internal, not host-exposed — Traefik handles ingress) --
__DOCKER_ORCHA_BACKEND_PORT=4000
__DOCKER_ORCHA_WS_BACKEND_PORT=38268
__DOCKER_ORCHA_SUPPORT_PORT=3001
__DOCKER_ORCHA_AI_PORT=8000

# --- Postgres -------------------------------------------------------------
__DOCKER_POSTGRES_USER=orcha
__DOCKER_POSTGRES_DB=orcha
__DOCKER_POSTGRES_PASSWORD=${PG_PASS}

# --- Redis ----------------------------------------------------------------
__DOCKER_REDIS_HOSTNAME=redis
__DOCKER_REDIS_PORT=6379

# --- Session secret -------------------------------------------------------
__DOCKER_ORCHA_SESSION_SECRET=${SESSION_SECRET}

# --- VAPID push notification keys ----------------------------------------
__DOCKER_VAPID_PUBLIC_KEY=${VAPID_PUB}
__DOCKER_VAPID_PRIVATE_KEY=${VAPID_PRIV}

# --- MinIO (S3-compatible object storage) ---------------------------------
MINIO_ROOT_USER=orcha
MINIO_ROOT_PASSWORD=${MINIO_PASS}
__DOCKER_UPLOAD_S3_BUCKET=orcha-uploads
__DOCKER_DOCUMENTATION_S3_BUCKET=orcha-docs
# CloudFront distribution ID — leave empty when using MinIO (no CDN).
__DOCKER_DOCUMENTATION_DISTRIBUTION_ID=

# --- Email provider -------------------------------------------------------
${EMAIL_BLOCK}
ENVFILE

CLEANUP_NEEDED=false

# === 6. Summary & next steps ==================================================

echo ""
echo "${GREEN}${BOLD}Setup complete!${RESET}"
echo ""
echo "${BOLD}Configuration summary:${RESET}"
echo "  Domain:         ${DOMAIN}"
echo "  TLS email:      ${LE_EMAIL}"
[[ "$EMAIL_CHOICE" == "1" ]] \
  && echo "  Email provider: SMTP (${SMTP_HOST}:${SMTP_PORT})" \
  || echo "  Email provider: Resend"
echo "  Postgres user:  orcha"
echo "  MinIO user:     orcha"
[[ -n "$VAPID_WARN" ]] \
  && echo "  VAPID keys:     ${YELLOW}NOT SET — generate manually${RESET}" \
  || echo "  VAPID keys:     ${GREEN}generated${RESET}"
echo ""
echo "${BOLD}Next steps:${RESET}"
echo "  1. Make sure your DNS A record for ${BOLD}${DOMAIN}${RESET} points to this server"
if [[ -n "$VAPID_WARN" ]]; then
  echo "  2. Generate VAPID keys and update .env.prod:"
  echo "       npx web-push generate-vapid-keys"
  echo "  3. Run ${BOLD}make prod${RESET} to start Orcha"
else
  echo "  2. Run ${BOLD}make prod${RESET} to start Orcha"
fi
