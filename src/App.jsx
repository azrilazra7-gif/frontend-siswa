import { useEffect, useState } from "react";
import { getSiswa, createSiswa, updateSiswa, deleteSiswa } from "./api";

const FORM_KOSONG = {
  kode_siswa: "",
  nama_siswa: "",
  alamat_siswa: "",
  tgl_siswa: "",
  jurusan_siswa: "",
};

function formatTanggal(str) {
  if (!str) return "-";
  const [y, m, d] = str.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export default function App() {
  const [daftar, setDaftar] = useState([]);
  const [form, setForm] = useState(FORM_KOSONG);
  const [editId, setEditId] = useState(null);
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState(null); // { tipe: 'ok' | 'error', teks }

  async function muatData() {
    try {
      setLoading(true);
      setDaftar(await getSiswa());
    } catch (err) {
      setPesan({ tipe: "error", teks: `Gagal memuat data: ${err.message}` });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm(FORM_KOSONG);
    setEditId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = editId
        ? await updateSiswa(editId, form)
        : await createSiswa(form);
      setPesan({ tipe: "ok", teks: res.message });
      resetForm();
      muatData();
    } catch (err) {
      setPesan({ tipe: "error", teks: err.message });
    }
  }

  function handleEdit(siswa) {
    setEditId(siswa.id);
    setForm({
      kode_siswa: siswa.kode_siswa,
      nama_siswa: siswa.nama_siswa,
      alamat_siswa: siswa.alamat_siswa,
      tgl_siswa: siswa.tgl_siswa.slice(0, 10),
      jurusan_siswa: siswa.jurusan_siswa,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleHapus(siswa) {
    if (!window.confirm(`Hapus data ${siswa.nama_siswa}?`)) return;
    try {
      const res = await deleteSiswa(siswa.id);
      setPesan({ tipe: "ok", teks: res.message });
      if (editId === siswa.id) resetForm();
      muatData();
    } catch (err) {
      setPesan({ tipe: "error", teks: err.message });
    }
  }

  const tampil = daftar.filter((s) =>
    `${s.kode_siswa} ${s.nama_siswa} ${s.jurusan_siswa}`
      .toLowerCase()
      .includes(cari.toLowerCase())
  );

  return (
    <div className="halaman">
      <header className="kepala">
        <h1>Data Siswa</h1>
        <p>{daftar.length} siswa terdaftar</p>
      </header>

      {pesan && (
        <div className={`pesan ${pesan.tipe}`} role="status">
          <span>{pesan.teks}</span>
          <button onClick={() => setPesan(null)} aria-label="Tutup pesan">
            ×
          </button>
        </div>
      )}

      <div className="susunan">
        <form className="panel form" onSubmit={handleSubmit}>
          <h2>{editId ? "Ubah data siswa" : "Tambah siswa"}</h2>

          <label>
            Kode siswa
            <input name="kode_siswa" value={form.kode_siswa} onChange={handleChange} placeholder="S004" required />
          </label>
          <label>
            Nama siswa
            <input name="nama_siswa" value={form.nama_siswa} onChange={handleChange} required />
          </label>
          <label>
            Alamat
            <textarea name="alamat_siswa" rows="3" value={form.alamat_siswa} onChange={handleChange} required />
          </label>
          <label>
            Tanggal lahir
            <input type="date" name="tgl_siswa" value={form.tgl_siswa} onChange={handleChange} required />
          </label>
          <label>
            Jurusan
            <input name="jurusan_siswa" value={form.jurusan_siswa} onChange={handleChange} required />
          </label>

          <div className="aksi">
            <button type="submit" className="utama">
              {editId ? "Simpan perubahan" : "Tambah siswa"}
            </button>
            {editId && (
              <button type="button" className="sekunder" onClick={resetForm}>
                Batal
              </button>
            )}
          </div>
        </form>

        <section className="panel daftar">
          <div className="daftar-atas">
            <h2>Daftar siswa</h2>
            <input
              type="search"
              placeholder="Cari kode, nama, atau jurusan"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              aria-label="Cari siswa"
            />
          </div>

          <div className="tabel-bungkus">
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Alamat</th>
                  <th>Tgl lahir</th>
                  <th>Jurusan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="kosong">Memuat data...</td></tr>
                ) : tampil.length === 0 ? (
                  <tr><td colSpan="6" className="kosong">
                    {cari ? "Tidak ada siswa yang cocok." : "Belum ada siswa. Tambahkan lewat formulir."}
                  </td></tr>
                ) : (
                  tampil.map((s) => (
                    <tr key={s.id}>
                      <td>{s.kode_siswa}</td>
                      <td>{s.nama_siswa}</td>
                      <td>{s.alamat_siswa}</td>
                      <td>{formatTanggal(s.tgl_siswa)}</td>
                      <td>{s.jurusan_siswa}</td>
                      <td className="aksi-baris">
                        <button className="sekunder kecil" onClick={() => handleEdit(s)}>Ubah</button>
                        <button className="bahaya kecil" onClick={() => handleHapus(s)}>Hapus</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
