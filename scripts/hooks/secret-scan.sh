#!/usr/bin/env bash
set -euo pipefail

# Scan staged files for common secret patterns.
# Reads staged content (not working tree) via `git show :<file>`.
# Compatible with macOS bash 3.2+ (no mapfile).

found=0

while IFS= read -r file; do
  [ -z "$file" ] && continue

  # Block .env files from being staged
  case "$file" in
    .env|*/.env|.env.*|*/.env.*)
      echo "  [secret-scan] BLOCKED: .env file staged: $file"
      found=1
      continue
      ;;
  esac

  # Skip if git treats this as a binary file
  if git diff --cached -- "$file" 2>/dev/null | grep -q "^Binary files"; then
    continue
  fi

  # Read staged content
  content=$(git show ":$file" 2>/dev/null || true)
  [ -z "$content" ] && continue

  # Private key block
  if echo "$content" | grep -qE -- "-----BEGIN .* PRIVATE KEY-----"; then
    echo "  [secret-scan] BLOCKED: Private key found in $file"
    found=1
  fi

  # AWS access key ID
  if echo "$content" | grep -qE -- "AKIA[0-9A-Z]{16}"; then
    echo "  [secret-scan] BLOCKED: AWS access key found in $file"
    found=1
  fi

  # JWT token (three base64url segments, min 20 chars each to reduce false positives)
  if echo "$content" | grep -qE -- "ey[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}"; then
    echo "  [secret-scan] BLOCKED: JWT token found in $file"
    found=1
  fi

  # Generic hardcoded secrets: key = "value" or key = 'value' (8+ char values)
  if echo "$content" | grep -qiE -- "(password|secret|api_key|apikey|token|private_key)\s*[=:]\s*[\"'][^\"']{8,}[\"']"; then
    echo "  [secret-scan] BLOCKED: Hardcoded secret assignment found in $file"
    found=1
  fi
done < <(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)

if [ "$found" -eq 1 ]; then
  echo ""
  echo "  Remove secrets before committing. Use environment variables or a secrets manager."
  exit 1
fi

exit 0
