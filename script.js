// ========================================================
// DEWAN PROFESOR UNIVERSITAS ANDALAS
// SCRIPT.JS LENGKAP
//
// FITUR:
// 1. Google Sheets JSONP
// 2. Google Drive Photo
// 3. Slideshow Foto Profesor 3D
// 4. Slideshow tanpa nama
// 5. Foto tengah besar
// 6. Foto kiri/kanan berhimpit dengan tengah
// 7. Efek bayangan foto
// 8. Auto slide 3,5 detik
// 9. Tombol kiri / kanan
// 10. Indicator dots
// 11. Klik foto slideshow → pencarian
// 12. Search realtime
// 13. Enter untuk pencarian
// 14. Highlight hasil
// 15. Scroll ke kartu profesor
// 16. Pemulihan auto-zoom HP
// 17. Beranda
// 18. Arsip Pengukuhan
// 19. Detail periode
// 20. Statistik
// ========================================================


// ========================================================
// URL GOOGLE APPS SCRIPT
// ========================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbyAFoztVoX6ZJ7ANsDTFLDJ5WcBOT8SneZZ9IgnAqLyu0Kz0ufoJERtdhe5iq0OCYH7qA/exec";


// ========================================================
// VARIABEL GLOBAL
// ========================================================

let dataProfesor = [];

let profesorTerbaru = [];

let periodeTerbaru = "";

let slideshowIndex = 0;

let slideshowTimer = null;

let slideshowData = [];


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
// ELEMENT HTML
// ========================================================

let list;
let searchInput;
let periodeAktif;
let jumlahPeriode;
let totalProfesor;
let totalBuku;
let totalVideo;
let btnBeranda;
let btnArsip;


// ========================================================
// ESCAPE HTML
// ========================================================

