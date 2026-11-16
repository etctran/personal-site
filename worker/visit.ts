/** What Cloudflare tells the Worker about where a request came from (the parts this site reads). */
export interface RequestOrigin {
  asOrganization?: string
  asn?: number
  country?: string
}

export interface Visit {
  event: 'visit'
  path: string
  org: string | null
  asn: number | null
  country: string | null
  referrer: string | null
}

/**
 * The log line for one page visit: which network it came from (e.g. "Google
 * LLC"), the page, the referrer and the country. Company-level only: no IP
 * address, city or query string is ever recorded. Returns null for anything
 * that is not a page load (scripts, fonts, images, HEAD requests).
 */
export function visitEntry(
  url: string,
  req: { accept?: string | null; method: string; referer?: string | null },
  cf: RequestOrigin | undefined,
): Visit | null {
  if (req.method !== 'GET' || !(req.accept ?? '').includes('text/html')) return null
  return {
    event: 'visit',
    path: new URL(url).pathname,
    org: cf?.asOrganization ?? null,
    asn: cf?.asn ?? null,
    country: cf?.country ?? null,
    referrer: req.referer ?? null,
  }
}

/** One readable line per visit, which is what the Cloudflare log list shows, e.g. "Visit /google · Google LLC (AS15169) · US · from: direct". */
export function visitMessage(v: Visit): string {
  const network = v.org ? `${v.org}${v.asn ? ` (AS${v.asn})` : ''}` : 'unknown network'
  return `Visit ${v.path} · ${network} · ${v.country ?? 'unknown country'} · from: ${v.referrer ?? 'direct'}`
}
