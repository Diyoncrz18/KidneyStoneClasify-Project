"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASEURL_BE}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Login gagal.");
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("kidney_user", JSON.stringify(data.user));
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-card-dark px-8 py-10 shadow-md border border-border-dark">
        <h1 className="text-2xl font-bold text-text-dark mb-2">
          Selamat Datang Kembali
        </h1>
        <p className="text-sm text-text-muted-dark mb-8">
          Masuk untuk mengakses dashboard KidneyStone AI.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-dark">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-dark">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted-dark">
          Belum punya akun?{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => router.push("/auth/register")}
          >
            Daftar sekarang
          </button>
        </p>
      </div>
    </div>
  );
}
