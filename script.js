// ========================================================
// DEWAN PROFESOR UNIVERSITAS ANDALAS
// SCRIPT.JS FINAL
// ========================================================


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
// DATA BULAN
// ========================================================

const bulan = {

    Januari: 0,
    Februari: 1,
    Maret: 2,
    April: 3,
    Mei: 4,
    Juni: 5,
    Juli: 6,
    Agustus: 7,
    September: 8,
    Oktober: 9,
    November: 10,
    Desember: 11

};


// ========================================================
// MENGUBAH TANGGAL INDONESIA MENJADI DATE
// Contoh: "27 Juni 2026"
// ========================================================

function ubahTanggal(teks) {

    const bagian = teks.split(" ");

    const tanggal = parseInt(bagian[0]);

    const namaBulan = bagian[1];

    const tahun = parseInt(bagian[2]);

    return new Date(
        tahun,
        bulan[namaBulan],
        tanggal
    );

}


// ========================================================
// MENENTUKAN PERIODE TERBARU
// ========================================================

const daftarPeriode = [

    ...new Set(

        professors.map(
            item => item.periode
        )

    )

];


const periodeTerbaru = daftarPeriode.sort(

    (a, b) =>

        ubahTanggal(b) -
        ubahTanggal(a)

)[0];


// ========================================================
// AMBIL PROFESOR PADA PERIODE TERBARU
// ========================================================

let profesorTerbaru = professors.filter(

    item =>

        item.periode === periodeTerbaru

);


// ========================================================
// INFORMASI PERIODE TERBARU
// ========================================================

periodeAktif.textContent =
    periodeTerbaru;


jumlahPeriode.textContent =

    profesorTerbaru.length +
    " Guru Besar Dikukuhkan";


// ========================================================
// STATISTIK
// ========================================================

// Total Guru Besar

totalProfesor.textContent =
    professors.length;


// Total Buku Digital

totalBuku.textContent =

    professors.filter(

        item => item.pdf

    ).length;


// Total Video

totalVideo.textContent =

    professors.filter(

        item => item.youtube

    ).length;


// ========================================================
// TAMPILKAN PERIODE TERBARU SAAT WEBSITE DIBUKA
// ========================================================

tampilkanData(profesorTerbaru);


// ========================================================
// FITUR PENCARIAN GLOBAL
// ========================================================

searchInput.addEventListener(

    "keyup",

    () => {

        const keyword =

            searchInput.value
                .toLowerCase()
                .trim();


        // Jika pencarian kosong
        // kembali ke periode terbaru

        if (keyword === "") {

            tampilkanData(
                profesorTerbaru
            );

            return;

        }


        // Cari seluruh data profesor

        const hasil = professors.filter(

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


            // Aktifkan Beranda

            document
                .getElementById("btnBeranda")
                .classList
                .add("active");


            // Nonaktifkan Arsip

            document
                .getElementById("btnArsip")
                .classList
                .remove("active");


            // Tampilkan periode

            document
                .querySelector(".periode-box")
                .style
                .display = "block";


            // Kosongkan pencarian

            searchInput.value = "";


            // Tampilkan periode terbaru

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


            // Aktifkan Arsip

            document
                .getElementById("btnArsip")
                .classList
                .add("active");


            // Nonaktifkan Beranda

            document
                .getElementById("btnBeranda")
                .classList
                .remove("active");


            // Sembunyikan periode terbaru

            document
                .querySelector(".periode-box")
                .style
                .display = "none";


            // Kosongkan pencarian

            searchInput.value = "";


            // Tampilkan arsip

            tampilkanArsip();

        }

    );


// ========================================================
// TAMPILKAN DATA PROFESOR
// ========================================================

function tampilkanData(data) {


    // Kosongkan daftar

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

                        ${item.fakultas || ""}

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


    // Ambil semua profesor pada periode tersebut

    const dataPeriode = professors.filter(

        item =>

            item.periode === periode

    );


    // Aktifkan menu Arsip

    document
        .getElementById("btnArsip")
        .classList
        .add("active");


    // Nonaktifkan menu Beranda

    document
        .getElementById("btnBeranda")
        .classList
        .remove("active");


    // Sembunyikan periode utama

    document
        .querySelector(".periode-box")
        .style
        .display = "none";


    // Kosongkan pencarian

    searchInput.value = "";


    // ====================================================
    // TAMPILKAN DATA PROFESOR
    // ====================================================

    tampilkanData(dataPeriode);


    // ====================================================
    // TAMBAHKAN INFORMASI PERIODE
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

    `

    +

    list.innerHTML;

}


// ========================================================
// TAMPILKAN ARSIP PENGUKUHAN
// ========================================================

function tampilkanArsip() {


    // ====================================================
    // HEADER ARSIP
    // ====================================================

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
    // KELOMPOKKAN DATA BERDASARKAN TAHUN
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

                (a, b) => b - a

            );


    // ====================================================
    // TAMPILKAN SETIAP TAHUN
    // ====================================================

    tahunUrut.forEach(tahun => {


        // =================================================
        // JUDUL TAHUN
        // =================================================

        list.innerHTML += `

            <div class="tahun-arsip">

                <h2>
                    ${tahun}
                </h2>

            </div>

        `;


        // =================================================
        // AMBIL PERIODE UNIK
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
        // URUTKAN PERIODE TERBARU
        // =================================================

        periodeUnik.sort(

            (a, b) =>

                ubahTanggal(b) -
                ubahTanggal(a)

        );


        // =================================================
        // TAMPILKAN SETIAP PERIODE
        // =================================================

        periodeUnik.forEach(periode => {


            // Hitung jumlah profesor

            const jumlah =

                professors.filter(

                    item =>

                        item.periode ===
                        periode

                ).length;


            // =================================================
            // ITEM ARSIP
            // =================================================

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
// SELESAI
// ========================================================