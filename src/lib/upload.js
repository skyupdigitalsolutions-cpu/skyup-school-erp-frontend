/**
 * Uploads one or more files to the generic /uploads endpoint using fetch
 * directly (rather than the shared axios instance) because that instance
 * defaults to `Content-Type: application/json`, which would stomp on the
 * multipart boundary fetch/XHR normally sets automatically for FormData.
 *
 * Returns an array of { originalName, storedName, mimeType, size, url }.
 */
export async function uploadFiles(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const tenant = localStorage.getItem('tenantSlug');
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

  const res = await fetch(`${baseURL}/uploads`, {
    method: 'POST',
    credentials: 'include',
    headers: tenant ? { 'X-Tenant-Id': tenant } : {},
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to upload file(s).');
  return data.data;
}