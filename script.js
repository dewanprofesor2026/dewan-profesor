// ========================================================
// DEWAN PROFESOR UNIVERSITAS ANDALAS
// SCRIPT.JS
// DATA OTOMATIS DARI GOOGLE SHEETS
// ========================================================


// ========================================================
// URL GOOGLE APPS SCRIPT
// ========================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbyAFoztVoX6ZJ7ANsDTFLDJ5WcBOT8SneZZ9IgnAqLyu0Kz0ufoJERtdhe5iq0OCYH7qA/exec";


// ========================================================
// ELEMENT HTML
// ========================================================

const list = document.getElementById("listProfesor");
const searchInput = document.getElementById("searchInput");

const periodeAktif = document.getElementById("periodeAktif");
const jumlahPeriode = document.getElementById("jumlahPeriode");

const totalProfesor = document.getElementById("totalProfesor");
const totalBuku = document.getElementById("totalBuku");
const totalVideo = document.getElementById("totalVideo");


// ========================================================
// DATA GLOBAL
// ========================================================

let professors = [];
let profesorTerbaru = [];
let periodeTerbaru = "";


// ========================================================
// NAMA BULAN INDONESIA
// ========================================================

const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
];


// ========================================================
// FORMAT TANGGAL
// Google Sheets → 25 Oktober 2026
// ========================================================

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "";
    }

    const date = new Date(tanggal);

    if (isNaN(date.getTime())) {
        return tanggal;
    }

    return (
        date.getUTCDate() +
        " " +
        namaBulan[date.getUTCMonth()] +
        " " +
        date.getUTCFullYear()
    );

}


// ========================================================
// MENGUBAH TANGGAL MENJADI DATE
// ========================================================

function ubahTanggal(teks) {

    if (!teks) {
        return new Date(0);
    }

    const bagian = teks.split(" ");

    if (bagian.length < 3) {
        return new Date(teks);
    }

    const tanggal = parseInt(bagian[0]);

    const nama = bagian[1];

    const tahun = parseInt(bagian[2]);

    const indexBulan =
        namaBulan.indexOf(nama);

    return new Date(
        tahun,
        indexBulan,
        tanggal
    );

}


// ========================================================
// AMBIL DATA DARI GOOGLE SHEETS
// ========================================================

async function ambilDataDariGoogleSheets() {

    try {

        list.innerHTML = `
            <div class="data-kosong">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <h3>Memuat data...</h3>
                <p>Mohon tunggu sebentar.</p>
            </div>
        `;


        const response = await fetch(
            API_URL + "?action=data"
        );


        if (!response.ok) {
            throw new Error(
                "Gagal menghubungi database."
            );
        }


        const data =
            await response.json();


        // =================================================
        // UBAH DATA GOOGLE SHEETS
        // MENJADI FORMAT YANG DIPAKAI PORTAL
        // =================================================

        professors = data.map(item => ({

            id: item.id,

            periode:
                formatTanggal(item.periode),

            nama:
                item.nama || "",

            fakultas:
                item.fakultas || "",

            foto:
                item.foto || "",

            pdf:
                item.buku || "",

            youtube:
                item.video || ""

        }));


        // =================================================
        // JALANKAN PORTAL
        // =================================================

        mulaiPortal();


    } catch (error) {

        console.error(error);


        list.innerHTML = `
            <div class="data-kosong">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h3>Data tidak dapat dimuat</h3>

                <p>
                    Database Guru Besar sedang tidak dapat
                    diakses.
                </p>

            </div>
        `;

    }

}


// ========================================================
// MEMULAI PORTAL
// ========================================================

function mulaiPortal() {


    if (professors.length === 0) {

        periodeAktif.textContent =
            "Belum ada data";

        jumlahPeriode.textContent =
            "Belum ada Guru Besar";

        totalProfesor.textContent = "0";
        totalBuku.textContent = "0";
        totalVideo.textContent = "0";

        tampilkanData([]);

        return;

    }


    // ====================================================
    // DAFTAR PERIODE
    // ====================================================

    const daftarPeriode = [

        ...new Set(

            professors.map(
                item => item.periode
            )

        )

    ];


    // ====================================================
    // CARI PERIODE TERBARU
    // ====================================================

    daftarPeriode.sort(

        (a, b) =>
            ubahTanggal(b) -
            ubahTanggal(a)

    );


    periodeTerbaru =
        daftarPeriode[0];


    // ====================================================
    // PROFESOR PERIODE TERBARU
    // ====================================================

    profesorTerbaru =
        professors.filter(

            item =>
                item.periode ===
                periodeTerbaru

        );


    // ====================================================
    // INFORMASI PERIODE
    // ====================================================

    periodeAktif.textContent =
        periodeTerbaru;


    jumlahPeriode.textContent =
        profesorTerbaru.length +
        " Guru Besar Dikukuhkan";


    // ====================================================
    // STATISTIK
    // ====================================================

    totalProfesor.textContent =
        professors.length;


    totalBuku.textContent =

        professors.filter(

            item =>
                item.pdf

        ).length;


    totalVideo.textContent =

        professors.filter(

            item =>
                item.youtube

        ).length;


    // ====================================================
    // TAMPILKAN PERIODE TERBARU
    // ====================================================

    tampilkanData(
        profesorTerbaru
    );

}


