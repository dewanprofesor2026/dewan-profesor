// ========================================================
// DEWAN PROFESOR UNIVERSITAS ANDALAS
// SCRIPT.JS LENGKAP
//
// FITUR:
// 1. Ambil data dari Google Sheets via JSONP
// 2. Foto Google Drive
// 3. Pencarian realtime
// 4. Enter untuk mencari
// 5. Highlight hasil pencarian
// 6. Scroll ke kartu profesor
// 7. Pemulihan tampilan setelah auto-zoom HP
// 8. Beranda
// 9. Arsip Pengukuhan
// 10. Detail periode
// 11. Tombol kembali
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
// Mencegah karakter HTML masuk langsung ke halaman
// ========================================================

function escapeHTML(str) {

    if (str === null || str === undefined) {
        return "";
    }

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================================
// KONVERSI LINK GOOGLE DRIVE KE GAMBAR
// ========================================================

function ubahLinkGoogleDrive(url) {

    if (!url) {
        return "";
    }

    url = String(url).trim();

    let fileId = "";

    // Format:
    // ?id=XXXXXXXX

    const matchParamId = url.match(
        /[?&]id=([a-zA-Z0-9_-]+)/i
    );

    // Format:
    // /file/d/XXXXXXXX

    const matchPathId = url.match(
        /\/d\/([a-zA-Z0-9_-]+)/i
    );

    // Jika yang dimasukkan langsung ID Drive

    const matchRawId =
        /^[a-zA-Z0-9_-]{20,}$/.test(url);


    if (matchParamId) {

        fileId = matchParamId[1];

    } else if (matchPathId) {

        fileId = matchPathId[1];

    } else if (matchRawId) {

        fileId = url;

    }


    // Googleusercontent

    if (fileId) {

        return `https://lh3.googleusercontent.com/d/${fileId}`;

    }


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

    return `${date.getUTCDate()} ${
        namaBulan[date.getUTCMonth()]
    } ${date.getUTCFullYear()}`;
}


// ========================================================
// UBAH TANGGAL INDONESIA MENJADI OBJECT DATE
// ========================================================

function ubahTanggal(teks) {

    if (!teks) {
        return new Date(0);
    }


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


    // Format:
    // 25 Oktober 2026

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


    return new Date(
        tahun,
        bulan,
        tanggal
    );
}


// ========================================================
// MEMBUAT REGEX AMAN UNTUK SEARCH
// ========================================================

function escapeRegex(text) {

    return text.replace(
        /[-\/\\^$*+?.()|[\]{}]/g,
        "\\$&"
    );
}


// ========================================================
// AUTO ZOOM HP
//
// Ketika input mendapatkan fokus, browser HP tertentu
// melakukan auto zoom karena ukuran font input kecil.
//
// Kita TIDAK mematikan auto zoom tersebut.
//
// Setelah Enter ditekan, kita mencoba mengembalikan
// tampilan halaman ke kondisi normal.
// ========================================================

function pulihkanZoomHP() {

    if (!searchInput) {
        return;
    }


    // Simpan posisi scroll saat ini

    const scrollX = window.scrollX;

    const scrollY = window.scrollY;


    // Lepaskan fokus dari input
    // Ini membantu browser mengakhiri mode auto-zoom

    searchInput.blur();


    // Coba memindahkan fokus ke body

    try {

        document.body.focus();

    } catch (error) {

        console.log(
            "Body tidak dapat difokuskan."
        );

    }


    // Scroll sedikit untuk memicu browser melakukan
    // layout ulang pada beberapa browser HP

    window.scrollTo(
        scrollX,
        scrollY
    );


    // Setelah browser melakukan repaint,
    // kita kembalikan posisi halaman.

    setTimeout(() => {

        window.scrollTo({
            left: scrollX,
            top: scrollY,
            behavior: "instant"
        });

    }, 50);


    setTimeout(() => {

        window.scrollTo({
            left: scrollX,
            top: scrollY,
            behavior: "instant"
        });

    }, 150);


    setTimeout(() => {

        window.scrollTo({
            left: scrollX,
            top: scrollY,
            behavior: "instant"
        });

    }, 300);

}


// ========================================================
// MENGEMBALIKAN VIEWPORT HP
//
// Ini membantu browser melakukan layout ulang setelah
// keyboard / auto zoom input selesai.
//
// Tidak mengubah HTML Anda secara permanen.
// ========================================================

function resetViewportHP() {

    const viewport =
        document.querySelector(
            'meta[name="viewport"]'
        );


    if (!viewport) {
        return;
    }


    const isiAsli =
        viewport.getAttribute("content");


    // Jangan mengubah setting permanen.
    // Hanya memicu browser membaca ulang viewport.

    viewport.setAttribute(
        "content",
        isiAsli
    );

}


// ========================================================
// PROSES SELESAI SEARCH
// ========================================================

function selesaiSearchHP() {

    // Lepaskan fokus input

    if (searchInput) {
        searchInput.blur();
    }


    // Reset viewport

    resetViewportHP();


    // Pulihkan zoom / posisi

    pulihkanZoomHP();

}


// ========================================================
// AMBIL DATA GOOGLE SHEETS VIA JSONP
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


    // Timeout 15 detik

    const timeoutId =
        setTimeout(() => {

            cleanup();

            tampilkanErrorDatabase();

        }, 15000);


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
    // CALLBACK GOOGLE SHEETS
    // ====================================================

    window[callbackName] =
        function(data) {

            cleanup();


            try {

                if (!Array.isArray(data)) {

                    throw new Error(
                        "Format data tidak valid."
                    );

                }


                dataProfesor =
                    data.map(item => ({

                        id: item.id || "",

                        periode:
                            formatTanggal(
                                item.periode
                            ),

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
    // BUAT SCRIPT JSONP
    // ====================================================

    scriptTag =
        document.createElement("script");


    scriptTag.src =
        `${API_URL}?action=data&callback=${callbackName}`;


    scriptTag.onerror =
        function() {

            cleanup();


            console.error(
                "Gagal terhubung ke Google Apps Script."
            );


            tampilkanErrorDatabase();

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

            totalProfesor.textContent =
                "0";

        }


        if (totalBuku) {

            totalBuku.textContent =
                "0";

        }


        if (totalVideo) {

            totalVideo.textContent =
                "0";

        }


        tampilkanData([]);

        return;
    }


    // ====================================================
    // DAFTAR PERIODE
    // ====================================================

    const daftarPeriode =
        [
            ...new Set(
                dataProfesor.map(
                    item => item.periode
                )
            )
        ];


    // Urutkan terbaru

    daftarPeriode.sort(
        (a, b) =>
            ubahTanggal(b) -
            ubahTanggal(a)
    );


    periodeTerbaru =
        daftarPeriode[0];


    // Data profesor periode terbaru

    profesorTerbaru =
        dataProfesor.filter(
            item =>
                item.periode ===
                periodeTerbaru
        );


    // ====================================================
    // UPDATE INFORMASI
    // ====================================================

    if (periodeAktif) {

        periodeAktif.textContent =
            periodeTerbaru;

    }


    if (jumlahPeriode) {

        jumlahPeriode.textContent =
            `${profesorTerbaru.length} Guru Besar Dikukuhkan`;

    }


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


    // Tampilkan periode terbaru

    tampilkanData(
        profesorTerbaru
    );

}


// ========================================================
// RENDER DATA PROFESOR
// ========================================================

function tampilkanData(data) {

    if (!list) {
        return;
    }


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
    // LOOP DATA
    // ====================================================

    data.forEach(item => {


        // =================================================
        // HIGHLIGHT
        // =================================================

        const highlightText =
            (text) => {

                if (!keyword) {

                    return escapeHTML(
                        text
                    );

                }


                const regex =
                    new RegExp(
                        `(${escapeRegex(keyword)})`,
                        "gi"
                    );


                return escapeHTML(
                    text
                ).replace(
                    regex,
                    "<mark>$1</mark>"
                );

            };


        const nama =
            highlightText(
                item.nama
            );


        const fakultas =
            highlightText(
                item.fakultas
            );


        const periode =
            escapeHTML(
                item.periode
            );


        // =================================================
        // FOTO
        // =================================================

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


        // =================================================
        // TOMBOL BUKU
        // =================================================

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


        // =================================================
        // TOMBOL YOUTUBE
        // =================================================

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


        // =================================================
        // CARD
        // =================================================

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

                        <i
                            class="fa-regular fa-calendar"
                        ></i>

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
        htmlBuffer;

}


// ========================================================
// SEARCH
//
// FITUR:
// - Real-time search
// - Klik input → browser HP boleh auto zoom-in
// - Enter → hasil ditampilkan
// - Setelah Enter → input blur
// - Kemudian mencoba mengembalikan tampilan
// ========================================================

if (searchInput) {


    // ====================================================
    // SAAT SEARCH DIKLIK
    // ====================================================

    searchInput.addEventListener(
        "focus",
        function() {

            // JANGAN mencegah auto zoom HP.
            //
            // Justru kita biarkan browser melakukan
            // auto zoom seperti yang Anda inginkan.

            console.log(
                "Search aktif."
            );

        }
    );


    // ====================================================
    // SEARCH INPUT
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


            // Cari berdasarkan nama atau fakultas

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

            tampilkanData(
                hasil
            );

        }
    );


    // ====================================================
    // ENTER
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


            // ============================================
            // Jika kosong
            // ============================================

            if (keyword === "") {

                tampilkanData(
                    profesorTerbaru
                );

                selesaiSearchHP();

                return;
            }


            // ============================================
            // Cari data
            // ============================================

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


            // ============================================
            // Jika ditemukan
            // ============================================

            if (hasil.length > 0) {


                // Pastikan mode Beranda aktif

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


                // Pastikan periode tampil

                const periodeBox =
                    document.querySelector(
                        ".periode-box"
                    );


                if (periodeBox) {

                    periodeBox.style.display =
                        "block";

                }


                // Tampilkan hasil

                tampilkanData(
                    hasil
                );


                // ========================================
                // Lepaskan fokus input
                //
                // Ini penting untuk mengakhiri
                // auto zoom keyboard HP.
                // ========================================

                searchInput.blur();


                // ========================================
                // Tunggu render kartu
                // ========================================

                setTimeout(
                    function() {


                        const kartuPertama =
                            document.querySelector(
                                "#listProfesor .card"
                            );


                        if (!kartuPertama) {

                            selesaiSearchHP();

                            return;

                        }


                        // ==================================
                        // POSISI KARTU
                        // ==================================

                        const elementPosition =
                            kartuPertama
                                .getBoundingClientRect()
                                .top
                            +
                            window.pageYOffset;


                        const offsetPosition =
                            elementPosition - 20;


                        // ==================================
                        // SCROLL KE KARTU
                        // ==================================

                        window.scrollTo({

                            top:
                                Math.max(
                                    0,
                                    offsetPosition
                                ),

                            behavior:
                                "smooth"

                        });


                        // ==================================
                        // HIGHLIGHT CARD
                        // ==================================

                        kartuPertama.style.transition =
                            "all 0.3s ease";


                        kartuPertama.style.boxShadow =
                            "0 0 0 4px #008000, 0 12px 30px rgba(0,0,0,0.25)";


                        // ==================================
                        // HILANGKAN HIGHLIGHT
                        // ==================================

                        setTimeout(
                            function() {

                                kartuPertama.style.boxShadow =
                                    "";

                            },
                            2000
                        );


                        // ==================================
                        // PENTING:
                        // Pulihkan tampilan setelah
                        // auto zoom HP selesai.
                        // ==================================

                        setTimeout(
                            function() {

                                selesaiSearchHP();

                            },
                            350
                        );


                    },
                    150
                );


            }

            // ============================================
            // Jika tidak ditemukan
            // ============================================

            else {

                tampilkanData(
                    hasil
                );


                // Tetap keluarkan keyboard /
                // lepaskan auto focus

                searchInput.blur();


                setTimeout(
                    function() {

                        selesaiSearchHP();

                    },
                    200
                );

            }

        }
    );

}


// ========================================================
// BERANDA
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


            // Tampilkan periode

            const periodeBox =
                document.querySelector(
                    ".periode-box"
                );


            if (periodeBox) {

                periodeBox.style.display =
                    "block";

            }


            // Kosongkan search

            if (searchInput) {

                searchInput.value = "";

                searchInput.blur();

            }


            // Tampilkan periode terbaru

            tampilkanData(
                profesorTerbaru
            );


            // Pastikan viewport normal

            selesaiSearchHP();

        }
    );

}


