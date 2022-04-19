// same as fetch, but throws FetchError in case of errors
// status >= 400 is an error
// network error / json error are errors

export async function fetchJson(url, params) {
  let response;

  try {
    // TODO: "toString" call needed for correct work of "jest-fetch-mock"
    response = await fetch(url.toString(), params);
  } catch (err) {
    throw new FetchError(response, 'Network error has occurred.');
  }

  let body;

  if (!response.ok) {
    let errorText = response.statusText; // Not Found (for 404)

    try {
      body = await response.json();

      errorText = (body.error && body.error.message)
        || (body.data && body.data.error && body.data.error.message)
        || errorText;
    } catch (error) { /* ignore failed body */ }

    let message = `Error ${response.status}: ${errorText}`;

    throw new FetchError(response, body, message);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new FetchError(response, null, err.message);
  }
}

export async function postJson(url, body) {
  return jsonRequest(url, body, 'POST');
}

export async function patchJson(url, body) {
  return jsonRequest(url, body, 'PATCH');
}

export async function putJson(url, body) {
  return jsonRequest(url, body, 'PUT');
}

async function jsonRequest(url, body, method) {
  try {
    const response = await fetchJson(url,
      {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: body,
      }
    );
  } catch (error) {
    return error;
  }
}

export async function uploadImage(file) {
  const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
  const form = new FormData();
  form.append('image', file);

  try {
    return fetchJson('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: form,
      referrer: ''
    });
  } catch (error) {
    return error;
  }
}

export class FetchError extends Error {
  name = 'FetchError';

  constructor(response, body, message) {
    super(message);
    this.response = response;
    this.body = body;
  }
}

// handle uncaught failed fetch through
window.addEventListener('unhandledrejection', event => {
  if (event.reason instanceof FetchError) {
    alert(event.reason.message);
  }
});

