// ========================================================
// DEWAN PROFESOR UNIVERSITAS ANDALAS
// SCRIPT.JS LENGKAP
//
// FUNGSI:
// 1. Ambil data Google Sheets
// 2. Foto Google Drive
// 3. Highlight hasil pencarian
// 4. Search real-time
// 5. ENTER untuk mencari
// 6. Auto zoom-in saat input search aktif
// 7. Auto zoom-out kembali setelah ENTER
// 8. Scroll ke hasil pencarian
// 9. Arsip Pengukuhan
// ========================================================


// ========================================================
// API GOOGLE APPS SCRIPT
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

const btnBeranda = document.getElementById("btnBeranda");
const btnArsip = document.getElementById("btnArsip");


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
// ESCAPE HTML
// ========================================================

function escapeHTML(str) {

    if (!str) return "";

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================================
// KONVERSI LINK GOOGLE DRIVE
// ========================================================

function ubahLinkGoogleDrive(url) {

    if (!url) return "";

    url = String(url).trim();

    let fileId = "";

    // Format ?id=XXXX
    const matchParamId =
        url.match(/[?&]id=([a-zA-Z0-9_-]+)/i);

    // Format /file/d/XXXX
    const matchPathId =
        url.match(/\/d\/([a-zA-Z0-9_-]+)/i);

    // ID Drive langsung
    const matchRawId =
        /^[a-zA-Z0-9_-]{20,}$/.test(url);

    if (matchParamId) {

        fileId = matchParamId[1];

    } else if (matchPathId) {

        fileId = matchPathId[1];

    } else if (matchRawId) {

        fileId = url;

    }

    if (fileId) {

        return `https://lh3.googleusercontent.com/d/${fileId}`;

    }

    return url;
}


// ========================================================
// FORMAT TANGGAL
// ========================================================

function formatTanggal(tanggal) {

    if (!tanggal) return "";

    const date = new Date(tanggal);

    if (isNaN(date.getTime())) {

        return tanggal;

    }

    return `${date.getUTCDate()} ${namaBulan[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}


// ========================================================
// KONVERSI TANGGAL INDONESIA
// ========================================================

function ubahTanggal(teks) {

    if (!teks) return new Date(0);

    // Format ISO
    if (
        teks.includes("T") ||
        /^\d{4}-\d{2}-\d{2}/.test(teks)
    ) {

        const date = new Date(teks);

        if (!isNaN(date.getTime())) {

            return date;

        }
    }

    const bagian = teks.trim().split(" ");

    if (bagian.length < 3) {

        return new Date(0);

    }

    const tanggal = parseInt(bagian[0]);

    const bulan = namaBulan.indexOf(bagian[1]);

    const tahun = parseInt(bagian[2]);

    if (
        isNaN(tanggal) ||
        bulan < 0 ||
        isNaN(tahun)
    ) {

        return new Date(0);

    }

    return new Date(tahun, bulan, tanggal);
}


// ========================================================
// FUNGSI DETEKSI MOBILE
// ========================================================

function isMobileDevice() {

    return window.matchMedia("(max-width: 600px)").matches;

}


// ========================================================
// FUNGSI RESET ZOOM MOBILE
//
// Dipanggil setelah ENTER.
// Tujuannya mengembalikan viewport ke kondisi normal.
// ========================================================

function resetMobileZoom() {

    if (!isMobileDevice()) {

        return;

    }

    // Hilangkan fokus dari input
    if (searchInput) {

        searchInput.blur();

    }


    // ====================================================
    // SIMPAN POSISI SCROLL
    // ====================================================

    const posisiScroll =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        0;


    // ====================================================
    // CARI META VIEWPORT
    // ====================================================

    let viewport =
        document.querySelector('meta[name="viewport"]');


    if (!viewport) {

        viewport =
            document.createElement("meta");

        viewport.name = "viewport";

        document.head.appendChild(viewport);

    }


    // ====================================================
    // RESET VIEWPORT KE NORMAL
    // ====================================================

    const viewportNormal =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0";

    const viewportBiasa =
        "width=device-width, initial-scale=1.0";


    // Set normal sementara
    viewport.setAttribute(
        "content",
        viewportNormal
    );


    // ====================================================
    // FORCE REFLOW
    // ====================================================

    document.documentElement.style.width = "100%";

    document.body.style.width = "100%";


    // ====================================================
    // KEMBALIKAN VIEWPORT
    // ====================================================

    setTimeout(() => {

        viewport.setAttribute(
            "content",
            viewportBiasa
        );

        window.scrollTo({
            top: posisiScroll,
            left: 0,
            behavior: "instant"
        });

    }, 100);


    // ====================================================
    // SECOND RESET
    // Beberapa browser mobile perlu delay kedua.
    // ====================================================

    setTimeout(() => {

        viewport.setAttribute(
            "content",
            viewportNormal
        );

        window.scrollTo({
            top: posisiScroll,
            left: 0,
            behavior: "instant"
        });

    }, 250);


    // ====================================================
    // FINAL RESET
    // ====================================================

    setTimeout(() => {

        viewport.setAttribute(
            "content",
            viewportBiasa
        );

        window.scrollTo({
            top: posisiScroll,
            left: 0,
            behavior: "instant"
        });

    }, 450);

}


// ========================================================
// AMBIL DATA GOOGLE SHEETS
// JSONP
// ========================================================

function ambilDataDariGoogleSheets() {

    if (list) {

        list.innerHTML = `

            <div class="data-kosong">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <h3>Memuat data...</h3>

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
    // TIMEOUT
    // ====================================================

    const timeoutId = setTimeout(() => {

        cleanup();

        tampilkanErrorDatabase();

    }, 15000);


    // ====================================================
    // CLEANUP
    // ====================================================

    function cleanup() {

        clearTimeout(timeoutId);


        if (window[callbackName]) {

            delete window[callbackName];

        }


        if (
            scriptTag &&
            scriptTag.parentNode
        ) {

            scriptTag.parentNode.removeChild(
                scriptTag
            );

        }

    }


    // ====================================================
    // CALLBACK
    // ====================================================

    window[callbackName] = function(data) {

        cleanup();


        try {

            if (!Array.isArray(data)) {

                throw new Error(
                    "Format data tidak valid."
                );

            }


            dataProfesor = data.map(item => ({

                id: item.id || "",

                periode:
                    formatTanggal(item.periode),

                nama:
                    item.nama || "",

                fakultas:
                    item.fakultas || "",

                foto:
                    ubahLinkGoogleDrive(
                        item.foto
                    ),

                pdf:
                    item.buku ||
                    item.linkbukuorasi ||
                    "",

                youtube:
                    item.video ||
                    item.linkvideo ||
                    ""

            }));


            mulaiPortal();


        } catch (error) {

            console.error(
                "Kesalahan parsing data:",
                error
            );

            tampilkanErrorDatabase();

        }

    };


    // ====================================================
    // SCRIPT JSONP
    // ====================================================

    scriptTag =
        document.createElement("script");


    scriptTag.src =
        `${API_URL}?action=data&callback=${callbackName}`;


    scriptTag.onerror = function() {

        cleanup();

        console.error(
            "Gagal terhubung ke Google Apps Script."
        );

        tampilkanErrorDatabase();

    };


    document.body.appendChild(scriptTag);

}


// ========================================================
// ERROR DATABASE
// ========================================================

function tampilkanErrorDatabase() {

    if (!list) return;

    list.innerHTML = `

        <div class="data-kosong">

            <i class="fa-solid fa-circle-exclamation"></i>

            <h3>
                Data tidak dapat dimuat
            </h3>

            <p>
                Database Guru Besar sedang
                tidak dapat diakses.
            </p>

        </div>

    `;

}


// ========================================================
// MULAI PORTAL
// ========================================================

function mulaiPortal() {

    if (dataProfesor.length === 0) {

        if (periodeAktif) {

            periodeAktif.textContent =
                "Belum ada data";

        }

        if (jumlahPeriode) {

            jumlahPeriode.textContent =
                "Belum ada Guru Besar";

        }

        if (totalProfesor) {

            totalProfesor.textContent = "0";

        }

        if (totalBuku) {

            totalBuku.textContent = "0";

        }

        if (totalVideo) {

            totalVideo.textContent = "0";

        }

        tampilkanData([]);

        return;

    }


    // ====================================================
    // DAFTAR PERIODE
    // ====================================================

    const daftarPeriode = [
        ...new Set(
            dataProfesor.map(
                item => item.periode
            )
        )
    ];


    daftarPeriode.sort(
        (a, b) =>
            ubahTanggal(b) -
            ubahTanggal(a)
    );


    periodeTerbaru =
        daftarPeriode[0];


    profesorTerbaru =
        dataProfesor.filter(
            item =>
                item.periode ===
                periodeTerbaru
        );


    // ====================================================
    // INFO PERIODE
    // ====================================================

    if (periodeAktif) {

        periodeAktif.textContent =
            periodeTerbaru;

    }


    if (jumlahPeriode) {

        jumlahPeriode.textContent =
            `${profesorTerbaru.length} Guru Besar Dikukuhkan`;

    }


    // ====================================================
    // STATISTIK
    // ====================================================

    if (totalProfesor) {

        totalProfesor.textContent =
            dataProfesor.length;

    }


    if (totalBuku) {

        totalBuku.textContent =
            dataProfesor.filter(
                item =>
                    item.pdf &&
                    item.pdf.trim() !== ""
            ).length;

    }


    if (totalVideo) {

        totalVideo.textContent =
            dataProfesor.filter(
                item =>
                    item.youtube &&
                    item.youtube.trim() !== ""
            ).length;

    }


    // ====================================================
    // TAMPILKAN PERIODE TERBARU
    // ====================================================

    tampilkanData(profesorTerbaru);

}


// ========================================================
// TAMPILKAN DATA PROFESOR
// ========================================================

function tampilkanData(data) {

    if (!list) return;


    const keyword =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    // ====================================================
    // JIKA DATA KOSONG
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
                    Nama Guru Besar yang Anda
                    cari tidak tersedia.
                </p>

            </div>

        `;

        return;

    }


    let htmlBuffer = "";


    // ====================================================
    // RENDER KARTU
    // ====================================================

    data.forEach(item => {


        // ==================================================
        // HIGHLIGHT
        // ==================================================

        const highlightText = (text) => {

            if (!keyword) {

                return escapeHTML(text);

            }


            const escapedKeyword =
                keyword.replace(
                    /[-\/\\^$*+?.()|[\]{}]/g,
                    "\\$&"
                );


            const regex =
                new RegExp(
                    `(${escapedKeyword})`,
                    "gi"
                );


            return escapeHTML(text)
                .replace(
                    regex,
                    "<mark>$1</mark>"
                );

        };


        const nama =
            highlightText(item.nama);


        const fakultas =
            highlightText(item.fakultas);


        const periode =
            escapeHTML(item.periode);


        // ==================================================
        // FOTO
        // ==================================================

        const fotoProfesor =
            (
                item.foto &&
                item.foto.trim() !== ""
            )

            ?

            `

            <img
                src="${escapeHTML(item.foto)}"
                class="photo"
                alt="${escapeHTML(item.nama)}"
                loading="lazy"
                referrerpolicy="no-referrer"

                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                "
            >

            <div
                class="photo-placeholder"
                style="display:none;"
            >

                <i class="fa-solid fa-user"></i>

            </div>

            `

            :

            `

            <div class="photo-placeholder">

                <i class="fa-solid fa-user"></i>

            </div>

            `;


        // ==================================================
        // TOMBOL BUKU
        // ==================================================

        const tombolBuku =
            (
                item.pdf &&
                item.pdf.trim() !== ""
            )

            ?

            `

            <a
                href="${escapeHTML(item.pdf)}"
                class="btn btn-book"
                target="_blank"
                rel="noopener noreferrer"
            >

                <i class="fa-solid fa-book-open"></i>

                Baca Orasi Ilmiah

            </a>

            `

            :

            "";


        // ==================================================
        // TOMBOL YOUTUBE
        // ==================================================

        const tombolYoutube =
            (
                item.youtube &&
                item.youtube.trim() !== ""
            )

            ?

            `

            <a
                href="${escapeHTML(item.youtube)}"
                class="btn"
                target="_blank"
                rel="noopener noreferrer"
            >

                <i class="fa-brands fa-youtube"></i>

                Video Biografi

            </a>

            `

            :

            "";


        // ==================================================
        // HTML CARD
        // ==================================================

        htmlBuffer += `

            <div class="card">

                ${fotoProfesor}


                <div class="info">

                    <h3>
                        ${nama}
                    </h3>


                    <p class="fakultas">

                        ${fakultas}

                    </p>


                    <p class="periode-profesor">

                        <i class="fa-regular fa-calendar"></i>

                        Pengukuhan:
                        ${periode}

                    </p>


                    <div class="buttons">

                        ${tombolBuku}

                        ${tombolYoutube}

                    </div>

                </div>

            </div>

        `;

    });


    list.innerHTML = htmlBuffer;

}


// ========================================================
// EVENT SEARCH
//
// REAL-TIME
// ENTER
// AUTO ZOOM OUT
// ========================================================

if (searchInput) {


    // ====================================================
    // SAAT SEARCH DIKLIK / FOCUS
    // ====================================================

    searchInput.addEventListener(
        "focus",
        function() {

            // Jangan mencegah browser
            // melakukan auto zoom-in.

            // Ini memang sengaja dibiarkan
            // agar keyboard mobile bekerja normal.

        }
    );


    // ====================================================
    // SAAT USER MENGETIK
    // ====================================================

    searchInput.addEventListener(
        "input",
        function() {

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


            // Cari nama / fakultas
            const hasil =
                dataProfesor.filter(
                    item =>

                        item.nama
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        item.fakultas
                            .toLowerCase()
                            .includes(keyword)
                );


            // Tampilkan hasil realtime
            tampilkanData(hasil);

        }
    );


    // ====================================================
    // TEKAN ENTER
    // ====================================================

    searchInput.addEventListener(
        "keydown",
        function(e) {


            if (e.key !== "Enter") {

                return;

            }


            e.preventDefault();


            const keyword =
                searchInput.value
                    .toLowerCase()
                    .trim();


            if (keyword === "") {

                return;

            }


            const hasil =
                dataProfesor.filter(
                    item =>

                        item.nama
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        item.fakultas
                            .toLowerCase()
                            .includes(keyword)
                );


            // =================================================
            // JIKA ADA HASIL
            // =================================================

            if (hasil.length > 0) {


                // ---------------------------------------------
                // Pastikan berada di Beranda
                // ---------------------------------------------

                if (btnBeranda) {

                    btnBeranda.classList.add(
                        "active"
                    );

                }


                if (btnArsip) {

                    btnArsip.classList.remove(
                        "active"
                    );

                }


                // ---------------------------------------------
                // Tampilkan periode
                // ---------------------------------------------

                const periodeBox =
                    document.querySelector(
                        ".periode-box"
                    );


                if (periodeBox) {

                    periodeBox.style.display =
                        "block";

                }


                // ---------------------------------------------
                // Tampilkan hasil
                // ---------------------------------------------

                tampilkanData(hasil);


                // ---------------------------------------------
                // BLUR INPUT
                // ---------------------------------------------

                searchInput.blur();


                // =================================================
                // RESET ZOOM
                // =================================================

                setTimeout(() => {

                    resetMobileZoom();

                }, 100);


                // =================================================
                // SCROLL KE CARD
                // =================================================

                setTimeout(() => {


                    const kartuPertama =
                        document.querySelector(
                            "#listProfesor .card"
                        );


                    if (!kartuPertama) {

                        return;

                    }


                    // Posisi kartu
                    const elementPosition =
                        kartuPertama
                            .getBoundingClientRect()
                            .top +
                        window.pageYOffset;


                    // Offset agar tidak terlalu mepet
                    const offsetPosition =
                        elementPosition - 20;


                    // Scroll ke kartu
                    window.scrollTo({

                        top: offsetPosition,

                        left: 0,

                        behavior: "smooth"

                    });


                    // =================================================
                    // HIGHLIGHT CARD
                    // =================================================

                    kartuPertama.style.transition =
                        "all 0.3s ease";


                    kartuPertama.style.boxShadow =
                        "0 0 0 4px #008000, 0 12px 30px rgba(0,0,0,0.25)";


                    setTimeout(() => {

                        kartuPertama.style.boxShadow =
                            "";

                    }, 2000);


                }, 600);


            }

            // =================================================
            // JIKA TIDAK ADA HASIL
            // =================================================

            else {

                tampilkanData(hasil);

                searchInput.blur();

                setTimeout(() => {

                    resetMobileZoom();

                }, 100);

            }

        }
    );

}


// ========================================================
// TOMBOL BERANDA
// ========================================================

if (btnBeranda) {

    btnBeranda.addEventListener(
        "click",
        function() {


            btnBeranda.classList.add(
                "active"
            );


            if (btnArsip) {

                btnArsip.classList.remove(
                    "active"
                );

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

                searchInput.blur();

            }


            tampilkanData(
                profesorTerbaru
            );

        }
    );

}


// ========================================================
// TOMBOL ARSIP
// ========================================================

if (btnArsip) {

    btnArsip.addEventListener(
        "click",
        function() {


            btnArsip.classList.add(
                "active"
            );


            if (btnBeranda) {

                btnBeranda.classList.remove(
                    "active"
                );

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

                searchInput.blur();

            }


            tampilkanArsip();

        }
    );

}


// ========================================================
// BUKA PERIODE ARSIP
// ========================================================

function bukaPeriode(periodeTarget) {


    const dataPeriode =
        dataProfesor.filter(
            item =>
                item.periode ===
                periodeTarget
        );


    if (btnArsip) {

        btnArsip.classList.add(
            "active"
        );

    }


    if (btnBeranda) {

        btnBeranda.classList.remove(
            "active"
        );

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

        searchInput.blur();

    }


    // ====================================================
    // HEADER DETAIL PERIODE
    // ====================================================

    let htmlHeader = `

        <div class="periode-detail">


            <button
                class="btn-kembali"
                onclick="tampilkanArsip()"
            >

                <i class="fa-solid fa-arrow-left"></i>

                Kembali ke Arsip

            </button>


            <div class="periode-detail-box">


                <div class="periode-icon">

                    <i class="fa-regular fa-calendar-days"></i>

                </div>


                <div class="periode-info-text">

                    <h2>
                        Pengukuhan Guru Besar
                    </h2>

                    <h3>
                        ${escapeHTML(periodeTarget)}
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
    // CARD
    // ====================================================

    let htmlCards = "";


    dataPeriode.forEach(item => {


        const nama =
            escapeHTML(item.nama);


        const fakultas =
            escapeHTML(item.fakultas);


        const periode =
            escapeHTML(item.periode);


        const fotoProfesor =
            (
                item.foto &&
                item.foto.trim() !== ""
            )

            ?

            `

            <img
                src="${escapeHTML(item.foto)}"
                class="photo"
                alt="${nama}"
                loading="lazy"
                referrerpolicy="no-referrer"

                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                "
            >

            <div
                class="photo-placeholder"
                style="display:none;"
            >

                <i class="fa-solid fa-user"></i>

            </div>

            `

            :

            `

            <div class="photo-placeholder">

                <i class="fa-solid fa-user"></i>

            </div>

            `;


        const tombolBuku =
            (
                item.pdf &&
                item.pdf.trim() !== ""
            )

            ?

            `

            <a
                href="${escapeHTML(item.pdf)}"
                class="btn btn-book"
                target="_blank"
                rel="noopener noreferrer"
            >

                <i class="fa-solid fa-book-open"></i>

                Baca Orasi Ilmiah

            </a>

            `

            :

            "";


        const tombolYoutube =
            (
                item.youtube &&
                item.youtube.trim() !== ""
            )

            ?

            `

            <a
                href="${escapeHTML(item.youtube)}"
                class="btn"
                target="_blank"
                rel="noopener noreferrer"
            >

                <i class="fa-brands fa-youtube"></i>

                Video Biografi

            </a>

            `

            :

            "";


        htmlCards += `

            <div class="card">

                ${fotoProfesor}


                <div class="info">

                    <h3>
                        ${nama}
                    </h3>


                    <p class="fakultas">

                        ${fakultas}

                    </p>


                    <p class="periode-profesor">

                        <i class="fa-regular fa-calendar"></i>

                        Pengukuhan:
                        ${periode}

                    </p>


                    <div class="buttons">

                        ${tombolBuku}

                        ${tombolYoutube}

                    </div>

                </div>

            </div>

        `;

    });


    list.innerHTML =
        htmlHeader +
        `<div>${htmlCards}</div>`;

}


// ========================================================
// TAMPILKAN ARSIP
// ========================================================

function tampilkanArsip() {


    let htmlBuffer = `

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


    const kelompokTahun = {};


    dataProfesor.forEach(item => {


        const date =
            ubahTanggal(item.periode);


        const tahun =
            date.getFullYear();


        if (
            !isNaN(tahun) &&
            tahun > 1900
        ) {


            if (!kelompokTahun[tahun]) {

                kelompokTahun[tahun] = [];

            }


            kelompokTahun[tahun].push(
                item
            );

        }

    });


    const tahunUrut =
        Object.keys(
            kelompokTahun
        ).sort(
            (a, b) => b - a
        );


    // ====================================================
    // TIDAK ADA ARSIP
    // ====================================================

    if (tahunUrut.length === 0) {

        list.innerHTML =
            htmlBuffer +

            `

            <div class="data-kosong">

                <i class="fa-solid fa-folder-open"></i>

                <h3>
                    Belum ada arsip
                </h3>

                <p>
                    Belum ada data
                    pengukuhan Guru Besar.
                </p>

            </div>

            `;

        return;

    }


    // ====================================================
    // TAHUN
    // ====================================================

    tahunUrut.forEach(tahun => {


        htmlBuffer += `

            <div class="tahun-arsip">

                <h2>
                    ${tahun}
                </h2>

            </div>

        `;


        const periodeUnik =
            [
                ...new Set(
                    kelompokTahun[tahun]
                        .map(
                            item =>
                                item.periode
                        )
                )
            ];


        periodeUnik.sort(
            (a, b) =>
                ubahTanggal(b) -
                ubahTanggal(a)
        );


        // ==================================================
        // PERIODE
        // ==================================================

        periodeUnik.forEach(
            periode => {


                const jumlah =
                    kelompokTahun[tahun]
                        .filter(
                            item =>
                                item.periode ===
                                periode
                        )
                        .length;


                const periodeSafe =
                    escapeHTML(periode)
                        .replace(
                            /'/g,
                            "\\'"
                        );


                htmlBuffer += `

                    <div
                        class="arsip-item"
                        onclick="bukaPeriode('${periodeSafe}')"
                    >


                        <div>

                            <h3>

                                <i
                                    class="fa-regular fa-calendar"
                                ></i>

                                ${escapeHTML(periode)}

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

    });


    list.innerHTML =
        htmlBuffer;

}


// ========================================================
// INISIALISASI
// ========================================================

ambilDataDariGoogleSheets();
