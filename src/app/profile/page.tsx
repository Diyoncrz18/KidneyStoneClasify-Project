"use client";

import { useEffect, useState } from "react";

interface User {
  id?: string;
  name?: string;
  email?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("kidney_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const initials = (user?.name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-text-dark">Profil Pengguna</h1>
          <p className="text-sm text-text-muted-dark">
            Kelola informasi akun yang digunakan untuk mengakses sistem
            KidneyStone AI.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Kartu utama */}
          <div className="rounded-2xl bg-card-dark border border-border-dark p-6 shadow-md flex flex-col items-center text-center gap-4">
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
              {initials || "?"}
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-text-dark">
                {user?.name || "Pengguna"}
              </p>
              <p className="text-sm text-text-muted-dark">
                {user?.email || "email belum tersedia"}
              </p>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
              <span className="material-symbols-outlined text-sm">
                verified_user
              </span>
              <span>Terautentikasi</span>
            </div>
          </div>

          {/* Detail informasi */}
          <div className="rounded-2xl bg-card-dark border border-border-dark p-6 shadow-md space-y-4">
            <h2 className="text-lg font-semibold text-text-dark">
              Detail Akun
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-text-muted-dark">Nama Lengkap</span>
                <span className="text-text-dark font-medium">
                  {user?.name || "-"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-text-muted-dark">Email</span>
                <span className="text-text-dark font-medium">
                  {user?.email || "-"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-text-muted-dark">Peran</span>
                <span className="text-text-dark font-medium">
                  Pengguna KidneyStone AI
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-text-muted-dark">Status</span>
                <span className="text-emerald-400 font-medium">Aktif</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border-dark flex gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-base mr-1">
                  edit
                </span>
                Edit Profil
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-border-dark px-4 py-2 text-sm font-medium text-text-muted-dark hover:bg-border-dark/40 transition-colors"
              >
                <span className="material-symbols-outlined text-base mr-1">
                  history
                </span>
                Riwayat Aktivitas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
