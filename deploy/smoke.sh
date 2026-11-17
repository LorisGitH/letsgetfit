#!/usr/bin/env bash
#
# HTTP smoke check of the served app: what a browser sees, not how it is served.
# Usage: deploy/smoke.sh <base url>   e.g. http://localhost:8080 or https://letsgetfit.lallard.com
# CI runs it against the built image before pushing it; run it against the live site after a
# deploy. Exits 1 if any check fails.

set -uo pipefail

base=${1:?usage: smoke.sh <base url>}
base=${base%/}
fail=0

pass() { echo "ok:   $1"; }
bad() {
  echo "FAIL: $1" >&2
  fail=1
}

body_file=$(mktemp)
trap 'rm -f "$body_file"' EXIT

# fetch <path>: sets $status, $headers (lower-cased, CR stripped) and the body in $body_file.
fetch() {
  headers=$(curl -s -m 15 -D - -o "$body_file" -w 'status:%{http_code}\n' "$base$1" | tr -d '\r' | tr '[:upper:]' '[:lower:]')
  status=$(sed -n 's/^status://p' <<<"$headers")
}
header() { sed -n "s/^$1:[[:space:]]*//p" <<<"$headers" | head -1; }
revalidates() { [[ "$(header cache-control)" =~ (no-cache|no-store|max-age=0) ]]; }
max_age() { header cache-control | sed -n 's/.*max-age=\([0-9]*\).*/\1/p'; }
immutable() { [[ "$(header cache-control)" == *immutable* && "$(max_age)" -ge 31536000 ]]; }
describe() { echo "status ${status:-none}, content-type '$(header content-type)', cache-control '$(header cache-control)'"; }

# check_file <path> <content-type substring> <cache rule: revalidates|immutable|long>
check_file() {
  local path=$1 type=$2 cache=$3 cache_ok=false
  fetch "$path"
  case $cache in
    revalidates) revalidates && cache_ok=true ;;
    immutable) immutable && cache_ok=true ;;
    long) [[ "$(max_age)" -ge 86400 ]] && cache_ok=true ;;
  esac
  if [[ "$status" == 200 && "$(header content-type)" == *"$type"* && $cache_ok == true ]]; then
    pass "$path returns 200 as $type ($cache)"
  else
    bad "$path: $(describe), expected 200 as $type ($cache)"
  fi
}

# The page itself.
fetch /
if [[ "$status" == 200 ]] && grep -q '<title>letsgetfit</title>' "$body_file"; then
  pass "/ returns 200 with the app's HTML"
else
  bad "/ did not return the app's HTML (status ${status:-none})"
fi
if revalidates; then pass "/ revalidates"; else bad "/ is cacheable without revalidation ($(describe))"; fi
page=$(cat "$body_file")

csp=$(header content-security-policy)
directive() { tr ';' '\n' <<<"$csp" | sed -n "s/^[[:space:]]*$1[[:space:]]*//p"; }
script_src=$(directive script-src)
if [[ -n "$script_src" && "$script_src" != *unsafe-inline* && "$script_src" != *unsafe-eval* ]]; then
  pass "the page's Content-Security-Policy allows no inline or eval'd script"
else
  bad "missing Content-Security-Policy, or its script-src allows inline/eval ('$csp')"
fi
if [[ "$(directive frame-ancestors)" == "'none'" ]]; then
  pass "the page cannot be framed"
else
  bad "frame-ancestors is not 'none' ('$csp')"
fi

check_file /index.html text/html revalidates

# Hashed build output referenced by the page.
script=$(grep -o 'src="/assets/[^"]*\.js"' <<<"$page" | head -1 | sed 's/^src="//; s/"$//')
style=$(grep -o 'href="/assets/[^"]*\.css"' <<<"$page" | head -1 | sed 's/^href="//; s/"$//')
if [[ -n "$script" ]]; then check_file "$script" javascript immutable; else bad "the page loads no /assets/ script"; fi
if [[ -n "$style" ]]; then check_file "$style" text/css immutable; else bad "the page loads no /assets/ stylesheet"; fi

# The Catalogue: its data chunk, which the entry script loads on demand, and one image it lists.
entry=$(curl -s -m 15 "$base$script")
# The entry script imports it relative to itself, e.g. import(`./exercises-<hash>.js`).
catalogue_chunk=$(grep -o 'exercises-[A-Za-z0-9_-]*\.js' <<<"$entry" | head -1)
if [[ -n "$catalogue_chunk" ]]; then
  check_file "/assets/$catalogue_chunk" javascript immutable
  image=$(grep -o '[a-z0-9-]*-[0-9]-[0-9a-f]\{10\}\.webp' "$body_file" | head -1)
  if [[ -n "$image" ]]; then
    check_file "/catalogue/images/$image" image/webp immutable
  else
    bad "the Catalogue chunk lists no image"
  fi
else
  bad "the entry script does not load the Catalogue chunk"
fi

# Offline support: registration script, service worker and the Workbox runtime it imports.
if grep -q 'src="/registerSW.js"' <<<"$page"; then
  pass "the page registers the service worker"
else
  bad "the page does not load /registerSW.js"
fi
check_file /registerSW.js javascript revalidates
check_file /sw.js javascript revalidates
# sw.js names the runtime without its extension and appends ".js" when importing it.
workbox=$(grep -o 'workbox-[A-Za-z0-9_-]*' "$body_file" | head -1)
if [[ -n "$workbox" ]]; then check_file "/$workbox.js" javascript immutable; else bad "/sw.js imports no workbox runtime"; fi

# Installability: the manifest and every icon it lists, plus the page's own icons.
check_file /manifest.webmanifest application/manifest+json revalidates
icons=$(grep -o '"src":"[^"]*"' "$body_file" | sed 's/^"src":"//; s/"$//')
[[ -n "$icons" ]] || bad "the manifest lists no icons"
for icon in $icons; do
  check_file "/$icon" image/png long
done
check_file /apple-touch-icon-180x180.png image/png long
check_file /favicon.svg image/svg+xml long

# Nothing else is served.
for path in /no-such-page /assets/no-such-file.js /catalogue/images/no-such-image.webp /50x.html; do
  fetch "$path"
  if [[ "$status" == 404 ]]; then pass "$path returns 404"; else bad "$path returned ${status:-none}, not 404"; fi
done

exit "$fail"
