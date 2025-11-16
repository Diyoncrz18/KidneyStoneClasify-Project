"use client";

import { useState, useEffect } from "react";

interface Settings {
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    scanComplete: boolean;
    newPatient: boolean;
  };
  display: {
    theme: "dark" | "light" | "auto";
    dateFormat: string;
    timezone: string;
  };
  data: {
    autoSave: boolean;
    exportFormat: "json" | "csv" | "pdf";
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    language: "id",
    notifications: {
      email: true,
      push: true,
      scanComplete: true,
      newPatient: false,
    },
    display: {
      theme: "dark",
      dateFormat: "DD/MM/YYYY",
      timezone: "Asia/Makassar",
    },
    data: {
      autoSave: true,
      exportFormat: "json",
    },
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("kidney_settings");
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch {
          // Use default settings
        }
      }
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("kidney_settings", JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const updateSettings = (key: keyof Settings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNotificationSetting = (key: keyof Settings["notifications"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updateDisplaySetting = (key: keyof Settings["display"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      display: {
        ...prev.display,
        [key]: value,
      },
    }));
  };

  const updateDataSetting = (key: keyof Settings["data"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text-dark">Settings</h1>
        <p className="text-sm text-text-muted-dark">
          Kelola pengaturan aplikasi dan preferensi Anda
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Language Settings */}
        <div className="rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text-dark">
            Bahasa / Language
          </h2>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="language"
                value="id"
                checked={settings.language === "id"}
                onChange={(e) => updateSettings("language", e.target.value)}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-text-dark">Bahasa Indonesia</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="language"
                value="en"
                checked={settings.language === "en"}
                onChange={(e) => updateSettings("language", e.target.value)}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-text-dark">English</span>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text-dark">
            Notifikasi
          </h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-text-dark font-medium">Email Notifications</span>
                <span className="text-sm text-text-muted-dark">
                  Terima notifikasi melalui email
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => updateNotificationSetting("email", e.target.checked)}
                className="h-5 w-5 rounded text-primary focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-text-dark font-medium">Push Notifications</span>
                <span className="text-sm text-text-muted-dark">
                  Terima notifikasi push di browser
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => updateNotificationSetting("push", e.target.checked)}
                className="h-5 w-5 rounded text-primary focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-text-dark font-medium">Scan Complete</span>
                <span className="text-sm text-text-muted-dark">
                  Notifikasi saat analisis scan selesai
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.scanComplete}
                onChange={(e) => updateNotificationSetting("scanComplete", e.target.checked)}
                className="h-5 w-5 rounded text-primary focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-text-dark font-medium">New Patient</span>
                <span className="text-sm text-text-muted-dark">
                  Notifikasi saat pasien baru ditambahkan
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.newPatient}
                onChange={(e) => updateNotificationSetting("newPatient", e.target.checked)}
                className="h-5 w-5 rounded text-primary focus:ring-primary"
              />
            </label>
          </div>
        </div>

        {/* Display Settings */}
        <div className="rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text-dark">Tampilan</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-text-dark font-medium">Theme</label>
              <select
                value={settings.display.theme}
                onChange={(e) => updateDisplaySetting("theme", e.target.value)}
                className="rounded-lg border border-border-dark bg-[#111622] px-4 py-2 text-text-dark focus:border-primary focus:outline-none"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-dark font-medium">Format Tanggal</label>
              <select
                value={settings.display.dateFormat}
                onChange={(e) => updateDisplaySetting("dateFormat", e.target.value)}
                className="rounded-lg border border-border-dark bg-[#111622] px-4 py-2 text-text-dark focus:border-primary focus:outline-none"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-dark font-medium">Timezone</label>
              <select
                value={settings.display.timezone}
                onChange={(e) => updateDisplaySetting("timezone", e.target.value)}
                className="rounded-lg border border-border-dark bg-[#111622] px-4 py-2 text-text-dark focus:border-primary focus:outline-none"
              >
                <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text-dark">Data</h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-text-dark font-medium">Auto Save</span>
                <span className="text-sm text-text-muted-dark">
                  Simpan hasil scan secara otomatis
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.data.autoSave}
                onChange={(e) => updateDataSetting("autoSave", e.target.checked)}
                className="h-5 w-5 rounded text-primary focus:ring-primary"
              />
            </label>
            <div className="flex flex-col gap-2">
              <label className="text-text-dark font-medium">Export Format</label>
              <select
                value={settings.data.exportFormat}
                onChange={(e) => updateDataSetting("exportFormat", e.target.value)}
                className="rounded-lg border border-border-dark bg-[#111622] px-4 py-2 text-text-dark focus:border-primary focus:outline-none"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          {saved && (
            <div className="flex items-center gap-2 text-green-400">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span className="text-sm">Settings saved!</span>
            </div>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-base">save</span>
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}

