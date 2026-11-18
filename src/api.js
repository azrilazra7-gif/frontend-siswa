const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/siswa";

async function request(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan pada server");
  return data;
}

export const getSiswa = () => request(API_URL);

export const createSiswa = (body) =>
  request(API_URL, { method: "POST", body: JSON.stringify(body) });

export const updateSiswa = (id, body) =>
  request(`${API_URL}/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteSiswa = (id) =>
  request(`${API_URL}/${id}`, { method: "DELETE" });