// ========================================================
// PENCARIAN GLOBAL
// ========================================================

searchInput.addEventListener(
    "keyup",
    () => {

        const keyword =

            searchInput.value
                .toLowerCase()
                .trim();


        // Jika kosong
        if (keyword === "") {

            tampilkanData(
                profesorTerbaru
            );

            return;

        }


        // Cari seluruh data
        const hasil =

            professors.filter(

                item =>

                    item.nama
                        .toLowerCase()
                        .includes(keyword)

            );


        tampilkanData(hasil);

    }
);


// ========================================================
// MENU BERANDA
// ========================================================

document
    .getElementById("btnBeranda")
    .addEventListener(
        "click",
        () => {


            document
                .getElementById("btnBeranda")
                .classList
                .add("active");


            document
                .getElementById("btnArsip")
                .classList
                .remove("active");


            document
                .querySelector(".periode-box")
                .style
                .display = "block";


            searchInput.value = "";


            tampilkanData(
                profesorTerbaru
            );

        }
    );


// ========================================================
// MENU ARSIP
// ========================================================

document
    .getElementById("btnArsip")
    .addEventListener(
        "click",
        () => {


            document
                .getElementById("btnArsip")
                .classList
                .add("active");


            document
                .getElementById("btnBeranda")
                .classList
                .remove("active");


            document
                .querySelector(".periode-box")
                .style
                .display = "none";


            searchInput.value = "";


            tampilkanArsip();

        }
    );


// ========================================================
// TAMPILKAN DATA PROFESOR
// ========================================================

function tampilkanData(data) {


    list.innerHTML = "";


    // ====================================================
    // JIKA DATA TIDAK DITEMUKAN
    // ====================================================

    if (data.length === 0) {


        list.innerHTML = `

            <div class="data-kosong">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h3>
                    Data tidak ditemukan
                </h3>

                <p>
                    Nama Guru Besar yang Anda cari
                    tidak tersedia.
                </p>

            </div>

        `;


        return;

    }


    // ====================================================
    // TAMPILKAN DATA
    // ====================================================

    data.forEach(item => {


        // =================================================
        // TOMBOL BUKU
        // =================================================

        const tombolBuku = item.pdf

            ? `

                <a
                    href="${item.pdf}"
                    class="btn btn-book"
                    target="_blank"
                    rel="noopener noreferrer"
                >

                    <i
                        class="fa-solid fa-book-open"
                    ></i>

                    Baca Orasi Ilmiah

                </a>

              `

            : "";


        // =================================================
        // TOMBOL YOUTUBE
        // =================================================

        const tombolYoutube = item.youtube

            ? `

                <a
                    href="${item.youtube}"
                    class="btn"
                    target="_blank"
                    rel="noopener noreferrer"
                >

                    <i
                        class="fa-brands fa-youtube"
                    ></i>

                    Video Biografi

                </a>

              `

            : "";


        // =================================================
        // FOTO PROFESOR
        // =================================================

        const fotoProfesor = item.foto

            ? `

                <img
                    src="${item.foto}"
                    class="photo"
                    alt="${item.nama}"
                    loading="lazy"
                >

              `

            : `

                <div class="photo-placeholder">

                    <i
                        class="fa-solid fa-user"
                    ></i>

                </div>

              `;


        // =================================================
        // CARD PROFESOR
        // =================================================

        list.innerHTML += `

            <div class="card">


                ${fotoProfesor}


                <div class="info">


                    <h3>
                        ${item.nama}
                    </h3>


                    <p class="fakultas">

                        ${item.fakultas}

                    </p>


                    <p class="periode-profesor">

                        <i
                            class="fa-regular fa-calendar"
                        ></i>

                        Pengukuhan:
                        ${item.periode}

                    </p>


                    <div class="buttons">

                        ${tombolBuku}

                        ${tombolYoutube}

                    </div>


                </div>


            </div>

        `;

    });

}


// ========================================================
// BUKA PERIODE ARSIP
// ========================================================

