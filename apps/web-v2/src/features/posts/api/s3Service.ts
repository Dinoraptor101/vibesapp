/**
 * S3 Upload Service
 *
 * Handles direct uploads to S3 using presigned URLs.
 */

import apiClient from '@/lib/api';
import type { UploadProgress } from '../utils/imageUtils';

interface S3PresignedUrlResponse {
  url: string; // Presigned URL for upload
  key: string; // S3 object key
}

/**
 * Get presigned URL from backend
 */
export async function getPresignedUrl(): Promise<S3PresignedUrlResponse> {
  const response = await apiClient.get<S3PresignedUrlResponse>('/s3/s3Url');
  return response;
}

/**
 * Upload image directly to S3 using presigned URL
 */
export async function uploadToS3(
  presignedUrl: string,
  imageBlob: Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    // Send request
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', 'image/jpeg');
    xhr.send(imageBlob);
  });
}

/**
 * Complete upload flow: get presigned URL, compress image, upload to S3
 */
export async function uploadImage(
  imageBlob: Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  // Step 1: Get presigned URL from backend
  const { url: presignedUrl, key } = await getPresignedUrl();

  // Step 2: Upload to S3
  await uploadToS3(presignedUrl, imageBlob, onProgress);

  // Step 3: Return the S3 key (backend will construct full URL)
  return key;
}