// ========================================================
// ARSIP
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


            // Sembunyikan periode aktif

            const periodeBox =
                document.querySelector(
                    ".periode-box"
                );


            if (periodeBox) {

                periodeBox.style.display =
                    "none";

            }


            // Kosongkan search

            if (searchInput) {

                searchInput.value = "";

                searchInput.blur();

            }


            // Tampilkan arsip

            tampilkanArsip();


            // Pastikan viewport normal

            selesaiSearchHP();

        }
    );

}


// ========================================================
// BUKA DETAIL PERIODE
// ========================================================

function bukaPeriode(
    periodeTarget
) {


    const dataPeriode =
        dataProfesor.filter(
            item =>
                item.periode ===
                periodeTarget
        );


    // Aktifkan arsip

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


    // Sembunyikan periode utama

    const periodeBox =
        document.querySelector(
            ".periode-box"
        );


    if (periodeBox) {

        periodeBox.style.display =
            "none";

    }


    // Kosongkan search

    if (searchInput) {

        searchInput.value = "";

        searchInput.blur();

    }


    // ====================================================
    // HEADER DETAIL
    // ====================================================

    let htmlHeader = `

        <div class="periode-detail">


            <button
                class="btn-kembali"
                onclick="tampilkanArsip()"
            >

                <i
                    class="fa-solid fa-arrow-left"
                ></i>

                Kembali ke Arsip

            </button>


            <div class="periode-detail-box">


                <div class="periode-icon">

                    <i
                        class="fa-regular fa-calendar-days"
                    ></i>

                </div>


                <div class="periode-info-text">

                    <h2>
                        Pengukuhan Guru Besar
                    </h2>


                    <h3>
                        ${escapeHTML(
                            periodeTarget
                        )}
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
    // KARTU PROFESOR
    // ====================================================

    let htmlCards = "";


    dataPeriode.forEach(
        item => {


            const nama =
                escapeHTML(
                    item.nama
                );


            const fakultas =
                escapeHTML(
                    item.fakultas
                );


            const periode =
                escapeHTML(
                    item.periode
                );


            // Foto

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

                    <i
                        class="fa-solid fa-user"
                    ></i>

                </div>

                `

                :

                `

                <div class="photo-placeholder">

                    <i
                        class="fa-solid fa-user"
                    ></i>

                </div>

                `;


            // Buku

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

                    <i
                        class="fa-solid fa-book-open"
                    ></i>

                    Baca Orasi Ilmiah

                </a>

                `

                :

                "";


            // YouTube

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

                    <i
                        class="fa-brands fa-youtube"
                    ></i>

                    Video Biografi

                </a>

                `

                :

                "";


            // Card

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

                            <i
                                class="fa-regular fa-calendar"
                            ></i>

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

        }
    );


    list.innerHTML =
        htmlHeader +
        `<div>${htmlCards}</div>`;


    // Pastikan tampilan normal

    selesaiSearchHP();

}


