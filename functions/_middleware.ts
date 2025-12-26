// Cloudflare Pages Functions middleware
// This runs on every request to your Pages site

export async function onRequest(context: EventContext<{ STORAGE_R2?: R2Bucket }>): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/r2/')) {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  // Handle R2 image GET and DELETE requests in middleware since Pages Functions doesn't route sub-paths
  // /api/r2.ts only handles /api/r2 exactly, not /api/r2/images/uuid.jpg
  if (url.pathname.startsWith('/api/r2/') && env.STORAGE_R2) {
    const pathAfterApi = url.pathname.replace(/^\/api\/r2\/?/, '');
    if (pathAfterApi) {
      const objectKey = decodeURIComponent(pathAfterApi);
      
      if (request.method === 'GET') {
        // GET: Retrieve image from R2
        try {
          const object = await env.STORAGE_R2.get(objectKey);
          
          if (!object) {
            return new Response(
              JSON.stringify({ success: false, error: 'Object not found', key: objectKey }),
              {
                status: 404,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders,
                },
              }
            );
          }
          
          const contentType = object.httpMetadata?.contentType || 'image/jpeg';
          const arrayBuffer = await object.arrayBuffer();
          
          return new Response(arrayBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000',
              'Content-Length': arrayBuffer.byteLength.toString(),
              ...corsHeaders,
            },
          });
        } catch (error) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Failed to retrieve object' 
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
      } else if (request.method === 'DELETE') {
        // DELETE: Delete image from R2
        try {
          await env.STORAGE_R2.delete(objectKey);
          
          return new Response(
            JSON.stringify({ success: true }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Failed to delete object' 
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
      }
    }
  }
  
  // Continue with normal Pages handling
  // API routes are handled by functions in the /api directory
  return context.next();
}
