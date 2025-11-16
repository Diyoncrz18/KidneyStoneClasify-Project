"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPatientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: sambungkan ke backend untuk menyimpan pasien baru
      console.log({ name, age, gender, phone, address, note });
      router.push("/patients");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">Add New Patient</h1>
        <p className="text-sm text-text-muted-dark">
          Isi data pasien dengan lengkap untuk mulai menyimpan riwayat
          pemeriksaan.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-card-dark border border-border-dark p-6 shadow-md space-y-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-dark">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-dark">Age</label>
            <input
              type="number"
              min={0}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-dark">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-dark">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-dark">Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-dark">
            Additional Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm text-text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/patients")}
            className="rounded-lg border border-border-dark px-4 py-2 text-sm font-medium text-text-muted-dark hover:bg-border-dark/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
