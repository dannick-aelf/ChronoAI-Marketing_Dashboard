// Cloudflare Pages Function for KV storage operations
// Supports chunking for values larger than 25MB

interface KVRequest {
  operation: 'get' | 'put' | 'delete' | 'list';
  key: string;
  value?: any;
  tab?: string;
}

const MAX_CHUNK_SIZE = 20 * 1024 * 1024; // 20MB per chunk (leave margin for JSON overhead)
const CHUNK_METADATA_KEY = '__chunks__';

// Helper to check if value needs chunking
function needsChunking(value: string): boolean {
  // Use TextEncoder to get accurate UTF-8 byte size
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  return bytes.length > MAX_CHUNK_SIZE;
}

// Split value into chunks (safely handling UTF-8)
function chunkValue(value: string): string[] {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const bytes = encoder.encode(value);
  const chunks: string[] = [];
  
  // Split into byte chunks, ensuring we don't break UTF-8 sequences
  for (let i = 0; i < bytes.length; i += MAX_CHUNK_SIZE) {
    let chunkEnd = Math.min(i + MAX_CHUNK_SIZE, bytes.length);
    
    // If not at the end, find a safe boundary (not in the middle of a UTF-8 sequence)
    if (chunkEnd < bytes.length) {
      // UTF-8 continuation bytes start with 10xxxxxx (0x80-0xBF)
      // Find the last non-continuation byte
      while (chunkEnd > i && (bytes[chunkEnd] & 0xC0) === 0x80) {
        chunkEnd--;
      }
    }
    
    const chunkBytes = bytes.slice(i, chunkEnd);
    chunks.push(decoder.decode(chunkBytes));
  }
  
  return chunks;
}

// Reconstruct value from chunks
async function reconstructValue(env: { STORAGE_KV: KVNamespace }, baseKey: string, numChunks: number): Promise<string | null> {
  const chunks: string[] = [];
  
  for (let i = 0; i < numChunks; i++) {
    const chunkKey = `${baseKey}__chunk_${i}`;
    const chunk = await env.STORAGE_KV.get(chunkKey, 'text');
    if (!chunk) {
      console.error(`Missing chunk ${i} for key ${baseKey}`);
      return null; // Missing chunk
    }
    chunks.push(chunk);
  }
  
  return chunks.join('');
}

