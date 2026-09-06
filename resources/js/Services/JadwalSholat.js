export async function getJadwalSholat(
    tanggal,
    latitude = null,
    longitude = null,
) {
    const [tahun, bulan, hari] = tanggal.split("-");

    const lat = latitude ?? -7.0333;
    const lng = longitude ?? 110.3167;

    const res = await fetch(
        `https://api.aladhan.com/v1/timings/${hari}-${bulan}-${tahun}?latitude=${lat}&longitude=${lng}&method=20`,
    );
    return res.json();
}
