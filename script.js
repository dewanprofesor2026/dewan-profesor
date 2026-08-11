// ========================================================
// DEWAN PROFESOR UNIVERSITAS ANDALAS
// SCRIPT.JS LENGKAP
//
// FITUR:
// 1. Ambil data dari Google Sheets via JSONP
// 2. Foto Google Drive
// 3. Slideshow foto + nama profesor
// 4. Efek 3D slideshow
// 5. Pencarian realtime
// 6. Enter untuk mencari
// 7. Highlight hasil pencarian
// 8. Scroll ke kartu profesor
// 9. Pemulihan tampilan setelah auto-zoom HP
// 10. Beranda
// 11. Arsip Pengukuhan
// 12. Detail periode
// 13. Tombol kembali
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

const btnBeranda =
    document.getElementById("btnBeranda");

const btnArsip =
    document.getElementById("btnArsip");


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
// KONVERSI LINK GOOGLE DRIVE
// ========================================================

function ubahLinkGoogleDrive(url) {

    if (!url) {
        return "";
    }

    url = String(url).trim();

    let fileId = "";

    const matchParamId =
        url.match(
            /[?&]id=([a-zA-Z0-9_-]+)/i
        );

    const matchPathId =
        url.match(
            /\/d\/([a-zA-Z0-9_-]+)/i
        );

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
// UBAH TANGGAL INDONESIA MENJADI DATE
// ========================================================

function ubahTanggal(teks) {

    if (!teks) {
        return new Date(0);
    }

    if (
        teks.includes("T") ||
        /^\d{4}-\d{2}-\d{2}/.test(teks)
    ) {

        const date = new Date(teks);

        if (!isNaN(date.getTime())) {
            return date;
        }
    }

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
// ESCAPE REGEX
// ========================================================

function escapeRegex(text) {

    return text.replace(
        /[-\/\\^$*+?.()|[\]{}]/g,
        "\\$&"
    );
}


// ========================================================
// ========================================================
// SLIDESHOW PROFESOR
// ========================================================
// Foto + nama profesor
// Efek 3D
// Otomatis bergerak
// ========================================================


// --------------------------------------------------------
// MEMASANG CSS SLIDESHOW
// --------------------------------------------------------

function pasangCSSSlideshow() {

    if (
        document.getElementById(
            "cssSlideshowProfesor"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "cssSlideshowProfesor";

    style.textContent = `

        /* =========================================
           CONTAINER UTAMA
        ========================================= */

        .profesor-slideshow {

            width: 100%;

            max-width: 850px;

            margin: 22px auto 10px;

            position: relative;

            overflow: hidden;

            height: 210px;

            display: flex;

            align-items: center;

            justify-content: center;

            perspective: 1000px;

            z-index: 5;

        }


        /* =========================================
           TRACK
        ========================================= */

        .profesor-slide-track {

            width: 100%;

            height: 100%;

            position: relative;

            display: flex;

            align-items: center;

            justify-content: center;

        }


        /* =========================================
           KARTU SLIDE
        ========================================= */

        .profesor-slide-card {

            position: absolute;

            width: 125px;

            height: 165px;

            border-radius: 18px;

            overflow: hidden;

            background: rgba(255,255,255,0.95);

            border: 3px solid rgba(255,255,255,0.9);

            box-shadow:
                0 12px 30px rgba(0,0,0,0.25);

            transition:
                transform 0.6s ease,
                opacity 0.6s ease,
                filter 0.6s ease,
                z-index 0.6s ease;

            cursor: pointer;

            user-select: none;

        }


        /* =========================================
           FOTO
        ========================================= */

        .profesor-slide-card img {

            width: 100%;

            height: 125px;

            object-fit: cover;

            object-position: center top;

            display: block;

            background: #eeeeee;

        }


        /* =========================================
           NAMA
        ========================================= */

        .profesor-slide-name {

            height: 40px;

            display: flex;

            align-items: center;

            justify-content: center;

            text-align: center;

            padding: 4px 6px;

            font-family: "Poppins",
                Arial,
                sans-serif;

            font-size: 11px;

            font-weight: 600;

            line-height: 1.15;

            color: #123b20;

            background: #ffffff;

        }


        /* =========================================
           POSISI TENGAH
        ========================================= */

        .profesor-slide-card.pos-center {

            transform:
                translateX(0)
                translateZ(80px)
                scale(1.12);

            opacity: 1;

            z-index: 10;

            filter: none;

        }


        /* =========================================
           KIRI DEKAT
        ========================================= */

        .profesor-slide-card.pos-left {

            transform:
                translateX(-145px)
                translateZ(0)
                scale(0.90)
                rotateY(12deg);

            opacity: 0.85;

            z-index: 5;

            filter: brightness(0.92);

        }


        /* =========================================
           KANAN DEKAT
        ========================================= */

        .profesor-slide-card.pos-right {

            transform:
                translateX(145px)
                translateZ(0)
                scale(0.90)
                rotateY(-12deg);

            opacity: 0.85;

            z-index: 5;

            filter: brightness(0.92);

        }


        /* =========================================
           KIRI JAUH
        ========================================= */

        .profesor-slide-card.pos-far-left {

            transform:
                translateX(-260px)
                translateZ(-80px)
                scale(0.70)
                rotateY(20deg);

            opacity: 0.45;

            z-index: 2;

            filter: brightness(0.80);

        }


        /* =========================================
           KANAN JAUH
        ========================================= */

        .profesor-slide-card.pos-far-right {

            transform:
                translateX(260px)
                translateZ(-80px)
                scale(0.70)
                rotateY(-20deg);

            opacity: 0.45;

            z-index: 2;

            filter: brightness(0.80);

        }


        /* =========================================
           KARTU LAIN
        ========================================= */

        .profesor-slide-card.pos-hidden {

            transform:
                translateX(0)
                scale(0.5);

            opacity: 0;

            z-index: 0;

            pointer-events: none;

        }


        /* =========================================
           TOMBOL KIRI KANAN
        ========================================= */

        .profesor-slide-arrow {

            position: absolute;

            top: 50%;

            transform:
                translateY(-50%);

            width: 32px;

            height: 32px;

            border: none;

            border-radius: 50%;

            background:
                rgba(255,255,255,0.90);

            color: #087b27;

            font-size: 16px;

            font-weight: bold;

            display: flex;

            align-items: center;

            justify-content: center;

            cursor: pointer;

            z-index: 20;

            box-shadow:
                0 4px 12px rgba(0,0,0,0.18);

            transition:
                transform 0.2s ease,
                background 0.2s ease;

        }


        .profesor-slide-arrow:hover {

            transform:
                translateY(-50%)
                scale(1.1);

            background: #ffffff;

        }


        .profesor-slide-prev {

            left: 8px;

        }


        .profesor-slide-next {

            right: 8px;

        }


        /* =========================================
           DOT
        ========================================= */

        .profesor-slide-dots {

            position: absolute;

            bottom: 0;

            left: 0;

            right: 0;

            display: flex;

            justify-content: center;

            gap: 5px;

            z-index: 30;

        }


        .profesor-slide-dot {

            width: 6px;

            height: 6px;

            border-radius: 50%;

            background:
                rgba(255,255,255,0.55);

            cursor: pointer;

            transition:
                all 0.3s ease;

        }


        .profesor-slide-dot.active {

            width: 18px;

            border-radius: 5px;

            background: #ffffff;

        }


        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 600px) {

            .profesor-slideshow {

                height: 185px;

                margin-top: 15px;

            }


            .profesor-slide-card {

                width: 105px;

                height: 145px;

            }


            .profesor-slide-card img {

                height: 108px;

            }


            .profesor-slide-name {

                height: 37px;

                font-size: 9px;

            }


            .profesor-slide-card.pos-left {

                transform:
                    translateX(-105px)
                    scale(0.82)
                    rotateY(10deg);

            }


            .profesor-slide-card.pos-right {

                transform:
                    translateX(105px)
                    scale(0.82)
                    rotateY(-10deg);

            }


            .profesor-slide-card.pos-far-left {

                transform:
                    translateX(-180px)
                    scale(0.65);

            }


            .profesor-slide-card.pos-far-right {

                transform:
                    translateX(180px)
                    scale(0.65);

            }


            .profesor-slide-arrow {

                width: 28px;

                height: 28px;

                font-size: 13px;

            }

        }

    `;

    document.head.appendChild(style);
}


// --------------------------------------------------------
// MEMBUAT HTML SLIDESHOW
// --------------------------------------------------------

function buatSlideshowProfesor() {

    if (!dataProfesor.length) {
        return;
    }

    pasangCSSSlideshow();

    // Hapus slideshow lama jika ada

    const lama =
        document.getElementById(
            "profesorSlideshow"
        );

    if (lama) {
        lama.remove();
    }


    // Cari tulisan Portal Digital...

    const header =
        document.querySelector("header");

    if (!header) {
        return;
    }

    const teksPortal =
        header.querySelector("p");

    if (!teksPortal) {
        return;
    }


    // Buat container

    const slideshow =
        document.createElement("div");

    slideshow.id =
        "profesorSlideshow";

    slideshow.className =
        "profesor-slideshow";


    // Track

    const track =
        document.createElement("div");

    track.className =
        "profesor-slide-track";


    // Tombol kiri

    const tombolPrev =
        document.createElement("button");

    tombolPrev.className =
        "profesor-slide-arrow profesor-slide-prev";

    tombolPrev.innerHTML =
        "‹";

    tombolPrev.setAttribute(
        "aria-label",
        "Profesor sebelumnya"
    );


    // Tombol kanan

    const tombolNext =
        document.createElement("button");

    tombolNext.className =
        "profesor-slide-arrow profesor-slide-next";

    tombolNext.innerHTML =
        "›";

    tombolNext.setAttribute(
        "aria-label",
        "Profesor berikutnya"
    );


    // Data yang mempunyai foto

    const dataFoto =
        dataProfesor.filter(
            item =>
                item.foto &&
                item.foto.trim() !== ""
        );


    if (dataFoto.length === 0) {
        return;
    }


    // Buat kartu

    dataFoto.forEach(
        (item, index) => {

            const card =
                document.createElement("div");

            card.className =
                "profesor-slide-card";

            card.dataset.index =
                index;


            const img =
                document.createElement("img");

            img.src =
                item.foto;

            img.alt =
                item.nama;

            img.loading =
                "lazy";

            img.referrerPolicy =
                "no-referrer";


            img.onerror =
                function() {

                    card.style.display =
                        "none";

                };


            const nama =
                document.createElement("div");

            nama.className =
                "profesor-slide-name";

            nama.textContent =
                item.nama;


            card.appendChild(img);

            card.appendChild(nama);


            // Klik kartu
            // membuka hasil profesor

            card.addEventListener(
                "click",
                function() {

                    if (searchInput) {

                        searchInput.value =
                            item.nama;

                        searchInput.dispatchEvent(
                            new Event("input")
                        );

                    }

                    const kartu =
                        document.querySelector(
                            "#listProfesor .card"
                        );

                    if (kartu) {

                        kartu.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    }

                }
            );


            track.appendChild(card);

        }
    );


    // Dots

    const dots =
        document.createElement("div");

    dots.className =
        "profesor-slide-dots";


    dataFoto.forEach(
        (item, index) => {

            const dot =
                document.createElement("span");

            dot.className =
                "profesor-slide-dot";

            dot.dataset.index =
                index;


            dot.addEventListener(
                "click",
                function(e) {

                    e.stopPropagation();

                    window.profesorSlideIndex =
                        index;

                    updateSlideshowProfesor();

                    mulaiAutoSlideProfesor();

                }
            );


            dots.appendChild(dot);

        }
    );


    slideshow.appendChild(track);

    slideshow.appendChild(
        tombolPrev
    );

    slideshow.appendChild(
        tombolNext
    );

    slideshow.appendChild(
        dots
    );


    // Letakkan tepat setelah tulisan Portal

    teksPortal.insertAdjacentElement(
        "afterend",
        slideshow
    );


    // Simpan data ke window

    window.profesorSlideData =
        dataFoto;

    window.profesorSlideIndex = 0;


    // Tombol kiri

    tombolPrev.onclick =
        function(e) {

            e.stopPropagation();

            geserSlideshowProfesor(-1);

        };


    // Tombol kanan

    tombolNext.onclick =
        function(e) {

            e.stopPropagation();

            geserSlideshowProfesor(1);

        };


    // Update awal

    updateSlideshowProfesor();

    mulaiAutoSlideProfesor();
}


// --------------------------------------------------------
// UPDATE POSISI SLIDESHOW
// --------------------------------------------------------

function updateSlideshowProfesor() {

    const cards =
        document.querySelectorAll(
            "#profesorSlideshow .profesor-slide-card"
        );

    const dots =
        document.querySelectorAll(
            "#profesorSlideshow .profesor-slide-dot"
        );


    if (!cards.length) {
        return;
    }


    const total =
        cards.length;

    const current =
        window.profesorSlideIndex || 0;


    cards.forEach(
        (card, index) => {

            card.className =
                "profesor-slide-card";


            let diff =
                index - current;


            // Atasi perputaran dari akhir ke awal

            if (diff > total / 2) {

                diff -= total;

            }

            if (diff < -total / 2) {

                diff += total;

            }


            if (diff === 0) {

                card.classList.add(
                    "pos-center"
                );

            } else if (diff === -1) {

                card.classList.add(
                    "pos-left"
                );

            } else if (diff === 1) {

                card.classList.add(
                    "pos-right"
                );

            } else if (diff === -2) {

                card.classList.add(
                    "pos-far-left"
                );

            } else if (diff === 2) {

                card.classList.add(
                    "pos-far-right"
                );

            } else {

                card.classList.add(
                    "pos-hidden"
                );

            }

        }
    );


    dots.forEach(
        (dot, index) => {

            dot.classList.toggle(
                "active",
                index === current
            );

        }
    );

}


// --------------------------------------------------------
// GESER SLIDESHOW
// --------------------------------------------------------

function geserSlideshowProfesor(
    arah
) {

    if (
        !window.profesorSlideData ||
        window.profesorSlideData.length === 0
    ) {
        return;
    }


    const total =
        window.profesorSlideData.length;


    window.profesorSlideIndex =
        (
            window.profesorSlideIndex +
            arah +
            total
        ) % total;


    updateSlideshowProfesor();

    mulaiAutoSlideProfesor();
}


// --------------------------------------------------------
// AUTO SLIDE
// --------------------------------------------------------

let timerSlideshowProfesor =
    null;


function mulaiAutoSlideProfesor() {

    if (timerSlideshowProfesor) {

        clearInterval(
            timerSlideshowProfesor
        );

    }


    timerSlideshowProfesor =
        setInterval(
            function() {

                geserSlideshowProfesor(1);

            },
            3500
        );

}


// ========================================================
// AUTO ZOOM HP
// ========================================================

function pulihkanZoomHP() {

    if (!searchInput) {
        return;
    }

    const scrollX =
        window.scrollX;

    const scrollY =
        window.scrollY;


    searchInput.blur();


    try {

        document.body.focus();

    } catch (error) {

        console.log(
            "Body tidak dapat difokuskan."
        );

    }


    window.scrollTo(
        scrollX,
        scrollY
    );


    setTimeout(
        function() {

            window.scrollTo({
                left: scrollX,
                top: scrollY,
                behavior: "instant"
            });

        },
        50
    );


    setTimeout(
        function() {

            window.scrollTo({
                left: scrollX,
                top: scrollY,
                behavior: "instant"
            });

        },
        150
    );


    setTimeout(
        function() {

            window.scrollTo({
                left: scrollX,
                top: scrollY,
                behavior: "instant"
            });

        },
        300
    );

}


// ========================================================
// RESET VIEWPORT HP
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
        viewport.getAttribute(
            "content"
        );


    viewport.setAttribute(
        "content",
        isiAsli
    );

}


// ========================================================
// SELESAI SEARCH HP
// ========================================================

function selesaiSearchHP() {

    if (searchInput) {
        searchInput.blur();
    }

    resetViewportHP();

    pulihkanZoomHP();

}


// ========================================================
// AMBIL DATA GOOGLE SHEETS
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


    const timeoutId =
        setTimeout(
            function() {

                cleanup();

                tampilkanErrorDatabase();

            },
            15000
        );


    function cleanup() {

        clearTimeout(
            timeoutId
        );


        if (
            window[callbackName]
        ) {

            delete window[
                callbackName
            ];

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

    window[callbackName] =
        function(data) {

            cleanup();


            try {

                if (
                    !Array.isArray(data)
                ) {

                    throw new Error(
                        "Format data tidak valid."
                    );

                }


                dataProfesor =
                    data.map(
                        item => ({

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

                        })
                    );


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
        document.createElement(
            "script"
        );


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

            <i
                class="fa-solid fa-circle-exclamation"
            ></i>

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

    if (
        dataProfesor.length === 0
    ) {

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
                    item =>
                        item.periode
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
    // INFORMASI
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


    // ====================================================
    // TAMPILKAN PERIODE TERBARU
    // ====================================================

    tampilkanData(
        profesorTerbaru
    );


    // ====================================================
    // BUAT SLIDESHOW
    // ====================================================

    buatSlideshowProfesor();

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


    if (
        !data ||
        data.length === 0
    ) {

        list.innerHTML = `

            <div class="data-kosong">

                <i
                    class="fa-solid fa-circle-exclamation"
                ></i>

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


    data.forEach(
        item => {


            // =========================================
            // HIGHLIGHT
            // =========================================

            const highlightText =
                text => {

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


            // =========================================
            // FOTO
            // =========================================

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


            // =========================================
            // BUKU
            // =========================================

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


            // =========================================
            // YOUTUBE
            // =========================================

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


            // =========================================
            // CARD
            // =========================================

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

        }
    );


    list.innerHTML =
        htmlBuffer;

}


// ========================================================
// SEARCH
// ========================================================

if (searchInput) {


    // ----------------------------------------------------
    // FOCUS
    // ----------------------------------------------------

    searchInput.addEventListener(
        "focus",
        function() {

            // Jangan mencegah auto zoom HP.

            console.log(
                "Search aktif."
            );

        }
    );


    // ----------------------------------------------------
    // REALTIME INPUT
    // ----------------------------------------------------

    searchInput.addEventListener(
        "input",
        function() {

            const keyword =
                searchInput.value
                    .toLowerCase()
                    .trim();


            if (
                keyword === ""
            ) {

                tampilkanData(
                    profesorTerbaru
                );

                return;

            }


            const hasil =
                dataProfesor.filter(
                    item =>

                        item.nama
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                        ||

                        item.fakultas
                            .toLowerCase()
                            .includes(
                                keyword
                            )
                );


            tampilkanData(
                hasil
            );

        }
    );


    // ----------------------------------------------------
    // ENTER
    // ----------------------------------------------------

    searchInput.addEventListener(
        "keydown",
        function(e) {

            if (
                e.key !== "Enter"
            ) {
                return;
            }


            e.preventDefault();


            const keyword =
                searchInput.value
                    .toLowerCase()
                    .trim();


            if (
                keyword === ""
            ) {

                tampilkanData(
                    profesorTerbaru
                );

                selesaiSearchHP();

                return;

            }


            const hasil =
                dataProfesor.filter(
                    item =>

                        item.nama
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                        ||

                        item.fakultas
                            .toLowerCase()
                            .includes(
                                keyword
                            )
                );


            if (
                hasil.length > 0
            ) {


                // Aktifkan Beranda

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


                const periodeBox =
                    document.querySelector(
                        ".periode-box"
                    );


                if (periodeBox) {

                    periodeBox.style.display =
                        "block";

                }


                tampilkanData(
                    hasil
                );


                // Lepaskan keyboard

                searchInput.blur();


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


                        const elementPosition =
                            kartuPertama
                                .getBoundingClientRect()
                                .top
                            +
                            window.pageYOffset;


                        const offsetPosition =
                            elementPosition - 20;


                        window.scrollTo({

                            top:
                                Math.max(
                                    0,
                                    offsetPosition
                                ),

                            behavior:
                                "smooth"

                        });


                        // Highlight

                        kartuPertama.style.transition =
                            "all 0.3s ease";


                        kartuPertama.style.boxShadow =
                            "0 0 0 4px #008000, 0 12px 30px rgba(0,0,0,0.25)";


                        setTimeout(
                            function() {

                                kartuPertama.style.boxShadow =
                                    "";

                            },
                            2000
                        );


                        setTimeout(
                            function() {

                                selesaiSearchHP();

                            },
                            350
                        );


                    },
                    150
                );


            } else {


                tampilkanData(
                    hasil
                );


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


    selesaiSearchHP();

}


// ========================================================
// TAMPILKAN ARSIP
// ========================================================

function tampilkanArsip() {

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


    const tahunUrut =
        Object.keys(
            kelompokTahun
        ).sort(
            (a, b) => b - a
        );


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


    tahunUrut.forEach(
        tahun => {

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


    list.innerHTML =
        htmlBuffer;


    selesaiSearchHP();

}


// ========================================================
// INISIALISASI
// ========================================================

ambilDataDariGoogleSheets();


// ========================================================
// SAAT HALAMAN SELESAI DIMUAT
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
// JIKA SLIDESHOW DIKLIK / DISENTUH
// HENTIKAN AUTO SLIDE SEMENTARA
// ========================================================

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.hidden
        ) {

            if (
                timerSlideshowProfesor
            ) {

                clearInterval(
                    timerSlideshowProfesor
                );

            }

        } else {

            mulaiAutoSlideProfesor();

        }

    }
);


// ========================================================
// SELESAI
// ========================================================