export async function onRequest(context: EventContext<{ STORAGE_KV: KVNamespace }>): Promise<Response> {
  const { request, env } = context;
  
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

  try {
    const kvRequest: KVRequest = await request.json();
    const { operation, key, value, tab } = kvRequest;

    // Prefix key with tab if provided
    const fullKey = tab ? `${tab}-${key}` : key;

    switch (operation) {
      case 'get': {
        // Check if this is a chunked value
        const metadata = await env.STORAGE_KV.get(`${fullKey}${CHUNK_METADATA_KEY}`, 'json');
        
        if (metadata && typeof metadata === 'object' && 'chunks' in metadata) {
          console.log(`Loading chunked value ${fullKey} (${metadata.chunks} chunks)`);
          // Reconstruct from chunks
          const reconstructed = await reconstructValue(env, fullKey, metadata.chunks as number);
          if (reconstructed) {
            try {
              const parsed = JSON.parse(reconstructed);
              const sizeInMB = new TextEncoder().encode(reconstructed).length / (1024 * 1024);
              console.log(`Successfully loaded chunked ${fullKey}: ${sizeInMB.toFixed(2)}MB`);
              return new Response(JSON.stringify({ success: true, data: parsed }), {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              });
            } catch (parseError) {
              console.error(`Failed to parse reconstructed value for ${fullKey}:`, parseError);
              // If parsing fails, return as text
              return new Response(JSON.stringify({ success: true, data: reconstructed }), {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              });
            }
          } else {
            console.error(`Failed to reconstruct chunked value for ${fullKey}`);
          }
        }
        
        // Regular (non-chunked) value
        const stored = await env.STORAGE_KV.get(fullKey, 'json');
        if (stored) {
          const sizeInMB = new TextEncoder().encode(JSON.stringify(stored)).length / (1024 * 1024);
          console.log(`Successfully loaded ${fullKey}: ${sizeInMB.toFixed(2)}MB`);
        } else {
          console.log(`No value found for ${fullKey}`);
        }
        return new Response(JSON.stringify({ success: true, data: stored }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      case 'put': {
        const jsonString = JSON.stringify(value);
        const sizeInMB = new TextEncoder().encode(jsonString).length / (1024 * 1024);
        
        console.log(`PUT ${fullKey}: ${sizeInMB.toFixed(2)}MB`);
        
        try {
          // Check if value needs chunking
          if (needsChunking(jsonString)) {
            console.log(`Value too large, chunking ${fullKey}...`);
            
            // Delete old chunks if they exist
            const oldMetadata = await env.STORAGE_KV.get(`${fullKey}${CHUNK_METADATA_KEY}`, 'json');
            if (oldMetadata && typeof oldMetadata === 'object' && 'chunks' in oldMetadata) {
              const numOldChunks = oldMetadata.chunks as number;
              for (let i = 0; i < numOldChunks; i++) {
                await env.STORAGE_KV.delete(`${fullKey}__chunk_${i}`);
              }
            }
            
            // Split into chunks
            const chunks = chunkValue(jsonString);
            console.log(`Split into ${chunks.length} chunks`);
            
            // Store chunks
            for (let i = 0; i < chunks.length; i++) {
              await env.STORAGE_KV.put(`${fullKey}__chunk_${i}`, chunks[i]);
            }
            
            // Store metadata
            await env.STORAGE_KV.put(`${fullKey}${CHUNK_METADATA_KEY}`, JSON.stringify({ chunks: chunks.length }));
            
            // Delete the non-chunked version if it exists
            await env.STORAGE_KV.delete(fullKey);
            
            console.log(`Successfully stored ${chunks.length} chunks for ${fullKey}`);
          } else {
            // Store normally
            // Delete chunked version if it exists
            const oldMetadata = await env.STORAGE_KV.get(`${fullKey}${CHUNK_METADATA_KEY}`, 'json');
            if (oldMetadata && typeof oldMetadata === 'object' && 'chunks' in oldMetadata) {
              const numOldChunks = oldMetadata.chunks as number;
              for (let i = 0; i < numOldChunks; i++) {
                await env.STORAGE_KV.delete(`${fullKey}__chunk_${i}`);
              }
              await env.STORAGE_KV.delete(`${fullKey}${CHUNK_METADATA_KEY}`);
            }
            
            await env.STORAGE_KV.put(fullKey, jsonString);
            console.log(`Successfully stored ${fullKey}`);
          }
          
          return new Response(JSON.stringify({ success: true }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (putError) {
          console.error(`Error storing ${fullKey}:`, putError);
          throw putError;
        }
      }

      case 'delete': {
        // Delete chunked version if it exists
        const metadata = await env.STORAGE_KV.get(`${fullKey}${CHUNK_METADATA_KEY}`, 'json');
        if (metadata && typeof metadata === 'object' && 'chunks' in metadata) {
          const numChunks = metadata.chunks as number;
          for (let i = 0; i < numChunks; i++) {
            await env.STORAGE_KV.delete(`${fullKey}__chunk_${i}`);
          }
          await env.STORAGE_KV.delete(`${fullKey}${CHUNK_METADATA_KEY}`);
        }
        
        // Delete regular version
        await env.STORAGE_KV.delete(fullKey);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      case 'list': {
        const prefix = tab ? `${tab}-` : '';
        const list = await env.STORAGE_KV.list({ prefix });
        return new Response(JSON.stringify({ success: true, data: list }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      default:
        return new Response(JSON.stringify({ success: false, error: 'Invalid operation' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('KV Function Error:', {
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
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