function bukaPeriode(periode) {


    const dataPeriode =

        professors.filter(

            item =>
                item.periode ===
                periode

        );


    document
        .getElementById("btnArsip")
        .classList
        .add("active");


    document
        .getElementById("btnBeranda")
        .classList
        .remove("active");


    document
        .querySelector(".periode-box")
        .style
        .display = "none";


    searchInput.value = "";


    // ====================================================
    // TAMPILKAN DATA PROFESOR
    // ====================================================

    list.innerHTML = `

        <div class="periode-detail">

            <button
                class="btn-kembali"
                onclick="tampilkanArsip()"
            >

                ← Kembali ke Arsip

            </button>


            <div class="periode-detail-box">


                <div class="periode-icon">

                    📅

                </div>


                <div>

                    <h2>
                        Pengukuhan Guru Besar
                    </h2>


                    <h3>
                        ${periode}
                    </h3>


                    <p>

                        ${dataPeriode.length}

                        Guru Besar Dikukuhkan

                    </p>

                </div>


            </div>


        </div>

    `;


    // Tambahkan card profesor

    const containerData =
        document.createElement("div");


    dataPeriode.forEach(item => {


        const tombolBuku = item.pdf

            ? `

                <a
                    href="${item.pdf}"
                    class="btn btn-book"
                    target="_blank"
                    rel="noopener noreferrer"
                >

                    <i class="fa-solid fa-book-open"></i>

                    Baca Orasi Ilmiah

                </a>

            `
            : "";


        const tombolYoutube = item.youtube

            ? `

                <a
                    href="${item.youtube}"
                    class="btn"
                    target="_blank"
                    rel="noopener noreferrer"
                >

                    <i class="fa-brands fa-youtube"></i>

                    Video Biografi

                </a>

            `
            : "";


        const fotoProfesor = item.foto

            ? `

                <img
                    src="${item.foto}"
                    class="photo"
                    alt="${item.nama}"
                    loading="lazy"
                >

            `

            : `

                <div class="photo-placeholder">

                    <i class="fa-solid fa-user"></i>

                </div>

            `;


        containerData.innerHTML += `

            <div class="card">

                ${fotoProfesor}

                <div class="info">

                    <h3>
                        ${item.nama}
                    </h3>

                    <p class="fakultas">
                        ${item.fakultas}
                    </p>

                    <p class="periode-profesor">

                        <i class="fa-regular fa-calendar"></i>

                        Pengukuhan:
                        ${item.periode}

                    </p>

                    <div class="buttons">

                        ${tombolBuku}

                        ${tombolYoutube}

                    </div>

                </div>

            </div>

        `;

    });


    list.appendChild(containerData);

}


// ========================================================
// TAMPILKAN ARSIP PENGUKUHAN
// ========================================================

function tampilkanArsip() {


    list.innerHTML = `

        <div class="arsip-header">

            <div class="arsip-header-icon">

                <i
                    class="fa-solid fa-folder-open"
                ></i>

            </div>


            <h2>
                Arsip Pengukuhan
            </h2>


            <p>

                Buku Orasi Ilmiah Guru Besar

                Dewan Profesor Universitas Andalas

            </p>

        </div>

    `;


    // ====================================================
    // KELOMPOKKAN BERDASARKAN TAHUN
    // ====================================================

    const kelompokTahun = {};


    professors.forEach(item => {


        const tahun =
            item.periode.split(" ")[2];


        if (!kelompokTahun[tahun]) {

            kelompokTahun[tahun] = [];

        }


        kelompokTahun[tahun].push(item);

    });


    // ====================================================
    // URUTKAN TAHUN TERBARU
    // ====================================================

    const tahunUrut =

        Object.keys(kelompokTahun)

            .sort(

                (a, b) =>
                    b - a

            );


    // ====================================================
    // TAMPILKAN SETIAP TAHUN
    // ====================================================

    tahunUrut.forEach(tahun => {


        list.innerHTML += `

            <div class="tahun-arsip">

                <h2>
                    ${tahun}
                </h2>

            </div>

        `;


        // =================================================
        // PERIODE UNIK
        // =================================================

        const periodeUnik = [

            ...new Set(

                kelompokTahun[tahun]

                    .map(

                        item =>
                            item.periode

                    )

            )

        ];


        // =================================================
        // URUTKAN PERIODE
        // =================================================

        periodeUnik.sort(

            (a, b) =>

                ubahTanggal(b) -
                ubahTanggal(a)

        );


        // =================================================
        // TAMPILKAN PERIODE
        // =================================================

        periodeUnik.forEach(periode => {


            const jumlah =

                professors.filter(

                    item =>

                        item.periode ===
                        periode

                ).length;


            list.innerHTML += `

                <div

                    class="arsip-item"

                    onclick="bukaPeriode('${periode}')"

                >

                    <div>

                        <h3>

                            <i
                                class="fa-regular fa-calendar"
                            ></i>

                            ${periode}

                        </h3>


                        <p>

                            ${jumlah}

                            Guru Besar Dikukuhkan

                        </p>

                    </div>


                    <div class="arsip-arrow">

                        Lihat →

                    </div>


                </div>

            `;

        });

    });

}


// ========================================================
// MULAI
// ========================================================

ambilDataDariGoogleSheets();