// ========================================================
// TAMPILKAN ARSIP
// ========================================================

function tampilkanArsip() {


    // ====================================================
    // HEADER ARSIP
    // ====================================================

    let htmlBuffer = `

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


    dataProfesor.forEach(
        item => {


            const date =
                ubahTanggal(
                    item.periode
                );


            const tahun =
                date.getFullYear();


            if (
                !isNaN(tahun) &&
                tahun > 1900
            ) {


                if (
                    !kelompokTahun[tahun]
                ) {

                    kelompokTahun[tahun] =
                        [];

                }


                kelompokTahun[tahun].push(
                    item
                );

            }

        }
    );


    // ====================================================
    // URUTKAN TAHUN
    // ====================================================

    const tahunUrut =
        Object.keys(
            kelompokTahun
        ).sort(
            (a, b) => b - a
        );


    // ====================================================
    // JIKA TIDAK ADA ARSIP
    // ====================================================

    if (
        tahunUrut.length === 0
    ) {


        list.innerHTML =
            htmlBuffer +

            `

            <div class="data-kosong">

                <i
                    class="fa-solid fa-folder-open"
                ></i>

                <h3>
                    Belum ada arsip
                </h3>

                <p>
                    Belum ada data pengukuhan
                    Guru Besar.
                </p>

            </div>

            `;


        return;

    }


    // ====================================================
    // LOOP TAHUN
    // ====================================================

    tahunUrut.forEach(
        tahun => {


            htmlBuffer += `

                <div class="tahun-arsip">

                    <h2>
                        ${tahun}
                    </h2>

                </div>

            `;


            // =================================================
            // PERIODE UNIK
            // =================================================

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


            // =================================================
            // LOOP PERIODE
            // =================================================

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
                        escapeHTML(
                            periode
                        )
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

                                    ${escapeHTML(
                                        periode
                                    )}

                                </h3>


                                <p>

                                    ${jumlah}
                                    Guru Besar Dikukuhkan

                                </p>


                            </div>


                            <div
                                class="arsip-arrow"
                            >

                                Lihat →

                            </div>


                        </div>

                    `;

                }
            );

        }
    );


    // ====================================================
    // TAMPILKAN
    // ====================================================

    list.innerHTML =
        htmlBuffer;


    // Pastikan tampilan normal

    selesaiSearchHP();

}


// ========================================================
// INISIALISASI
// ========================================================

ambilDataDariGoogleSheets();


// ========================================================
// TAMBAHAN:
// Ketika halaman selesai dimuat, pastikan tidak ada
// fokus otomatis ke search.
// ========================================================

window.addEventListener(
    "load",
    function() {

        if (searchInput) {

            searchInput.blur();

        }

    }
);


// ========================================================
// TAMBAHAN:
// Jika keyboard HP ditutup, lepaskan fokus dari search
// ========================================================

if (searchInput) {

    searchInput.addEventListener(
        "blur",
        function() {

            // Tidak melakukan apa-apa secara agresif.
            //
            // Browser bebas mengembalikan tampilan
            // sesuai perilakunya.

        }
    );

}
