/** Talks to the admin API (/api/admin). The admin session is an httpOnly cookie. */
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }

  /** Field errors as { field: message }. */
  get fields() {
    return Object.fromEntries((Array.isArray(this.details) ? this.details : []).map((d) => [d.field, d.message]));
  }
}

export async function api(path, { method = 'GET', body, form, signal } = {}) {
  const headers = {};
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`/api/admin${path}`, { method, headers, body: payload, credentials: 'same-origin', signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Could not reach the server. Check your connection.', 0);
  }
  if (res.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new Event('admin:signed-out'));
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error?.message ?? 'Something went wrong.', res.status, data?.error?.details);
  return data?.data;
}

/** Starts a file download (CSV exports, private artwork) with the admin cookie. */
export function download(path) {
  const link = document.createElement('a');
  link.href = `/api/admin${path}`;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Uploads images to the media library; returns the stored media records. */
export async function uploadImages(files, folder = 'products') {
  const form = new FormData();
  form.append('folder', folder);
  for (const file of files) form.append('images', file);
  const data = await api('/media', { method: 'POST', form });
  return data.items;
}
