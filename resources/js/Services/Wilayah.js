export async function getProvinsi() {
    const res = await fetch(
        "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
    );
    return res.json();
}

export async function getKabupaten(provinsiId) {
    const res = await fetch(
        `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinsiId}.json`,
    );
    return res.json();
}

export async function getKecamatan(kabupatenId) {
    const res = await fetch(
        `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${kabupatenId}.json`,
    );
    return res.json();
}

export async function getDesa(kecamatanId) {
    const res = await fetch(
        `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${kecamatanId}.json`,
    );
    return res.json();
}
