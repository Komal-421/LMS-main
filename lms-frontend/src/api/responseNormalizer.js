/**
 * Normalizes responses from both the documented { success, message, data } envelope
 * and the actual backend controller payloads (arrays, objects, or named keys).
 */
export function extractPayload(response, preferredKey) {
  const body = response?.data;
  if (body == null) return null;

  if (body.data !== undefined) {
    return body.data;
  }

  if (preferredKey && body[preferredKey] !== undefined) {
    return body[preferredKey];
  }

  if (body.user !== undefined) return body.user;
  if (body.updated_user !== undefined) return body.updated_user;
  if (body.course !== undefined) return body.course;

  return body;
}

export function extractArrayPayload(response, preferredKey) {
  const payload = extractPayload(response, preferredKey);
  if (Array.isArray(payload)) return payload;
  if (preferredKey && Array.isArray(payload?.[preferredKey])) {
    return payload[preferredKey];
  }
  return [];
}

export function extractErrorMessage(error, fallback = 'Something went wrong') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error.isCanceled) return '';
  if (error.message) return error.message;
  return fallback;
}
