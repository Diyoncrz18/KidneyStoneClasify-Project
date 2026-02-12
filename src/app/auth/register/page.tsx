"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !pin) {
      setError("Nama, email, password, dan PIN pendaftaran wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASEURL_BE}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, pin }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Registrasi gagal.");
        return;
      }

      router.push("/auth/login");
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: "", color: "" };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: strength, text: "Lemah", color: "bg-red-400" };
    if (strength <= 3) return { level: strength, text: "Sedang", color: "bg-yellow-400" };
    return { level: strength, text: "Kuat", color: "bg-green-400" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="flex min-h-screen w-full font-display">
      {/* ===== LEFT PANEL — Branding & Visual ===== */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0c1a2e] to-[#111621] items-center justify-center">
        {/* Background decorative elements */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,165,233,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />

        {/* Floating orbs */}
        <div className="absolute top-[20%] left-[15%] w-3 h-3 rounded-full bg-accent/40 animate-float" />
        <div className="absolute top-[60%] right-[20%] w-2 h-2 rounded-full bg-primary/40 animate-float-delayed" />
        <div className="absolute bottom-[25%] left-[30%] w-2.5 h-2.5 rounded-full bg-accent/30 animate-float" />

        <div className="relative z-10 max-w-lg px-12">
          {/* Brand name */}
          <p className="text-2xl font-extrabold text-white tracking-tight mb-12">
            Kidney<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Stone</span> AI
          </p>

          {/* Main heading */}
          <h1 className="text-4xl xl:text-[2.75rem] font-black text-white leading-[1.15] mb-5">
            Mulai Perjalanan{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Diagnostik
            </span>{" "}
            Anda
          </h1>
          <p className="text-base text-slate-400 leading-relaxed mb-12">
            Bergabunglah dengan platform AI medis terdepan untuk deteksi batu
            ginjal yang lebih cepat, akurat, dan efisien.
          </p>

          {/* Benefits checklist */}
          <div className="space-y-4">
            {[
              "Akses penuh ke fitur deteksi AI",
              "Dashboard riwayat pasien & hasil scan",
              "Deskripsi otomatis hasil analisis oleh AI",
              "Dukungan teknis 24/7",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/[0.06]">
            {[
              { value: "95%+", label: "Akurasi" },
              { value: "<3s", label: "Waktu Proses" },
              { value: "24/7", label: "Tersedia" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Register Form ===== */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-10 lg:px-16">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand */}
          <p className="text-xl font-extrabold text-slate-900 tracking-tight mb-8 lg:hidden">
            Kidney<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Stone</span> AI
          </p>

          {/* Header */}
          <div className="mb-7">
            <h2 className="text-2xl sm:text-[1.7rem] font-extrabold text-slate-900 leading-tight">
              Buat Akun Baru
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Daftar untuk mulai menggunakan platform deteksi KidneyStone AI.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <span className="text-red-500 text-lg font-bold">!</span>
              </div>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Nama Lengkap
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white hover:border-slate-300"
                  placeholder="Nama Anda"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white hover:border-slate-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white hover:border-slate-300"
                  placeholder="Min. 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
              {/* Password strength */}
              {password && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= passwordStrength.level
                            ? passwordStrength.color
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      passwordStrength.level <= 2
                        ? "text-red-500"
                        : passwordStrength.level <= 3
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Konfirmasi Password
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-xl border bg-slate-50/50 py-2.5 pl-11 pr-11 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:bg-white hover:border-slate-300 ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : confirmPassword && confirmPassword === password
                      ? "border-green-300 focus:border-green-400 focus:ring-green-100"
                      : "border-slate-200 focus:border-primary focus:ring-primary/20"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] text-red-500 mt-1">
                  Password tidak cocok
                </p>
              )}
            </div>

            {/* PIN Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                PIN Pendaftaran
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <KeyRound className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white hover:border-slate-300"
                  placeholder="Masukkan PIN dari admin"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                PIN diberikan oleh administrator untuk verifikasi pendaftaran.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Memproses...</span>
                </div>
              ) : (
                <>
                  <span>Buat Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-slate-400 uppercase tracking-wider">
                Sudah punya akun?
              </span>
            </div>
          </div>

          {/* Login link */}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-primary/50 hover:text-primary hover:bg-primary-50/30"
          >
            Masuk ke Akun
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Footer note */}
          <p className="mt-6 text-center text-[11px] text-slate-400 leading-relaxed">
            Dengan mendaftar, Anda menyetujui{" "}
            <span className="text-slate-500 hover:text-primary cursor-pointer transition-colors">
              Ketentuan Layanan
            </span>{" "}
            dan{" "}
            <span className="text-slate-500 hover:text-primary cursor-pointer transition-colors">
              Kebijakan Privasi
            </span>{" "}
            KidneyStone AI.
          </p>
        </div>
      </div>
    </div>
  );
}
