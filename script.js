// ========================================================
// DEWAN PROFESOR UNIVERSITAS ANDALAS
// SCRIPT.JS
// DATABASE GOOGLE SHEETS
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

const searchInput =
    document.getElementById("searchInput");

const periodeAktif =
    document.getElementById("periodeAktif");

const jumlahPeriode =
    document.getElementById("jumlahPeriode");

const totalProfesor =
    document.getElementById("totalProfesor");

const totalBuku =
    document.getElementById("totalBuku");

const totalVideo =
    document.getElementById("totalVideo");


// ========================================================
// DATA GOOGLE SHEETS
// ========================================================
// SENGAJA menggunakan nama "dataProfesor"
// agar tidak bentrok dengan data.js
// ========================================================

let dataProfesor = [];

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
        date.getDate() +
        " " +
        namaBulan[date.getMonth()] +
        " " +
        date.getFullYear()
    );

}


// ========================================================
// KONVERSI TANGGAL INDONESIA KE DATE
// ========================================================

function ubahTanggal(teks) {

    if (!teks) {
        return new Date(0);
    }

    // Jika format sudah ISO
    if (
        teks.includes("T") ||
        teks.includes("-")
    ) {

        const date = new Date(teks);

        if (!isNaN(date.getTime())) {
            return date;
        }

    }


    // Format:
    // 25 Oktober 2026

    const bagian =
        teks.trim().split(" ");


    if (bagian.length < 3) {
        return new Date(0);
    }


    const tanggal =
        parseInt(bagian[0]);


    const bulan =
        namaBulan.indexOf(bagian[1]);


    const tahun =
        parseInt(bagian[2]);


    if (
        isNaN(tanggal) ||
        bulan < 0 ||
        isNaN(tahun)
    ) {
        return new Date(0);
    }


    return new Date(
        tahun,
        bulan,
        tanggal
    );

}


// ========================================================
// AMBIL DATA DARI GOOGLE SHEETS
// MENGGUNAKAN JSONP
// ========================================================

function ambilDataDariGoogleSheets() {


    // Tampilkan loading

    if (list) {

        list.innerHTML = `

            <div class="data-kosong">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <h3>
                    Memuat data...
                </h3>

                <p>
                    Mohon tunggu sebentar.
                </p>

            </div>

        `;

    }


    // Nama callback unik

    const callbackName =
        "googleSheetsCallback_" +
        Date.now();


    // ====================================================
    // CALLBACK
    // ====================================================

    window[callbackName] = function(data) {


        try {


            if (!Array.isArray(data)) {

                throw new Error(
                    "Format data Google Sheets tidak valid."
                );

            }


            // =================================================
            // SIMPAN DATA DARI GOOGLE SHEETS
            // =================================================

            dataProfesor = data.map(function(item) {


                return {

                    id:
                        item.id || "",


                    periode:
                        formatTanggal(
                            item.periode
                        ),


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

                };


            });


            // =================================================
            // MULAI PORTAL
            // =================================================

            mulaiPortal();


        } catch (error) {


            console.error(
                "Kesalahan data:",
                error
            );


            tampilkanErrorDatabase();

        }


        // =================================================
        // BERSIHKAN CALLBACK
        // =================================================

        delete window[callbackName];


        if (
            scriptTag &&
            scriptTag.parentNode
        ) {

            scriptTag.parentNode.removeChild(
                scriptTag
            );

        }

    };


    // ====================================================
    // SCRIPT TAG JSONP
    // ====================================================

    const scriptTag =
        document.createElement("script");


    scriptTag.src =
        API_URL +
        "?action=data&callback=" +
        callbackName;


    scriptTag.onerror = function() {


        console.error(
            "Tidak dapat mengambil data dari Apps Script."
        );


        tampilkanErrorDatabase();


        delete window[callbackName];


        if (
            scriptTag.parentNode
        ) {

            scriptTag.parentNode.removeChild(
                scriptTag
            );

        }

    };


    document.body.appendChild(
        scriptTag
    );

}


// ========================================================
// ERROR DATABASE
// ========================================================

function tampilkanErrorDatabase() {

    if (!list) {
        return;
    }


    list.innerHTML = `

        <div class="data-kosong">

            <i class="fa-solid fa-circle-exclamation"></i>

            <h3>
                Data tidak dapat dimuat
            </h3>

            <p>
                Database Guru Besar sedang tidak dapat
                diakses.
            </p>

        </div>

    `;

}


// ========================================================
// MULAI PORTAL
// ========================================================

