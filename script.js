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
// 12. Tahun arsip berada di atas card periode
// ========================================================


// ========================================================
// URL GOOGLE APPS SCRIPT
// ========================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbyAFoztVoX6ZJ7ANsDTFLDJ5WcBOT8SneZZ9IgnAqLyu0Kz0ufoJERtdhe5iq0OCYH7qA/exec";


// ========================================================
// ELEMENT HTML
// ========================================================

const list =
    document.getElementById("listProfesor");

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

    if (
        str === null ||
        str === undefined
    ) {

        return "";

    }

    return String(str)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ========================================================
// KONVERSI LINK GOOGLE DRIVE KE GAMBAR
// ========================================================

function ubahLinkGoogleDrive(url) {

    if (!url) {

        return "";

    }

    url =
        String(url).trim();

    let fileId = "";


    // Format:
    // ?id=XXXXXXXX

    const matchParamId =
        url.match(
            /[?&]id=([a-zA-Z0-9\_-]+)/i
        );


    // Format:
    // /file/d/XXXXXXXX

    const matchPathId =
        url.match(
            /\/d\/([a-zA-Z0-9\_-]+)/i
        );


    // Jika langsung ID Drive

    const matchRawId =
        /^[a-zA-Z0-9\_-]{20,}$/.test(
            url
        );


    if (matchParamId) {

        fileId =
            matchParamId[1];

    }

    else if (matchPathId) {

        fileId =
            matchPathId[1];

    }

    else if (matchRawId) {

        fileId =
            url;

    }


    // Googleusercontent

    if (fileId) {

        return `https://lh3.googleusercontent.com/d/${fileId}`;

    }


    return url;

}


// ========================================================
// FORMAT TANGGAL
//
// PERBAIKAN TANGGAL:
// Tidak menggunakan new Date() untuk membaca bagian
// tanggal ISO secara langsung karena dapat menyebabkan
// tanggal mundur satu hari akibat timezone.
// ========================================================

function formatTanggal(tanggal) {

    if (!tanggal) {

        return "";

    }


    const teks =
        String(tanggal).trim();


    // ====================================================
    // FORMAT ISO DARI GOOGLE SHEETS
    //
    // Contoh:
    // 2026-06-27
    // 2026-06-27T00:00:00.000Z
    // ====================================================

    const matchISO =
        teks.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (matchISO) {

        const tahun =
            parseInt(
                matchISO[1],
                10
            );

        const bulan =
            parseInt(
                matchISO[2],
                10
            );

        const hari =
            parseInt(
                matchISO[3],
                10
            );


        if (

            !isNaN(hari) &&

            !isNaN(bulan) &&

            !isNaN(tahun) &&

            bulan >= 1 &&

            bulan <= 12

        ) {

            return `${hari} ${
                namaBulan[bulan - 1]
            } ${tahun}`;

        }

    }


    // ====================================================
    // FORMAT INDONESIA
    //
    // Contoh:
    // 27 Juni 2026
    // ====================================================

    const matchIndonesia =
        teks.match(
            /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/
        );


    if (matchIndonesia) {

        return teks;

    }


    // ====================================================
    // FALLBACK
    // ====================================================

    const date =
        new Date(tanggal);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return teks;

    }


    return `${date.getUTCDate()} ${
        namaBulan[date.getUTCMonth()]
    } ${date.getUTCFullYear()}`;

}


// ========================================================
// UBAH TANGGAL INDONESIA MENJADI OBJECT DATE
//
// PERBAIKAN:
// Untuk ISO YYYY-MM-DD, tanggal dibuat menggunakan
// tahun/bulan/tanggal lokal agar tidak bergeser timezone.
// ========================================================

