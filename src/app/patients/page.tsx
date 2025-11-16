"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Patient {
  id: string; // maps to _id from DB
  _id?: string;
  patientId?: string;  // Add patientId field
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  totalScans?: number;
  lastScanDate?: string | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASEURL_BE || "";

export default function PatientsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!BASE_URL) return;
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/patients`);
        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to load patients", data);
          setPatients([]);
          return;
        }

        // Normalize records: map _id -> id
        const mapped: Patient[] = (data || []).map((p: any) => ({
          id: p._id || p.id || String(p._id || p.id),
          _id: p._id,
          patientId: p.patientId,  // Add patientId
          name: p.name || "-",
          age: p.age,
          gender: p.gender,
          phone: p.phone,
          address: p.address,
          notes: p.notes,
          createdAt: p.createdAt,
          totalScans: p.totalScans,
          lastScanDate: p.lastScanDate || p.last_scan_date || null,
        }));

        setPatients(mapped);
      } catch (err) {
        console.error(err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredPatients = useMemo(() => {
    const lower = query.toLowerCase();
    return patients.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const id = (p.id || "").toLowerCase();
      return name.includes(lower) || id.includes(lower);
    });
  }, [query, patients]);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    try {
      const date = new Date(iso);
      return date.toLocaleString("id-ID", {
        timeZone: "Asia/Makassar",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(iso);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Patients</h1>
          <p className="text-sm text-text-muted-dark">
            Kelola daftar pasien dan riwayat pemeriksaan CT Scan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/patients/new")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-base">
            person_add
          </span>
          Add New Patient
        </button>
      </div>

      <div className="rounded-2xl bg-card-dark border border-border-dark p-4 shadow-md flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-dark text-base">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari pasien berdasarkan nama atau ID..."
              className="w-full rounded-lg border border-border-dark bg-background-dark pl-9 pr-3 py-2 text-sm text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-dark text-left text-text-muted-dark">
                <th className="py-2 pr-4">Patient ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Age</th>
                <th className="py-2 pr-4">Gender</th>
                <th className="py-2 pr-4">Total Scans</th>
                <th className="py-2 pr-4">Last Scan Date</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-text-muted-dark"
                  >
                    Memuat daftar pasien...
                  </td>
                </tr>
              )}

              {!loading &&
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-border-dark/60 last:border-0 hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 pr-4 text-text-dark">
                      {patient.patientId || patient.id}
                    </td>
                    <td className="py-3 pr-4 text-text-dark">{patient.name}</td>
                    <td className="py-3 pr-4 text-text-dark">{patient.age}</td>
                    <td className="py-3 pr-4 text-text-dark">
                      {patient.gender}
                    </td>
                    <td className="py-3 pr-4 text-text-dark">
                      {patient.totalScans}
                    </td>
                    <td className="py-3 pr-4 text-text-dark">
                      {formatDate(patient.lastScanDate)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          console.log("[DEBUG] Navigating to patient:", patient.id, "patientId:", patient.patientId);
                          router.push(`/patients/${encodeURIComponent(patient.id)}`);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border-dark px-3 py-1 text-xs font-medium text-text-dark hover:bg-border-dark/40"
                      >
                        <span className="material-symbols-outlined text-xs">
                          visibility
                        </span>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-text-muted-dark"
                  >
                    Tidak ada pasien yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