function mulaiPortal() {


    // ====================================================
    // JIKA BELUM ADA DATA
    // ====================================================

    if (dataProfesor.length === 0) {


        periodeAktif.textContent =
            "Belum ada data";


        jumlahPeriode.textContent =
            "Belum ada Guru Besar";


        totalProfesor.textContent =
            "0";


        totalBuku.textContent =
            "0";


        totalVideo.textContent =
            "0";


        tampilkanData([]);


        return;

    }


    // ====================================================
    // DAFTAR PERIODE
    // ====================================================

    const daftarPeriode = [

        ...new Set(

            dataProfesor.map(
                function(item) {
                    return item.periode;
                }
            )

        )

    ];


    // ====================================================
    // URUTKAN PERIODE TERBARU
    // ====================================================

    daftarPeriode.sort(

        function(a, b) {

            return (
                ubahTanggal(b) -
                ubahTanggal(a)
            );

        }

    );


    // ====================================================
    // PERIODE TERBARU
    // ====================================================

    periodeTerbaru =
        daftarPeriode[0];


    // ====================================================
    // DATA PROFESOR TERBARU
    // ====================================================

    profesorTerbaru =
        dataProfesor.filter(

            function(item) {

                return (
                    item.periode ===
                    periodeTerbaru
                );

            }

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
        dataProfesor.length;


    totalBuku.textContent =

        dataProfesor.filter(

            function(item) {

                return (
                    item.pdf &&
                    item.pdf.trim() !== ""
                );

            }

        ).length;


    totalVideo.textContent =

        dataProfesor.filter(

            function(item) {

                return (
                    item.youtube &&
                    item.youtube.trim() !== ""
                );

            }

        ).length;


    // ====================================================
    // TAMPILKAN PERIODE TERBARU
    // ====================================================

    tampilkanData(
        profesorTerbaru
    );

}


// ========================================================
// PENCARIAN GURU BESAR
// ========================================================

if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        function() {


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


            // =================================================
            // CARI NAMA
            // =================================================

            const hasil =
                dataProfesor.filter(

                    function(item) {

                        return (

                            item.nama
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            item.fakultas
                                .toLowerCase()
                                .includes(keyword)

                        );

                    }

                );


            tampilkanData(
                hasil
            );


        }

    );

}


// ========================================================
// MENU BERANDA
// ========================================================

const btnBeranda =
    document.getElementById("btnBeranda");


if (btnBeranda) {

    btnBeranda.addEventListener(
        "click",
        function() {


            btnBeranda
                .classList
                .add("active");


            const btnArsip =
                document.getElementById(
                    "btnArsip"
                );


            if (btnArsip) {

                btnArsip
                    .classList
                    .remove("active");

            }


            const periodeBox =
                document.querySelector(
                    ".periode-box"
                );


            if (periodeBox) {

                periodeBox.style.display =
                    "block";

            }


            if (searchInput) {

                searchInput.value = "";

            }


            tampilkanData(
                profesorTerbaru
            );

        }

    );

}


// ========================================================
// MENU ARSIP
// ========================================================

const btnArsip =
    document.getElementById("btnArsip");


if (btnArsip) {

    btnArsip.addEventListener(
        "click",
        function() {


            btnArsip
                .classList
                .add("active");


            if (btnBeranda) {

                btnBeranda
                    .classList
                    .remove("active");

            }


            const periodeBox =
                document.querySelector(
                    ".periode-box"
                );


            if (periodeBox) {

                periodeBox.style.display =
                    "none";

            }


            if (searchInput) {

                searchInput.value = "";

            }


            tampilkanArsip();

        }

    );

}


// ========================================================
// TAMPILKAN DATA PROFESOR
// ========================================================

