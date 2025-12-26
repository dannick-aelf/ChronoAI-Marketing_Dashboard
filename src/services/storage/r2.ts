// Cloudflare R2 storage service for images

export interface R2UploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface R2Error {
  message: string;
  code?: string;
}

const API_URL = '/api/r2';

/**
 * Upload an image file to R2 storage
 * @param file - The image file to upload
 * @returns Promise resolving to the R2 URL of the uploaded image
 * @throws Error if upload fails
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`);
    }

    const result: R2UploadResponse = await response.json();

    if (!result.success || !result.url) {
      throw new Error(result.error || 'Upload failed: No URL returned');
    }

    return result.url;
  } catch (error) {
    console.error('R2 upload error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Failed to connect to R2 service. Please check your internet connection.');
    }
    
    throw error instanceof Error ? error : new Error('Unknown upload error');
  }
}

/**
 * Upload a base64 image to R2 storage
 * @param base64Data - Base64-encoded image data (with or without data URL prefix)
 * @param filename - Optional filename for content type detection
 * @param contentType - Optional MIME type (e.g., 'image/jpeg')
 * @returns Promise resolving to the R2 URL of the uploaded image
 * @throws Error if upload fails
 */
export async function uploadBase64Image(
  base64Data: string,
  filename?: string,
  contentType?: string
): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64Data,
        filename,
        contentType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`);
    }

    const result: R2UploadResponse = await response.json();

    if (!result.success || !result.url) {
      throw new Error(result.error || 'Upload failed: No URL returned');
    }

    return result.url;
  } catch (error) {
    console.error('R2 upload error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Failed to connect to R2 service. Please check your internet connection.');
    }
    
    throw error instanceof Error ? error : new Error('Unknown upload error');
  }
}

/**
 * Extract R2 object key from an R2 URL
 * @param r2Url - The R2 URL (e.g., 'https://pub-xxx.r2.dev/images/uuid.jpg' or 'https://site.pages.dev/api/r2/images/uuid.jpg')
 * @returns The object key (e.g., 'images/uuid.jpg') or null if not a valid R2 URL
 */
export function extractKeyFromUrl(r2Url: string): string | null {
  try {
    // Handle relative URLs (Pages Function URLs)
    if (r2Url.startsWith('/api/r2/')) {
      const key = r2Url.replace(/^\/api\/r2\//, '');
      console.log('Extracted key from relative URL:', key);
      return decodeURIComponent(key) || null;
    }
    
    // Handle absolute URLs
    const url = new URL(r2Url);
    
    // Check if it's a Pages Function URL
    if (url.pathname.startsWith('/api/r2/')) {
      const key = url.pathname.replace(/^\/api\/r2\//, '');
      console.log('Extracted key from Pages Function URL:', key);
      return decodeURIComponent(key) || null;
    }
    
    // Check if it's an R2 public URL (pub-*.r2.dev)
    if (url.hostname.includes('.r2.dev')) {
      // Extract pathname and remove leading slash
      const key = url.pathname.substring(1);
      console.log('Extracted key from R2 public URL:', key);
      return decodeURIComponent(key) || null;
    }
    
    console.log('Could not extract key from URL:', r2Url);
    return null;
  } catch (error) {
    console.error('Error extracting key from URL:', r2Url, error);
    return null;
  }
}

/**
 * Delete an image from R2 storage
 * @param r2Url - The R2 URL of the image to delete
 * @returns Promise resolving when deletion is complete
 * @throws Error if deletion fails
 */
export async function deleteImage(r2Url: string): Promise<void> {
  console.log('deleteImage called with URL:', r2Url);
  try {
    const key = extractKeyFromUrl(r2Url);
    console.log('Extracted key from URL:', key);
    
    if (!key) {
      throw new Error(`Invalid R2 URL: ${r2Url}`);
    }

    // Encode each path segment separately to preserve slashes
    const encodedKey = key.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const deleteUrl = `${API_URL}/${encodedKey}`;
    console.log('DELETE request to:', deleteUrl);

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
    });

    console.log('DELETE response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
      console.error('DELETE error response:', errorData);
      throw new Error(errorData.error || `Delete failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('DELETE result:', result);

    if (!result.success) {
      throw new Error(result.error || 'Delete failed');
    }
  } catch (error) {
    console.error('R2 delete error:', error);
    throw error instanceof Error ? error : new Error('Unknown delete error');
  }
}

/**
 * Check if a URL is an R2 URL
 * @param url - The URL to check
 * @returns true if the URL is an R2 URL, false otherwise
 */
export function isR2Url(url: string): boolean {
  // Check for R2 URL patterns:
  // 1. R2 public URL: https://pub-*.r2.dev/*
  // 2. Pages Function URL: */api/r2/*
  const isR2PublicUrl = url.startsWith('https://pub-') && url.includes('.r2.dev/');
  const isPagesFunctionUrl = url.includes('/api/r2/');
  const result = isR2PublicUrl || isPagesFunctionUrl;
  console.log('isR2Url check:', { url: url.substring(0, 50), isR2PublicUrl, isPagesFunctionUrl, result });
  return result;
}

/**
 * Check if a URL is a base64 data URL
 * @param url - The URL to check
 * @returns true if the URL is a base64 data URL, false otherwise
 */
export function isBase64Url(url: string): boolean {
  return url.startsWith('data:image/');
}

export const r2Service = {
  uploadImage,
  uploadBase64Image,
  deleteImage,
  extractKeyFromUrl,
  isR2Url,
  isBase64Url,
};
