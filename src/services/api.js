const BASE_URL = 'http://localhost:8080/sistema-vendedor/backend';

async function request(endpoint, options = {}) {
  try {
    const resp = await fetch(`${BASE_URL}/${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await resp.json();
    return data;
  } catch (error) {
    return { success: false, message: 'Error de conexión con el servidor' };
  }
}

export const api = {
  post: (endpoint, body) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  get: (endpoint) =>
    request(endpoint, { method: 'GET' }),
};