function escapeHTML(str) {

    if (
        str === null ||
        str === undefined
    ) {
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
// ESCAPE REGEX
// ========================================================

function escapeRegex(text) {

    return String(text).replace(
        /[-\/\\^$*+?.()|[\]{}]/g,
        "\\$&"
    );

}


// ========================================================
// GOOGLE DRIVE → GOOGLEUSERCONTENT
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
// UBAH TANGGAL INDONESIA KE DATE
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
        String(teks)
            .trim()
            .split(" ");

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
// INISIALISASI ELEMENT
// ========================================================

function initElements() {

    list =
        document.getElementById(
            "listProfesor"
        );

    searchInput =
        document.getElementById(
            "searchInput"
        );

    periodeAktif =
        document.getElementById(
            "periodeAktif"
        );

    jumlahPeriode =
        document.getElementById(
            "jumlahPeriode"
        );

    totalProfesor =
        document.getElementById(
            "totalProfesor"
        );

    totalBuku =
        document.getElementById(
            "totalBuku"
        );

    totalVideo =
        document.getElementById(
            "totalVideo"
        );

    btnBeranda =
        document.getElementById(
            "btnBeranda"
        );

    btnArsip =
        document.getElementById(
            "btnArsip"
        );
}


// ========================================================
// CSS SLIDESHOW
// CSS DIBUAT OTOMATIS DARI JAVASCRIPT
// ========================================================

function buatCSSSlideshow() {

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

        /* ==========================================
           SLIDESHOW UTAMA
        ========================================== */

        .profesor-slideshow {

            width: 100%;

            max-width: 1100px;

            margin: 25px auto 30px;

            position: relative;

            display: flex;

            align-items: center;

            justify-content: center;

            overflow: hidden;

            min-height: 300px;

            perspective: 1200px;

        }


        /* ==========================================
           AREA SLIDES
        ========================================== */

        .profesor-slide-stage {

            width: 100%;

            height: 300px;

            position: relative;

            display: flex;

            align-items: center;

            justify-content: center;

        }


        /* ==========================================
           FOTO
        ========================================== */

        .profesor-slide-card {

            position: absolute;

            width: 170px;

            height: 230px;

            border-radius: 18px;

            overflow: hidden;

            background: #ffffff;

            border: 4px solid #ffffff;

            box-shadow:
                0 15px 35px
                rgba(0,0,0,0.35);

            transition:
                transform 0.55s ease,
                opacity 0.55s ease,
                filter 0.55s ease,
                box-shadow 0.55s ease;

            cursor: pointer;

            user-select: none;

        }


        .profesor-slide-card img {

            width: 100%;

            height: 100%;

            display: block;

            object-fit: cover;

            object-position: center top;

        }


        /* ==========================================
           FOTO TENGAH
        ========================================== */

        .profesor-slide-card.center {

            width: 190px;

            height: 255px;

            z-index: 5;

            opacity: 1;

            transform:
                translateX(0)
                translateZ(80px)
                scale(1);

            box-shadow:
                0 20px 45px
                rgba(0,0,0,0.45);

        }


        /* ==========================================
           FOTO KIRI
        ========================================== */

        .profesor-slide-card.left {

            z-index: 3;

            opacity: 0.92;

            transform:
                translateX(-125px)
                translateZ(0)
                scale(0.82);

            filter: brightness(0.88);

        }


        /* ==========================================
           FOTO KANAN
        ========================================== */

        .profesor-slide-card.right {

            z-index: 3;

            opacity: 0.92;

            transform:
                translateX(125px)
                translateZ(0)
                scale(0.82);

            filter: brightness(0.88);

        }


        /* ==========================================
           FOTO YANG TIDAK TERLIHAT
        ========================================== */

        .profesor-slide-card.hidden {

            z-index: 1;

            opacity: 0;

            pointer-events: none;

            transform:
                translateX(0)
                translateZ(-150px)
                scale(0.5);

        }


        /* ==========================================
           TOMBOL NAVIGASI
        ========================================== */

        .profesor-slide-arrow {

            position: absolute;

            top: 50%;

            transform:
                translateY(-50%);

            width: 42px;

            height: 42px;

            border: none;

            border-radius: 50%;

            background:
                rgba(255,255,255,0.92);

            color: #008000;

            font-size: 20px;

            font-weight: bold;

            cursor: pointer;

            z-index: 10;

            box-shadow:
                0 5px 15px
                rgba(0,0,0,0.20);

            transition:
                0.25s ease;

        }


        .profesor-slide-arrow:hover {

            transform:
                translateY(-50%)
                scale(1.08);

            background: #ffffff;

            box-shadow:
                0 8px 20px
                rgba(0,0,0,0.30);

        }


        .profesor-slide-arrow.left-arrow {

            left: 20px;

        }


        .profesor-slide-arrow.right-arrow {

            right: 20px;

        }


        /* ==========================================
           DOTS
        ========================================== */

        .profesor-slide-dots {

            position: absolute;

            bottom: 4px;

            left: 50%;

            transform:
                translateX(-50%);

            display: flex;

            gap: 7px;

            z-index: 12;

        }


        .profesor-slide-dot {

            width: 8px;

            height: 8px;

            border-radius: 50%;

            border: none;

            padding: 0;

            background:
                rgba(255,255,255,0.60);

            cursor: pointer;

            transition:
                0.25s ease;

        }


        .profesor-slide-dot.active {

            width: 22px;

            border-radius: 10px;

            background: #008000;

        }


        /* ==========================================
           MOBILE
        ========================================== */

        @media (max-width: 700px) {

            .profesor-slideshow {

                min-height: 250px;

                margin-top: 15px;

            }


            .profesor-slide-stage {

                height: 250px;

            }


            .profesor-slide-card {

                width: 130px;

                height: 180px;

                border-radius: 14px;

            }


            .profesor-slide-card.center {

                width: 150px;

                height: 205px;

            }


            .profesor-slide-card.left {

                transform:
                    translateX(-90px)
                    translateZ(0)
                    scale(0.80);

            }


            .profesor-slide-card.right {

                transform:
                    translateX(90px)
                    translateZ(0)
                    scale(0.80);

            }


            .profesor-slide-arrow {

                width: 36px;

                height: 36px;

                font-size: 17px;

            }


            .profesor-slide-arrow.left-arrow {

                left: 8px;

            }


            .profesor-slide-arrow.right-arrow {

                right: 8px;

            }

        }

    `;

    document.head.appendChild(style);
}


// ========================================================
// MEMBUAT HTML SLIDESHOW
// DITEMPATKAN SETELAH HEADER
// ========================================================

function buatHTMLSlideshow() {

    if (
        document.getElementById(
            "profesorSlideshow"
        )
    ) {
        return;
    }

    const header =
        document.querySelector("header");

    if (!header) {
        return;
    }

    const paragrafHeader =
        header.querySelector("p");

    const slideshow =
        document.createElement("section");

    slideshow.id =
        "profesorSlideshow";

    slideshow.className =
        "profesor-slideshow";

    slideshow.innerHTML = `

        <button
            type="button"
            class="profesor-slide-arrow left-arrow"
            id="slideshowPrev"
            aria-label="Foto sebelumnya"
        >
            ‹
        </button>


        <div
            class="profesor-slide-stage"
            id="profesorSlideStage"
        ></div>


        <button
            type="button"
            class="profesor-slide-arrow right-arrow"
            id="slideshowNext"
            aria-label="Foto berikutnya"
        >
            ›
        </button>


        <div
            class="profesor-slide-dots"
            id="profesorSlideDots"
        ></div>

    `;

    if (paragrafHeader) {

        paragrafHeader.insertAdjacentElement(
            "afterend",
            slideshow
        );

    } else {

        header.appendChild(
            slideshow
        );

    }

    const prev =
        document.getElementById(
            "slideshowPrev"
        );

    const next =
        document.getElementById(
            "slideshowNext"
        );

    if (prev) {

        prev.addEventListener(
            "click",
            function() {

                slideshowSebelumnya();

                restartSlideshow();

            }
        );

    }

    if (next) {

        next.addEventListener(
            "click",
            function() {

                slideshowBerikutnya();

                restartSlideshow();

            }
        );

    }


    slideshow.addEventListener(
        "mouseenter",
        stopSlideshow
    );


    slideshow.addEventListener(
        "mouseleave",
        startSlideshow
    );
}


// ========================================================
// DATA SLIDESHOW
// MENGGUNAKAN FOTO PROFESOR YANG ADA DI GOOGLE SHEETS
// ========================================================

function siapkanDataSlideshow() {

    slideshowData =
        dataProfesor.filter(
            item =>
                item.foto &&
                item.foto.trim() !== ""
        );

    if (
        slideshowData.length === 0
    ) {

        const area =
            document.getElementById(
                "profesorSlideshow"
            );

        if (area) {
            area.style.display =
                "none";
        }

        return;
    }

    slideshowIndex = 0;

    renderSlideshow();

    startSlideshow();
}


// ========================================================
// RENDER SLIDESHOW
// ========================================================

function renderSlideshow() {

    const stage =
        document.getElementById(
            "profesorSlideStage"
        );

    const dots =
        document.getElementById(
            "profesorSlideDots"
        );

    if (!stage) {
        return;
    }

    stage.innerHTML = "";

    if (dots) {
        dots.innerHTML = "";
    }

    const jumlah =
        slideshowData.length;


    // ====================================================
    // BUAT 3 FOTO:
    // KIRI - TENGAH - KANAN
    // ====================================================

    for (
        let posisi = -1;
        posisi <= 1;
        posisi++
    ) {

        if (jumlah === 1 && posisi !== 0) {
            continue;
        }

        const index =
            (
                slideshowIndex +
                posisi +
                jumlah
            ) % jumlah;

        const item =
            slideshowData[index];

        const card =
            document.createElement("div");

        card.className =
            "profesor-slide-card";


        if (posisi === 0) {

            card.classList.add(
                "center"
            );

        } else if (posisi === -1) {

            card.classList.add(
                "left"
            );

        } else {

            card.classList.add(
                "right"
            );

        }


        const img =
            document.createElement("img");

        img.src =
            item.foto;

        img.alt =
            "Foto Guru Besar";

        img.loading =
            "lazy";

        img.referrerPolicy =
            "no-referrer";


        img.onerror =
            function() {

                card.style.display =
                    "none";

            };


        card.appendChild(img);


        // ================================================
        // KLIK FOTO
        // LANGSUNG CARI PROFESOR
        // ================================================

        card.addEventListener(
            "click",
            function() {

                if (posisi === 0) {

                    cariProfesorDariSlideshow(
                        item
                    );

                } else if (
                    posisi === -1
                ) {

                    slideshowSebelumnya();

                    restartSlideshow();

                } else {

                    slideshowBerikutnya();

                    restartSlideshow();

                }

            }
        );


        stage.appendChild(card);

    }


    // ====================================================
    // DOTS
    // ====================================================

    if (dots && jumlah > 1) {

        slideshowData.forEach(
            (item, index) => {

                const dot =
                    document.createElement(
                        "button"
                    );

                dot.type =
                    "button";

                dot.className =
                    "profesor-slide-dot";

                if (
                    index ===
                    slideshowIndex
                ) {

                    dot.classList.add(
                        "active"
                    );

                }

                dot.setAttribute(
                    "aria-label",
                    `Foto ${index + 1}`
                );

                dot.addEventListener(
                    "click",
                    function() {

                        slideshowIndex =
                            index;

                        renderSlideshow();

                        restartSlideshow();

                    }
                );

                dots.appendChild(dot);

            }
        );

    }

}


// ========================================================
// SLIDE BERIKUTNYA
// ========================================================

function slideshowBerikutnya() {

    if (
        slideshowData.length <= 1
    ) {
        return;
    }

    slideshowIndex =
        (
            slideshowIndex + 1
        ) %
        slideshowData.length;

    renderSlideshow();
}


// ========================================================
// SLIDE SEBELUMNYA
// ========================================================

function slideshowSebelumnya() {

    if (
        slideshowData.length <= 1
    ) {
        return;
    }

    slideshowIndex =
        (
            slideshowIndex - 1 +
            slideshowData.length
        ) %
        slideshowData.length;

    renderSlideshow();
}


// ========================================================
// AUTO SLIDESHOW
// 3,5 DETIK
// ========================================================

function startSlideshow() {

    stopSlideshow();

    if (
        slideshowData.length <= 1
    ) {
        return;
    }

    slideshowTimer =
        setInterval(
            function() {

                slideshowBerikutnya();

            },
            3500
        );
}


// ========================================================
// STOP SLIDESHOW
// ========================================================

function stopSlideshow() {

    if (slideshowTimer) {

        clearInterval(
            slideshowTimer
        );

        slideshowTimer = null;

    }

}


// ========================================================
// RESTART SLIDESHOW
// ========================================================

function restartSlideshow() {

    stopSlideshow();

    startSlideshow();

}


// ========================================================
// JIKA TAB BROWSER DITINGGALKAN
// HENTIKAN SLIDESHOW
// ========================================================

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.hidden
        ) {

            stopSlideshow();

        } else {

            startSlideshow();

        }

    }
);


// ========================================================
// KLIK FOTO TENGAH
// CARI PROFESOR
// ========================================================

function cariProfesorDariSlideshow(
    profesor
) {

    if (!searchInput || !profesor) {
        return;
    }

    searchInput.value =
        profesor.nama;

    searchInput.dispatchEvent(
        new Event("input", {
            bubbles: true
        })
    );

    searchInput.blur();


    const hasil =
        dataProfesor.filter(
            item =>
                item.id === profesor.id
                ||
                item.nama === profesor.nama
        );


    if (hasil.length > 0) {

        tampilkanData(
            hasil
        );

        setTimeout(
            function() {

                const kartu =
                    document.querySelector(
                        "#listProfesor .card"
                    );

                if (!kartu) {
                    return;
                }

                const posisi =
                    kartu
                        .getBoundingClientRect()
                        .top +
                    window.pageYOffset;

                window.scrollTo({

                    top:
                        Math.max(
                            0,
                            posisi - 20
                        ),

                    behavior:
                        "smooth"

                });

                kartu.style.transition =
                    "all 0.3s ease";

                kartu.style.boxShadow =
                    "0 0 0 4px #008000, 0 12px 30px rgba(0,0,0,0.25)";


                setTimeout(
                    function() {

                        kartu.style.boxShadow =
                            "";

                    },
                    2000
                );

            },
            150
        );

    }

}


// ========================================================
// PEMULIHAN ZOOM HP
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
// TAMPILKAN ERROR DATABASE
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
// AMBIL DATA GOOGLE SHEETS
// JSONP
// ========================================================

function ambilDataDariGoogleSheets() {

    if (list) {

        list.innerHTML = `

            <div class="data-kosong">

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

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
                                item.id ||
                                "",

                            periode:
                                formatTanggal(
                                    item.periode
                                ),

                            nama:
                                item.nama ||
                                "",

                            fakultas:
                                item.fakultas ||
                                "",

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
    // SIAPKAN PERIODE
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
    // UPDATE STATISTIK
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
    // TAMPILKAN DATA
    // ====================================================

    tampilkanData(
        profesorTerbaru
    );


    // ====================================================
    // SLIDESHOW
    // ====================================================

    buatCSSSlideshow();

    buatHTMLSlideshow();

    siapkanDataSlideshow();

}


// ========================================================
// RENDER KARTU PROFESOR
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

            const highlightText =
                function(text) {

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


            // ==========================================
            // FOTO
            // ==========================================

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

                <div
                    class="photo-placeholder"
                >

                    <i
                        class="fa-solid fa-user"
                    ></i>

                </div>

                `;


            // ==========================================
            // BUKU
            // ==========================================

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


            // ==========================================
            // YOUTUBE
            // ==========================================

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


            // ==========================================
            // CARD
            // ==========================================

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

function pasangEventSearch() {

    if (!searchInput) {
        return;
    }


    // ====================================================
    // FOCUS
    // AUTO ZOOM HP TETAP DIBIARKAN
    // ====================================================

    searchInput.addEventListener(
        "focus",
        function() {

            console.log(
                "Search aktif."
            );

        }
    );


    // ====================================================
    // REALTIME INPUT
    // ====================================================

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
                            .includes(keyword)

                        ||

                        item.fakultas
                            .toLowerCase()
                            .includes(keyword)
                );


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
                            .includes(keyword)

                        ||

                        item.fakultas
                            .toLowerCase()
                            .includes(keyword)
                );


            // ==========================================
            // JIKA DITEMUKAN
            // ==========================================

            if (
                hasil.length > 0
            ) {

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

function pasangEventBeranda() {

    if (!btnBeranda) {
        return;
    }


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

function pasangEventArsip() {

    if (!btnArsip) {
        return;
    }


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
// DETAIL PERIODE
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

                <div
                    class="photo-placeholder"
                >

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
                        String(
                            periode
                        ).replace(
                            /\\/g,
                            "\\\\"
                        ).replace(
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
// INISIALISASI WEBSITE
// ========================================================

function initPortal() {

    initElements();

    buatCSSSlideshow();

    buatHTMLSlideshow();

    pasangEventSearch();

    pasangEventBeranda();

    pasangEventArsip();

    ambilDataDariGoogleSheets();

}


// ========================================================
// JALANKAN SETELAH HTML SELESAI
// ========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initPortal
    );

} else {

    initPortal();

}


// ========================================================
// LOAD
// PASTIKAN SEARCH TIDAK AUTO FOCUS
// ========================================================

window.addEventListener(
    "load",
    function() {

        if (searchInput) {

            searchInput.blur();

        }

    }
);
