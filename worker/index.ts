import { visitEntry, type RequestOrigin } from './visit'

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

/**
 * Serves the built site unchanged, and writes one log line per page visit
 * (see visit.ts). Read them in the Cloudflare dashboard under
 * Workers & Pages → personal-site → Logs.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request)
    try {
      const entry = visitEntry(
        request.url,
        {
          method: request.method,
          accept: request.headers.get('accept'),
          referer: request.headers.get('referer'),
        },
        (request as Request & { cf?: RequestOrigin }).cf,
      )
      if (entry) console.log(JSON.stringify(entry))
    } catch {
      // logging must never break the site
    }
    return response
  },
}