function tampilkanData(data) {


    if (!list) {
        return;
    }


    list.innerHTML = "";


    // ====================================================
    // DATA KOSONG
    // ====================================================

    if (
        !data ||
        data.length === 0
    ) {


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
    // CARD PROFESOR
    // ====================================================

    data.forEach(
        function(item) {


            // =================================================
            // FOTO
            // =================================================

            let fotoProfesor;


            if (
                item.foto &&
                item.foto.trim() !== ""
            ) {


                fotoProfesor = `

                    <img

                        src="${item.foto}"

                        class="photo"

                        alt="${item.nama}"

                        loading="lazy"

                    >

                `;

            } else {


                fotoProfesor = `

                    <div class="photo-placeholder">

                        <i class="fa-solid fa-user"></i>

                    </div>

                `;

            }


            // =================================================
            // BUKU
            // =================================================

            let tombolBuku = "";


            if (
                item.pdf &&
                item.pdf.trim() !== ""
            ) {


                tombolBuku = `

                    <a

                        href="${item.pdf}"

                        class="btn btn-book"

                        target="_blank"

                        rel="noopener noreferrer"

                    >

                        <i class="fa-solid fa-book-open"></i>

                        Baca Orasi Ilmiah

                    </a>

                `;

            }


            // =================================================
            // VIDEO
            // =================================================

            let tombolYoutube = "";


            if (
                item.youtube &&
                item.youtube.trim() !== ""
            ) {


                tombolYoutube = `

                    <a

                        href="${item.youtube}"

                        class="btn"

                        target="_blank"

                        rel="noopener noreferrer"

                    >

                        <i class="fa-brands fa-youtube"></i>

                        Video Biografi

                    </a>

                `;

            }


            // =================================================
            // CARD
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


        }

    );

}


// ========================================================
// BUKA PERIODE ARSIP
// ========================================================

function bukaPeriode(periode) {


    const dataPeriode =
        dataProfesor.filter(

            function(item) {

                return (
                    item.periode ===
                    periode
                );

            }

        );


    if (btnArsip) {

        btnArsip
            .classList
            .add("active");

    }


    if (btnBeranda) {

        btnBeranda
            .classList
            .remove("active");

    }


    const periodeBox =
        document.querySelector(
            ".periode-box"
        );


    if (periodeBox) {

        periodeBox.style.display =
            "none";

    }


    if (searchInput) {

        searchInput.value = "";

    }


    // ====================================================
    // HEADER PERIODE
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


    // ====================================================
    // CARD PROFESOR
    // ====================================================

    const containerData =
        document.createElement("div");


    dataPeriode.forEach(
        function(item) {


            let fotoProfesor;


            if (
                item.foto &&
                item.foto.trim() !== ""
            ) {


                fotoProfesor = `

                    <img

                        src="${item.foto}"

                        class="photo"

                        alt="${item.nama}"

                        loading="lazy"

                    >

                `;

            } else {


                fotoProfesor = `

                    <div class="photo-placeholder">

                        <i class="fa-solid fa-user"></i>

                    </div>

                `;

            }


            let tombolBuku = "";


            if (
                item.pdf &&
                item.pdf.trim() !== ""
            ) {


                tombolBuku = `

                    <a

                        href="${item.pdf}"

                        class="btn btn-book"

                        target="_blank"

                        rel="noopener noreferrer"

                    >

                        <i class="fa-solid fa-book-open"></i>

                        Baca Orasi Ilmiah

                    </a>

                `;

            }


            let tombolYoutube = "";


            if (
                item.youtube &&
                item.youtube.trim() !== ""
            ) {


                tombolYoutube = `

                    <a

                        href="${item.youtube}"

                        class="btn"

                        target="_blank"

                        rel="noopener noreferrer"

                    >

                        <i class="fa-brands fa-youtube"></i>

                        Video Biografi

                    </a>

                `;

            }


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


        }

    );


    list.appendChild(
        containerData
    );

}


// ========================================================
// ARSIP PENGUKUHAN
// ========================================================

function tampilkanArsip() {


    list.innerHTML = `

        <div class="arsip-header">

            <div class="arsip-header-icon">

                <i class="fa-solid fa-folder-open"></i>

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
    // KELOMPOK BERDASARKAN TAHUN
    // ====================================================

    const kelompokTahun = {};


    dataProfesor.forEach(
        function(item) {


            const date =
                ubahTanggal(
                    item.periode
                );


            const tahun =
                date.getFullYear();


            if (
                !isNaN(tahun)
            ) {


                if (
                    !kelompokTahun[tahun]
                ) {

                    kelompokTahun[tahun] = [];

                }


                kelompokTahun[tahun].push(
                    item
                );

            }

        }

    );


    // ====================================================
    // URUTKAN TAHUN TERBARU
    // ====================================================

    const tahunUrut =

        Object.keys(
            kelompokTahun
        ).sort(

            function(a, b) {

                return b - a;

            }

        );


    // ====================================================
    // JIKA ARSIP KOSONG
    // ====================================================

    if (
        tahunUrut.length === 0
    ) {


        list.innerHTML += `

            <div class="data-kosong">

                <i class="fa-solid fa-folder-open"></i>

                <h3>
                    Belum ada arsip
                </h3>

                <p>
                    Belum ada data pengukuhan Guru Besar.
                </p>

            </div>

        `;


        return;

    }


    // ====================================================
    // TAMPILKAN TAHUN
    // ====================================================

    tahunUrut.forEach(
        function(tahun) {


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

                            function(item) {

                                return item.periode;

                            }

                        )

                )

            ];


            // =================================================
            // URUTKAN PERIODE
            // =================================================

            periodeUnik.sort(

                function(a, b) {

                    return (
                        ubahTanggal(b) -
                        ubahTanggal(a)
                    );

                }

            );


            // =================================================
            // TAMPILKAN PERIODE
            // =================================================

            periodeUnik.forEach(
                function(periode) {


                    const jumlah =

                        kelompokTahun[tahun]
                            .filter(

                                function(item) {

                                    return (
                                        item.periode ===
                                        periode
                                    );

                                }

                            ).length;


                    list.innerHTML += `

                        <div

                            class="arsip-item"

                            onclick="bukaPeriode('${periode}')"

                        >

                            <div>

                                <h3>

                                    <i class="fa-regular fa-calendar"></i>

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


                }

            );


        }

    );

}


// ========================================================
// MULAI MENGAMBIL DATA
// ========================================================

ambilDataDariGoogleSheets();