function ubahTanggal(teks) {

    if (!teks) {

        return new Date(0);

    }


    const nilai =
        String(teks).trim();


    // ====================================================
    // FORMAT ISO
    //
    // Contoh:
    // 2026-06-27
    // 2026-06-27T00:00:00.000Z
    // ====================================================

    const matchISO =
        nilai.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (matchISO) {

        const tahun =
            parseInt(
                matchISO[1],
                10
            );

        const bulan =
            parseInt(
                matchISO[2],
                10
            );

        const tanggal =
            parseInt(
                matchISO[3],
                10
            );


        if (

            !isNaN(tahun) &&

            !isNaN(bulan) &&

            !isNaN(tanggal) &&

            bulan >= 1 &&

            bulan <= 12

        ) {

            return new Date(
                tahun,
                bulan - 1,
                tanggal
            );

        }

    }


    // ====================================================
    // FORMAT:
    // 27 Juni 2026
    // ====================================================

    const bagian =
        nilai.split(/\s+/);


    if (
        bagian.length < 3
    ) {

        return new Date(0);

    }


    const tanggal =
        parseInt(
            bagian[0],
            10
        );


    const bulan =
        namaBulan.indexOf(
            bagian[1]
        );


    const tahun =
        parseInt(
            bagian[2],
            10
        );


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
// ========================================================

function pulihkanZoomHP() {

    if (!searchInput) {

        return;

    }


    // Simpan posisi scroll

    const scrollX =
        window.scrollX;

    const scrollY =
        window.scrollY;


    // Lepaskan fokus

    searchInput.blur();


    // Coba fokus ke body

    try {

        document.body.focus();

    }

    catch (error) {

        console.log(
            "Body tidak dapat difokuskan."
        );

    }


    // Pertahankan posisi

    window.scrollTo(
        scrollX,
        scrollY
    );


    setTimeout(
        () => {

            window.scrollTo({

                left: scrollX,

                top: scrollY,

                behavior: "instant"

            });

        },
        50
    );


    setTimeout(
        () => {

            window.scrollTo({

                left: scrollX,

                top: scrollY,

                behavior: "instant"

            });

        },
        150
    );


    setTimeout(
        () => {

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
// MENGEMBALIKAN VIEWPORT HP
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
// PROSES SELESAI SEARCH
// ========================================================

function selesaiSearchHP() {

    if (searchInput) {

        searchInput.blur();

    }


    resetViewportHP();

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


    // Timeout 15 detik

    const timeoutId =
        setTimeout(
            () => {

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
    // CALLBACK GOOGLE SHEETS
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

            }

            catch (error) {

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

    const daftarPeriode = [

        ...new Set(

            dataProfesor.map(
                item =>
                    item.periode
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


    // ====================================================
    // DATA PROFESOR PERIODE TERBARU
    // ====================================================

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
// ========================================================

if (searchInput) {


    // ====================================================
    // SAAT SEARCH DIKLIK
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

            if (
                keyword === ""
            ) {

                tampilkanData(
                    profesorTerbaru
                );

                return;

            }


            // Cari berdasarkan nama
            // atau fakultas

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


            // Tampilkan hasil

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


            // ============================================
            // Jika kosong
            // ============================================

            if (
                keyword === ""
            ) {

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

            if (
                hasil.length > 0
            ) {


                // Pastikan Beranda aktif

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


                searchInput.blur();


                // Tunggu render

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


                        // Posisi kartu

                        const elementPosition =

                            kartuPertama
                                .getBoundingClientRect()
                                .top

                            +

                            window.pageYOffset;


                        const offsetPosition =
                            elementPosition - 20;


                        // Scroll

                        window.scrollTo({

                            top:

                                Math.max(
                                    0,
                                    offsetPosition
                                ),

                            behavior:
                                "smooth"

                        });


                        // Highlight card

                        kartuPertama.style.transition =
                            "all 0.3s ease";


                        kartuPertama.style.boxShadow =

                            "0 0 0 4px #008000, 0 12px 30px rgba(0,0,0,0.25)";


                        // Hilangkan highlight

                        setTimeout(

                            function() {

                                kartuPertama.style.boxShadow =
                                    "";

                            },

                            2000

                        );


                        // Pulihkan tampilan

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
//
// PERUBAHAN:
// Tahun sekarang menjadi satu kelompok dengan card
// periode di bawahnya.
//
// Contoh:
//
// 2025
// ┌──────────────────────────────┐
// │ 24 Juli 2025       Lihat →   │
// └──────────────────────────────┘
//
// 2026
// ┌──────────────────────────────┐
// │ 15 Januari 2026    Lihat →   │
// └──────────────────────────────┘
//
// Bagian lain tidak diubah.
// ========================================================

function tampilkanArsip() {

    if (!list) {

        return;

    }


    // ====================================================
    // HEADER ARSIP
    //
    // DIHILANGKAN sesuai permintaan terakhir Anda.
    // ====================================================

    let htmlBuffer = "";


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
        )

        .sort(
            (a, b) => b - a
        );


    // ====================================================
    // JIKA TIDAK ADA ARSIP
    // ====================================================

    if (
        tahunUrut.length === 0
    ) {


        list.innerHTML = `

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


            // =================================================
            // SATU KELOMPOK TAHUN
            //
            // TAHUN DAN CARD SEKARANG BERADA DALAM
            // SATU CONTAINER.
            // =================================================

            htmlBuffer += `

                <section
                    class="arsip-tahun-group"
                >

                    <div
                        class="tahun-arsip"
                    >

                        <h2>

                            ${escapeHTML(
                                tahun
                            )}

                        </h2>

                    </div>


                    <div
                        class="arsip-periode-list"
                    >

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


                    // Aman untuk onclick

                    const periodeSafe =

                        String(periode)

                            .replace(
                                /\\/g,
                                "\\\\"
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

                            <div
                                class="arsip-item-info"
                            >

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


            // =================================================
            // TUTUP KELOMPOK TAHUN
            // =================================================

            htmlBuffer += `

                    </div>

                </section>

            `;

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
// KETIKA HALAMAN SELESAI DIMUAT
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
// JIKA KEYBOARD HP DITUTUP
// ========================================================

if (searchInput) {

    searchInput.addEventListener(

        "blur",

        function() {

            // Tidak melakukan apa-apa secara agresif.
            // Browser bebas mengembalikan tampilan
            // sesuai perilakunya.

        }

    );

}
