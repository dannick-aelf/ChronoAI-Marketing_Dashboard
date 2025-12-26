// Cloudflare Pages Function for R2 image storage operations

interface R2UploadRequest {
  file?: string; // base64 encoded file data
  filename?: string;
  contentType?: string;
}

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Extract file extension from filename or content type
function getFileExtension(filename?: string, contentType?: string): string {
  if (filename) {
    const match = filename.match(/\.([^.]+)$/);
    if (match) return match[1].toLowerCase();
  }
  
  if (contentType) {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
    };
    return mimeMap[contentType] || 'jpg';
  }
  
  return 'jpg'; // default
}

// Convert base64 data URL to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function onRequest(context: EventContext<{ STORAGE_R2: R2Bucket }>): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Handle different HTTP methods
    // For GET requests, check if there's a path after /api/r2/
    const pathAfterApi = url.pathname.replace(/^\/api\/r2\/?/, '');
    
    if (request.method === 'GET' && pathAfterApi) {
      // Retrieve image from R2
      // Decode the path - url.pathname is already decoded by Cloudflare, but handle any encoding
      const objectKey = decodeURIComponent(pathAfterApi);
      
      console.log('GET request for R2 object:', objectKey, 'pathname:', url.pathname, 'pathAfterApi:', pathAfterApi);
      
      try {
        const object = await env.STORAGE_R2.get(objectKey);

        if (!object) {
          console.log('R2 object not found:', objectKey);
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

        console.log('R2 object found, size:', object.size, 'contentType:', object.httpMetadata?.contentType);

        // Get the content type
        const contentType = object.httpMetadata?.contentType || 'image/jpeg';
        
        // Convert R2 object body to ArrayBuffer for reliable response
        // R2 object.body is a ReadableStream, we need to convert it
        const arrayBuffer = await object.arrayBuffer();

        const headers = new Headers(corsHeaders);
        headers.set('Content-Type', contentType);
        headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        headers.set('Content-Length', arrayBuffer.byteLength.toString());

        return new Response(arrayBuffer, {
          headers,
        });
      } catch (r2Error) {
        console.error('R2 GET error:', r2Error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: r2Error instanceof Error ? r2Error.message : 'Failed to retrieve object' 
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
    
    if (request.method === 'GET' && !pathAfterApi) {
      // GET /api/r2 without path - return error
      return new Response(
        JSON.stringify({ success: false, error: 'Missing object key' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    if (request.method === 'POST' || request.method === 'PUT') {
      // Upload image to R2
      let fileData: ArrayBuffer;
      let contentType = 'image/jpeg';
      let filename: string | undefined;

      // Check if request is multipart/form-data
      const contentTypeHeader = request.headers.get('content-type') || '';
      
      if (contentTypeHeader.includes('multipart/form-data')) {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        
        if (!file) {
          return new Response(
            JSON.stringify({ success: false, error: 'No file provided' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
        
        fileData = await file.arrayBuffer();
        contentType = file.type || 'image/jpeg';
        filename = file.name;
      } else {
        // Assume JSON with base64 data
        const body: R2UploadRequest = await request.json();
        
        if (!body.file) {
          return new Response(
            JSON.stringify({ success: false, error: 'No file data provided' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
        
        fileData = base64ToArrayBuffer(body.file);
        contentType = body.contentType || 'image/jpeg';
        filename = body.filename;
      }

      // Generate unique object key
      const extension = getFileExtension(filename, contentType);
      const objectKey = `images/${generateUUID()}.${extension}`;

      // Upload to R2
      await env.STORAGE_R2.put(objectKey, fileData, {
        httpMetadata: {
          contentType,
        },
      });

      // Return Pages Function URL for the image
      // This uses the same domain as the Pages site, so images are served via the Pages Function
      // Encode each path segment separately to preserve slashes in the path
      const baseUrl = new URL(request.url).origin;
      // Split by /, encode each segment, then rejoin with /
      const encodedKey = objectKey.split('/').map(segment => encodeURIComponent(segment)).join('/');
      const r2Url = `${baseUrl}/api/r2/${encodedKey}`;

      return new Response(
        JSON.stringify({
          success: true,
          url: r2Url,
          key: objectKey,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // DELETE requests can also use the dynamic route, but we'll handle them here for /api/r2 endpoint
    if (request.method === 'DELETE') {
      // Delete image from R2
      // Handle both encoded (%2F) and unencoded (/) paths
      const pathAfterApi = url.pathname.replace(/^\/api\/r2\//, '');
      if (!pathAfterApi) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing object key' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Decode the path - this handles %2F -> /
      const objectKey = decodeURIComponent(pathAfterApi);
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
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('R2 Function Error:', {
      message: errorMessage,
      stack: errorStack,
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        ...(errorStack && { stack: errorStack }),
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
