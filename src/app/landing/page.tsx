"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
    const router = useRouter();
    const [navScrolled, setNavScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Navbar scroll effect
    useEffect(() => {
        const handleScroll = () => setNavScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Reveal on scroll
    useEffect(() => {
        const revealElements = document.querySelectorAll(".reveal");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add("visible");
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );
        revealElements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // Counter animation
    useEffect(() => {
        const statsSection = document.getElementById("stats");
        if (!statsSection) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        document.querySelectorAll("#stats h3[data-target]").forEach((counter) => {
                            const target = parseInt(counter.getAttribute("data-target") || "0");
                            const suffix = counter.getAttribute("data-suffix") || "";
                            const prefix = counter.getAttribute("data-prefix") || "";
                            let current = 0;
                            const increment = Math.ceil(target / 60);
                            const timer = setInterval(() => {
                                current += increment;
                                if (current >= target) {
                                    current = target;
                                    clearInterval(timer);
                                }
                                counter.textContent = prefix + current + suffix;
                            }, 20);
                        });
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.3 }
        );
        observer.observe(statsSection);
        return () => observer.disconnect();
    }, []);

    const navigateToLogin = () => router.push("/auth/login");

    return (
        <div className="bg-white text-slate-800 font-sans antialiased overflow-x-hidden leading-relaxed">
            {/* ===== NAVBAR ===== */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navScrolled
                        ? "bg-white/85 backdrop-blur-xl border-b border-slate-200 py-3"
                        : "bg-transparent py-4"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <a href="#" className="flex items-center gap-2.5 font-display text-xl font-extrabold text-slate-900">
                        Kidney<span className="gradient-text">Stone</span> AI
                    </a>

                    <div className="hidden lg:flex items-center gap-8">
                        {[
                            { href: "#features", label: "Fitur" },
                            { href: "#how-it-works", label: "Cara Kerja" },
                            { href: "#kidney-info", label: "Tentang" },
                            { href: "#tech", label: "Teknologi" },
                            { href: "#faq", label: "FAQ" },
                        ].map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-primary-500 after:to-accent-500 hover:after:w-full after:transition-all"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={navigateToLogin}
                            className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all"
                        >
                            Masuk
                        </button>
                        <button
                            onClick={navigateToLogin}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/35 hover:-translate-y-0.5 transition-all"
                        >
                            Mulai Gratis
                        </button>
                        <button
                            className="lg:hidden text-slate-700"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="material-symbols-outlined text-[28px]">
                                {mobileMenuOpen ? "close" : "menu"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-slate-200 px-6 py-4 space-y-3">
                        {[
                            { href: "#features", label: "Fitur" },
                            { href: "#how-it-works", label: "Cara Kerja" },
                            { href: "#kidney-info", label: "Tentang" },
                            { href: "#tech", label: "Teknologi" },
                            { href: "#faq", label: "FAQ" },
                        ].map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm font-medium text-slate-600 hover:text-primary-600 py-2"
                            >
                                {link.label}
                            </a>
                        ))}
                        <button
                            onClick={navigateToLogin}
                            className="w-full text-center px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white mt-2"
                        >
                            Masuk
                        </button>
                    </div>
                )}
            </nav>

            {/* ===== HERO ===== */}
            <section id="hero" className="relative min-h-screen flex items-center bg-gradient-to-b from-slate-50 via-white to-white overflow-hidden pt-20">
                <div className="absolute -top-52 -right-52 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.07),transparent_70%)] pointer-events-none" />
                <div className="absolute -bottom-32 -left-40 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06),transparent_70%)] pointer-events-none" />
                <div className="grid-overlay absolute inset-0 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-20 items-center py-12">
                    <div className="max-w-xl lg:max-w-none">
                        <h1 className="animate-fade-in-up-1 font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.1] mb-6 text-slate-900">
                            Deteksi <span className="gradient-text">Batu Ginjal</span> Lebih Cepat &amp; Akurat dengan AI
                        </h1>
                        <p className="animate-fade-in-up-2 text-lg text-slate-500 leading-relaxed mb-10">
                            KidneyStone AI menggunakan teknologi YOLO deep learning untuk menganalisis citra CT scan ginjal secara otomatis, membantu tenaga medis mendiagnosis batu ginjal dengan akurasi tinggi dalam hitungan detik.
                        </p>
                        <div className="animate-fade-in-up-3 flex flex-wrap gap-4">
                            <button
                                onClick={navigateToLogin}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/35 hover:-translate-y-0.5 transition-all"
                            >
                                Coba Sekarang
                            </button>
                            <a
                                href="#how-it-works"
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold border border-slate-200 text-slate-700 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all"
                            >
                                <span className="material-symbols-outlined text-xl">play_circle</span>
                                Lihat Cara Kerja
                            </a>
                        </div>
                        <div className="animate-fade-in-up-4 flex gap-10 mt-12 pt-8 border-t border-slate-200">
                            <div>
                                <h3 className="font-display text-2xl font-extrabold gradient-text-stat">95%+</h3>
                                <p className="text-xs text-slate-400 mt-1">Akurasi Deteksi</p>
                            </div>
                            <div>
                                <h3 className="font-display text-2xl font-extrabold gradient-text-stat">&lt;3 dtk</h3>
                                <p className="text-xs text-slate-400 mt-1">Waktu Analisis</p>
                            </div>
                            <div>
                                <h3 className="font-display text-2xl font-extrabold gradient-text-stat">24/7</h3>
                                <p className="text-xs text-slate-400 mt-1">Tersedia Kapanpun</p>
                            </div>
                        </div>
                    </div>

                    {/* Visual Card */}
                    <div className="relative flex justify-center items-center animate-fade-in order-first lg:order-last">
                        <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                </div>
                                <span className="text-xs text-slate-400 ml-auto">KidneyStone AI Scanner</span>
                            </div>
                            <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 rounded-xl h-56 flex items-center justify-center mb-5 overflow-hidden">
                                <span className="material-symbols-outlined text-[80px] text-primary-200">radiology</span>
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                    <div className="scan-crosshair w-28 h-28 border-2 border-primary-300/50 rounded-full relative animate-pulse-ring" />
                                    <span className="text-[0.7rem] font-semibold tracking-widest uppercase text-primary-500">Analyzing CT Scan...</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                                    Klasifikasi: Batu Ginjal Terdeteksi
                                </div>
                                <span className="text-sm font-bold text-emerald-600">96.8%</span>
                            </div>
                        </div>
                        <div className="hidden md:flex absolute -top-5 -right-8 items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-emerald-600 shadow-lg animate-float">
                            <span className="material-symbols-outlined text-lg">verified</span>
                            Akurasi Tinggi
                        </div>
                        <div className="hidden md:flex absolute -bottom-4 -left-8 items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-primary-600 shadow-lg animate-float-delayed">
                            <span className="material-symbols-outlined text-lg">speed</span>
                            Real-time
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section id="features" className="py-28 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 reveal">
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight mb-4 text-slate-900">
                            Semua yang Anda Butuhkan untuk <br /><span className="gradient-text">Diagnosis Batu Ginjal</span>
                        </h2>
                        <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                            Platform lengkap yang dirancang untuk membantu tenaga medis dalam mendeteksi, mengklasifikasi, dan mengelola data pasien batu ginjal secara efisien.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard icon="radiology" title="Deteksi Otomatis AI" desc="Upload citra CT scan dan dapatkan hasil klasifikasi batu ginjal secara otomatis menggunakan model YOLO yang terlatih dengan ribuan data medis." iconBg="bg-primary-50 text-primary-500" hoverBorder="hover:border-primary-200" />
                        <FeatureCard icon="analytics" title="Dashboard Analitik" desc="Pantau statistik klasifikasi, distribusi jenis batu ginjal, tren akurasi, dan metrik penting lainnya melalui dashboard visual yang interaktif." iconBg="bg-accent-50 text-accent-500" hoverBorder="hover:border-accent-200" />
                        <FeatureCard icon="groups" title="Manajemen Pasien" desc="Kelola data pasien secara terstruktur — tambah, edit, dan lihat riwayat pemeriksaan beserta hasil scan setiap pasien dengan mudah." iconBg="bg-emerald-50 text-emerald-500" hoverBorder="hover:border-emerald-200" />
                        <FeatureCard icon="description" title="Laporan AI Otomatis" desc="Dapatkan deskripsi hasil analisis yang dihasilkan oleh Gemini AI secara otomatis, memudahkan tenaga medis dalam membuat laporan diagnosis." iconBg="bg-amber-50 text-amber-500" hoverBorder="hover:border-amber-200" />
                        <FeatureCard icon="shield" title="Keamanan Data" desc="Sistem autentikasi yang aman untuk melindungi data pasien dan hasil pemeriksaan. Data medis tersimpan dengan standar keamanan tinggi." iconBg="bg-red-50 text-red-500" hoverBorder="hover:border-red-200" />
                        <FeatureCard icon="smart_toy" title="Chatbot Asisten" desc="Asisten AI siap membantu menjawab pertanyaan seputar batu ginjal, memberikan informasi medis, dan membimbing penggunaan platform." iconBg="bg-cyan-50 text-cyan-500" hoverBorder="hover:border-cyan-200" />
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section id="how-it-works" className="py-28 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 reveal">
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight mb-4 text-slate-900">
                            Proses Analisis dalam <span className="gradient-text">4 Langkah Mudah</span>
                        </h2>
                        <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                            Dari upload gambar hingga mendapatkan hasil diagnosis — semua dilakukan secara otomatis oleh sistem AI kami.
                        </p>
                    </div>
                    <div className="steps-line relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StepCard step={1} icon="cloud_upload" title="Upload CT Scan" desc="Upload gambar CT scan ginjal pasien ke dalam sistem melalui antarmuka yang sederhana dan intuitif." />
                        <StepCard step={2} icon="model_training" title="Analisis AI" desc="Model YOLO deep learning menganalisis citra secara otomatis untuk mendeteksi keberadaan dan jenis batu ginjal." />
                        <StepCard step={3} icon="fact_check" title="Hasil Klasifikasi" desc="Sistem menampilkan hasil deteksi lengkap dengan tingkat kepercayaan (confidence score) dan bounding box." />
                        <StepCard step={4} icon="summarize" title="Laporan & Deskripsi" desc="AI menghasilkan deskripsi hasil analisis secara otomatis untuk memudahkan dokumentasi dan pelaporan medis." />
                    </div>
                </div>
            </section>

            {/* ===== KIDNEY INFO ===== */}
            <section id="kidney-info" className="py-28 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    <div className="reveal order-first">
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-lg shadow-slate-100">
                            <h3 className="text-center font-display text-base font-bold text-slate-900 mb-5">Klasifikasi Batu Ginjal</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: "opacity", name: "Kalsium Oksalat", desc: "Jenis paling umum (~80%)" },
                                    { icon: "science", name: "Asam Urat", desc: "Terkait pola makan" },
                                    { icon: "microbiology", name: "Struvit", desc: "Akibat infeksi saluran kemih" },
                                    { icon: "genetics", name: "Sistin", desc: "Kelainan genetik langka" },
                                ].map((item) => (
                                    <div key={item.name} className="p-4 bg-primary-50/60 border border-slate-200 rounded-xl text-center transition-all hover:border-primary-400 hover:bg-primary-50">
                                        <span className="material-symbols-outlined text-[28px] text-primary-500 block mb-2">{item.icon}</span>
                                        <h4 className="text-sm font-bold text-slate-900 mb-1">{item.name}</h4>
                                        <p className="text-xs text-slate-400">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="reveal">
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight mb-4 text-slate-900">
                            Mengapa Deteksi Dini <span className="gradient-text">Sangat Penting?</span>
                        </h2>
                        <p className="text-base text-slate-500 max-w-xl leading-relaxed mb-8">
                            Batu ginjal (nefrolitiasis) dialami oleh sekitar 12% populasi dunia seumur hidup mereka. Deteksi dini dapat mencegah komplikasi serius dan mengurangi biaya pengobatan.
                        </p>
                        <div className="flex flex-col gap-5">
                            {[
                                { icon: "trending_up", title: "Prevalensi Meningkat", desc: "Kasus batu ginjal meningkat 70% dalam 30 tahun terakhir, terutama di negara berkembang akibat perubahan gaya hidup dan pola makan." },
                                { icon: "schedule", title: "Diagnosis Lebih Cepat", desc: "AI dapat menganalisis CT scan dalam hitungan detik, dibandingkan proses manual yang memerlukan waktu lebih lama dan bergantung pada ketersediaan radiolog." },
                                { icon: "savings", title: "Efisiensi Biaya", desc: "Deteksi dini dapat mengurangi biaya pengobatan hingga 50% karena mencegah intervensi bedah yang lebih kompleks dan mahal." },
                                { icon: "repeat", title: "Tingkat Kekambuhan Tinggi", desc: "Sekitar 50% pasien batu ginjal mengalami kekambuhan dalam 5-10 tahun. Monitoring rutin sangat penting untuk pencegahan." },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-4 items-start">
                                    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[22px] text-primary-500">{item.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TECH STACK ===== */}
            <section id="tech" className="py-28 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 reveal">
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight mb-4 text-slate-900">
                            Dibangun dengan <span className="gradient-text">Teknologi Terdepan</span>
                        </h2>
                        <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                            Menggunakan stack teknologi modern yang terbukti handal untuk memastikan performa, akurasi, dan skalabilitas sistem.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: "visibility", title: "YOLOv8", desc: "Model object detection terbaru untuk deteksi batu ginjal real-time dengan akurasi tinggi pada citra CT scan.", bg: "bg-primary-50 text-primary-500", hover: "hover:border-primary-200" },
                            { icon: "auto_awesome", title: "Gemini AI", desc: "Large Language Model dari Google untuk menghasilkan deskripsi dan laporan analisis medis secara otomatis.", bg: "bg-accent-50 text-accent-500", hover: "hover:border-accent-200" },
                            { icon: "code", title: "Next.js", desc: "Framework React modern untuk membangun antarmuka pengguna yang responsif, cepat, dan SEO-friendly.", bg: "bg-emerald-50 text-emerald-500", hover: "hover:border-emerald-200" },
                            { icon: "terminal", title: "Flask API", desc: "Backend Python ringan untuk melayani model AI, mengelola data pasien, dan menangani proses autentikasi.", bg: "bg-amber-50 text-amber-500", hover: "hover:border-amber-200" },
                        ].map((item) => (
                            <div key={item.title} className={`reveal bg-white border border-slate-200 rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 ${item.hover}`}>
                                <div className={`w-16 h-16 rounded-2xl ${item.bg} mx-auto mb-4 flex items-center justify-center`}>
                                    <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
                                </div>
                                <h3 className="font-display text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== STATISTICS ===== */}
            <section id="stats" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 reveal">
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight mb-4 text-slate-900">
                            Dampak <span className="gradient-text">Batu Ginjal</span> dalam Angka
                        </h2>
                        <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                            Data global yang menunjukkan pentingnya inovasi dalam deteksi dan penanganan batu ginjal.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: "public", value: "12", suffix: "%", label: "Populasi dunia berisiko mengalami batu ginjal seumur hidup" },
                            { icon: "male", value: "2", suffix: "×", label: "Laki-laki lebih berisiko terkena batu ginjal dibanding perempuan" },
                            { icon: "replay", value: "50", suffix: "%", label: "Tingkat kekambuhan batu ginjal dalam 5-10 tahun tanpa pencegahan" },
                            { icon: "payments", value: "10", prefix: "$", suffix: "B+", label: "Biaya perawatan batu ginjal per tahun di Amerika Serikat" },
                        ].map((item) => (
                            <div key={item.icon} className="reveal group bg-white border border-slate-200 rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="material-symbols-outlined text-4xl text-primary-400 mb-3 block">{item.icon}</span>
                                <h3
                                    className="font-display text-4xl font-extrabold mb-1 gradient-text-stat"
                                    data-target={item.value}
                                    data-suffix={item.suffix}
                                    data-prefix={item.prefix || ""}
                                >
                                    {(item.prefix || "") + item.value + item.suffix}
                                </h3>
                                <p className="text-sm text-slate-500">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FAQ ===== */}
            <FAQSection />

            {/* ===== CTA ===== */}
            <section className="py-28 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="reveal relative bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl py-20 px-8 md:px-16 text-center overflow-hidden">
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.06),transparent_70%)] pointer-events-none" />
                        <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight mb-4 text-slate-900 max-w-xl mx-auto relative z-10">
                            Siap Meningkatkan Akurasi <span className="gradient-text">Diagnosis Anda?</span>
                        </h2>
                        <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed mb-10 relative z-10">
                            Bergabunglah dan manfaatkan teknologi AI untuk membantu mendeteksi batu ginjal lebih cepat, akurat, dan efisien.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap relative z-10">
                            <button
                                onClick={() => router.push("/auth/register")}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/35 hover:-translate-y-0.5 transition-all"
                            >
                                <span className="material-symbols-outlined text-xl">person_add</span>
                                Daftar Sekarang
                            </button>
                            <button
                                onClick={navigateToLogin}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold border border-slate-200 text-slate-700 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all"
                            >
                                <span className="material-symbols-outlined text-xl">mail</span>
                                Hubungi Kami
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="pt-20 pb-8 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
                        <div className="max-w-xs">
                            <a href="#" className="flex items-center gap-2.5 font-display text-xl font-extrabold mb-4 text-slate-900">
                                Kidney<span className="gradient-text">Stone</span> AI
                            </a>
                            <p className="text-sm text-slate-500 leading-relaxed mb-5">
                                Platform deteksi batu ginjal berbasis kecerdasan buatan yang membantu tenaga medis dalam mendiagnosis secara lebih cepat, akurat, dan efisien.
                            </p>
                            <div className="flex gap-3">
                                {[
                                    { icon: "code", label: "GitHub" },
                                    { icon: "business_center", label: "LinkedIn" },
                                    { icon: "mail", label: "Email" },
                                ].map((s) => (
                                    <a key={s.label} href="#" aria-label={s.label} className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-500 transition-all">
                                        <span className="material-symbols-outlined text-xl">{s.icon}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-display text-sm font-bold text-slate-900 mb-5">Produk</h4>
                            <ul className="flex flex-col gap-3 list-none p-0">
                                {["Deteksi AI", "Dashboard", "Manajemen Pasien", "Laporan Analisis"].map((l) => (
                                    <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-display text-sm font-bold text-slate-900 mb-5">Informasi</h4>
                            <ul className="flex flex-col gap-3 list-none p-0">
                                {["Tentang Kami", "Batu Ginjal", "Cara Kerja AI", "Blog & Artikel"].map((l) => (
                                    <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-display text-sm font-bold text-slate-900 mb-5">Dukungan</h4>
                            <ul className="flex flex-col gap-3 list-none p-0">
                                {["Pusat Bantuan", "FAQ", "Kontak", "Kebijakan Privasi"].map((l) => (
                                    <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-slate-400">&copy; 2026 KidneyStone AI — All rights reserved.</p>
                        <p className="text-xs text-slate-400">Dibuat dengan ❤️ untuk kemajuan dunia medis</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* ===== Sub-Components ===== */

function FeatureCard({ icon, title, desc, iconBg, hoverBorder }: { icon: string; title: string; desc: string; iconBg: string; hoverBorder: string }) {
    return (
        <div className={`reveal group relative bg-white border border-slate-200 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 ${hoverBorder} overflow-hidden`}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-5`}>
                <span className="material-symbols-outlined text-[28px]">{icon}</span>
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
        </div>
    );
}

function StepCard({ step, icon, title, desc }: { step: number; icon: string; title: string; desc: string }) {
    return (
        <div className="reveal text-center relative">
            <div className="w-[88px] h-[88px] rounded-full mx-auto mb-6 flex items-center justify-center bg-white border-2 border-slate-200 relative z-10 transition-all hover:border-primary-400 hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                <span className="material-symbols-outlined text-4xl gradient-text">{icon}</span>
            </div>
            <span className="text-[0.7rem] font-bold text-primary-500 tracking-[2px] uppercase mb-2 block">Langkah {step}</span>
            <h3 className="font-display text-base font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
        </div>
    );
}

function FAQSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const faqs = [
        { q: "Apa itu KidneyStone AI?", a: "KidneyStone AI adalah sistem berbasis kecerdasan buatan yang dirancang untuk membantu tenaga medis dalam mendeteksi dan mengklasifikasi batu ginjal dari citra CT scan secara otomatis. Sistem ini menggunakan model YOLOv8 deep learning yang telah dilatih dengan ribuan data citra medis untuk memberikan hasil yang akurat dan cepat." },
        { q: "Seberapa akurat hasil deteksi AI?", a: "Model AI kami memiliki tingkat akurasi di atas 95% dalam mendeteksi keberadaan batu ginjal pada citra CT scan. Setiap hasil dilengkapi dengan confidence score sehingga tenaga medis dapat menilai tingkat kepercayaan prediksi. Namun, hasil AI tetap bersifat alat bantu dan keputusan akhir tetap ada pada dokter." },
        { q: "Apakah data pasien aman?", a: "Ya, keamanan data pasien adalah prioritas utama kami. Sistem menggunakan autentikasi berlapis, enkripsi data, dan penyimpanan yang aman. Semua data medis hanya dapat diakses oleh pengguna yang terautentikasi dan memiliki otorisasi yang sesuai." },
        { q: "Format gambar apa yang didukung?", a: "Sistem mendukung berbagai format gambar termasuk JPEG, PNG, dan format citra medis standar. Gambar CT scan dapat diupload langsung melalui antarmuka web yang telah disediakan. Sistem akan secara otomatis memproses dan menganalisis gambar yang diupload." },
        { q: "Apakah sistem ini menggantikan peran dokter?", a: "Tidak. KidneyStone AI dirancang sebagai alat bantu (decision support tool) untuk tenaga medis, bukan pengganti. Sistem ini membantu mempercepat proses skrining dan memberikan second opinion berbasis AI. Diagnosis dan keputusan pengobatan akhir tetap sepenuhnya menjadi tanggung jawab dokter yang menangani pasien." },
        { q: "Bagaimana cara mulai menggunakan platform ini?", a: "Untuk mulai menggunakan KidneyStone AI, Anda cukup mendaftar akun melalui halaman registrasi, kemudian login ke dashboard. Setelah login, Anda dapat langsung mulai mengupload citra CT scan, mengelola data pasien, dan melihat hasil analisis AI melalui antarmuka yang intuitif." },
    ];

    return (
        <section id="faq" className="py-28 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 reveal">
                    <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight mb-4 text-slate-900">
                        Pertanyaan yang <span className="gradient-text">Sering Ditanyakan</span>
                    </h2>
                    <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                        Temukan jawaban atas pertanyaan umum tentang sistem KidneyStone AI dan cara kerjanya.
                    </p>
                </div>
                <div className="max-w-3xl mx-auto flex flex-col gap-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className={`faq-item ${activeIndex === i ? "active" : ""} bg-white border border-slate-200 rounded-xl overflow-hidden transition-all`}>
                            <button
                                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                                className="w-full flex items-center justify-between px-6 py-5 bg-transparent border-none text-left font-semibold text-slate-800 cursor-pointer transition-colors hover:text-primary-600"
                            >
                                {faq.q}
                                <span className="material-symbols-outlined text-2xl text-slate-400 faq-chevron transition-transform duration-300">expand_more</span>
                            </button>
                            <div className="faq-answer">
                                <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
