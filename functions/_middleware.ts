// Cloudflare Pages Functions middleware
// This runs on every request to your Pages site

export async function onRequest(context: EventContext): Promise<Response> {
  // Continue with normal Pages handling
  // API routes are handled by functions in the /api directory
  return context.next();
}
