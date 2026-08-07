// ========================================================
// DEWAN PROFESOR UNIVERSITAS ANDALAS
// SCRIPT.JS
// DATABASE GOOGLE SHEETS + GOOGLE DRIVE
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
// DATA GLOBAL
// ========================================================

let dataProfesor = [];

let profesorTerbaru = [];

let periodeTerbaru = "";


// ========================================================
// NAMA BULAN
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
// FUNGSI GOOGLE DRIVE
// ========================================================
// Mengubah berbagai bentuk link Google Drive
// menjadi link gambar yang bisa digunakan <img>
// ========================================================

function ubahLinkGoogleDrive(url) {

    if (!url) {
        return "";
    }

    url = String(url).trim();

    if (url === "") {
        return "";
    }


    // ----------------------------------------------------
    // Jika sudah berupa URL uc?export=view&id=
    // ----------------------------------------------------

    if (
        url.includes("drive.google.com/uc") &&
        url.includes("id=")
    ) {

        return url;

    }


    // ----------------------------------------------------
    // Format:
    // https://drive.google.com/file/d/FILE_ID/view
    // ----------------------------------------------------

    let match =
        url.match(
            /drive\.google\.com\/file\/d\/([^\/?]+)/i
        );


    if (match && match[1]) {

        return (
            "https://drive.google.com/uc?export=view&id=" +
            match[1]
        );

    }


    // ----------------------------------------------------
    // Format:
    // https://drive.google.com/open?id=FILE_ID
    // ----------------------------------------------------

    match =
        url.match(
            /drive\.google\.com\/open\?id=([^&]+)/i
        );


    if (match && match[1]) {

        return (
            "https://drive.google.com/uc?export=view&id=" +
            match[1]
        );

    }


    // ----------------------------------------------------
    // Format:
    // https://drive.google.com/uc?id=FILE_ID
    // ----------------------------------------------------

    match =
        url.match(
            /drive\.google\.com\/uc\?(?:[^#]*&)?id=([^&#]+)/i
        );


    if (match && match[1]) {

        return (
            "https://drive.google.com/uc?export=view&id=" +
            match[1]
        );

    }


    // ----------------------------------------------------
    // Jika hanya FILE ID
    // ----------------------------------------------------

    if (
        /^[a-zA-Z0-9_-]{20,}$/.test(url)
    ) {

        return (
            "https://drive.google.com/uc?export=view&id=" +
            url
        );

    }


    // ----------------------------------------------------
    // Jika bukan Google Drive
    // kembalikan URL asli
    // ----------------------------------------------------

    return url;

}


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


    // Gunakan UTC karena data dari Sheets
    // bisa berbentuk ISO UTC

    return (
        date.getUTCDate() +
        " " +
        namaBulan[date.getUTCMonth()] +
        " " +
        date.getUTCFullYear()
    );

}


// ========================================================
// KONVERSI TANGGAL INDONESIA
// ========================================================

function ubahTanggal(teks) {

    if (!teks) {
        return new Date(0);
    }


    // ----------------------------------------------------
    // Jika format ISO
    // ----------------------------------------------------

    if (
        teks.includes("T") ||
        /^\d{4}-\d{2}-\d{2}/.test(teks)
    ) {

        const date =
            new Date(teks);

        if (!isNaN(date.getTime())) {
            return date;
        }

    }


    // ----------------------------------------------------
    // Format:
    // 25 Oktober 2026
    // ----------------------------------------------------

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
// AMBIL DATA GOOGLE SHEETS
// MENGGUNAKAN JSONP
// ========================================================

function ambilDataDariGoogleSheets() {


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


    const callbackName =
        "googleSheetsCallback_" +
        Date.now();


    let scriptTag = null;


    // ====================================================
    // CALLBACK
    // ====================================================

    window[callbackName] =
        function(data) {


            try {


                if (!Array.isArray(data)) {

                    throw new Error(
                        "Format data tidak valid."
                    );

                }


                // =================================================
                // SIMPAN DATA
                // =================================================

                dataProfesor =
                    data.map(
                        function(item) {


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


                                // =================================
                                // PERBAIKAN GOOGLE DRIVE
                                // =================================

                                foto:
                                    ubahLinkGoogleDrive(
                                        item.foto
                                    ),


                                pdf:
                                    item.buku || "",


                                youtube:
                                    item.video || ""

                            };

                        }
                    );


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
            // BERSIHKAN
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
    // SCRIPT JSONP
    // ====================================================

    scriptTag =
        document.createElement("script");


    scriptTag.src =
        API_URL +
        "?action=data&callback=" +
        callbackName;


    scriptTag.onerror =
        function() {


            console.error(
                "Gagal mengambil data dari Apps Script."
            );


            tampilkanErrorDatabase();


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
    // URUTKAN PERIODE
    // ====================================================

    daftarPeriode.sort(

        function(a, b) {

            return (
                ubahTanggal(b) -
                ubahTanggal(a)
            );

        }

    );


    periodeTerbaru =
        daftarPeriode[0];


    // ====================================================
    // DATA TERBARU
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
    // INFORMASI
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


    tampilkanData(
        profesorTerbaru
    );

}


// ========================================================
// PENCARIAN
// ========================================================

if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        function() {


            const keyword =
                searchInput.value
                    .toLowerCase()
                    .trim();


            if (keyword === "") {

                tampilkanData(
                    profesorTerbaru
                );

                return;

            }


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
    document.getElementById(
        "btnBeranda"
    );


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
    document.getElementById(
        "btnArsip"
    );


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
    // TIDAK ADA DATA
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
    // CARD
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

                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"

                    >

                    <div
                        class="photo-placeholder"
                        style="display:none;"
                    >

                        <i class="fa-solid fa-user"></i>

                    </div>

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

                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"

                    >

                    <div
                        class="photo-placeholder"
                        style="display:none;"
                    >

                        <i class="fa-solid fa-user"></i>

                    </div>

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
    // KELOMPOK TAHUN
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
    // URUT TAHUN
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
    // JIKA KOSONG
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
    // TAHUN
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


            periodeUnik.sort(

                function(a, b) {

                    return (
                        ubahTanggal(b) -
                        ubahTanggal(a)
                    );

                }

            );


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
// JALANKAN
// ========================================================

ambilDataDariGoogleSheets();
