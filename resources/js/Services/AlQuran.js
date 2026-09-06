const BASE_URL = "https://api.quran.com/api/v4";

// Cache in-memory untuk hindari fetch ulang
const cacheHalaman = new Map();

async function fetchJson(url, signal) {
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`Gagal mengambil data (status ${res.status})`);
    }
    return res.json();
}

/**
 * Ambil satu halaman mushaf dengan data per-kata (termasuk line_number)
 * supaya bisa dirender persis Mushaf Madinah 15 baris/halaman.
 */
export async function getHalamanMushaf(nomorHalaman, signal) {
    if (cacheHalaman.has(nomorHalaman)) {
        return cacheHalaman.get(nomorHalaman);
    }

    const data = await fetchJson(
        `${BASE_URL}/verses/by_page/${nomorHalaman}?words=true&word_fields=text_uthmani,line_number,char_type_name`,
        signal,
    );

    cacheHalaman.set(nomorHalaman, data);
    return data;
}

// List surat
export async function getListSurat(signal) {
    return fetchJson(`${BASE_URL}/chapters?language=id`, signal);
}

// List juz
export async function getListJuz(signal) {
    return fetchJson(`${BASE_URL}/juzs`, signal);
}

// Cari halaman dari surat
export async function getHalamanDariSurat(nomorSurat, signal) {
    return fetchJson(`${BASE_URL}/chapters/${nomorSurat}?language=id`, signal);
}

// Cari halaman dari ayat
export async function getHalamanDariAyat(nomorSurat, nomorAyat, signal) {
    return fetchJson(
        `${BASE_URL}/verses/by_key/${nomorSurat}:${nomorAyat}?language=id`,
        signal,
    );
}
