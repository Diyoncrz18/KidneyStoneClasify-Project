// src/components/TopNavbar.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

interface UserInfo {
  name?: string;
  email?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

export default function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const setDefaultNotifications = () => {
    const defaultNotifications: Notification[] = [
      {
        id: "1",
        title: "Scan Baru",
        message: "Pasien baru telah melakukan scan CT",
        time: "2 jam yang lalu",
        read: false,
        type: "info",
      },
      {
        id: "2",
        title: "Hasil Analisis",
        message: "Hasil analisis untuk pasien p-001 telah selesai",
        time: "5 jam yang lalu",
        read: false,
        type: "success",
      },
      {
        id: "3",
        title: "Peringatan",
        message: "Terdapat deteksi batu ginjal dengan confidence tinggi",
        time: "1 hari yang lalu",
        read: true,
        type: "warning",
      },
    ];
    setNotifications(defaultNotifications);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("kidney_notifications", JSON.stringify(defaultNotifications));
    }
  };

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

    // Load notifications from localStorage or create mock notifications
    const storedNotifications = window.localStorage.getItem("kidney_notifications");
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch {
        // If parsing fails, use default notifications
        setDefaultNotifications();
      }
    } else {
      setDefaultNotifications();
    }
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      // Update localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem("kidney_notifications", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      if (typeof window !== "undefined") {
        window.localStorage.setItem("kidney_notifications", JSON.stringify(updated));
      }
      return updated;
    });
  };

  let title = "Dashboard";
  if (pathname === "/upload") {
    title = "Upload Images";
  } else if (pathname === "/model") {
    title = "Model Overview";
  } else if (pathname === "/patients") {
    title = "Patients";
  } else if (pathname === "/patients/new") {
    title = "Add New Patient";
  } else if (
    pathname.startsWith("/patients/") &&
    pathname.includes("/scans/")
  ) {
    title = "Scan Detail";
  } else if (pathname.startsWith("/patients/")) {
    title = "Patient Detail";
  } else if (pathname === "/profile") {
    title = "Profile";
  } else if (pathname === "/settings") {
    title = "Settings";
  }

  return (
    <header className="flex h-[73px] items-center justify-between whitespace-nowrap border-b border-solid border-[#242f47] px-10 py-3">
      <h2 className="text-white text-2xl font-bold">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#242f47] text-white hover:bg-[#2a3441] transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-[#242f47] bg-[#111622] shadow-lg">
              <div className="flex items-center justify-between border-b border-[#242f47] px-4 py-3">
                <h3 className="text-white font-semibold">Notifikasi</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Tandai semua sudah dibaca
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-[#92a4c8]">
                    Tidak ada notifikasi
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`cursor-pointer border-b border-[#242f47] px-4 py-3 transition-colors hover:bg-[#1a2332] ${
                        !notification.read ? "bg-[#1a2332]/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 h-2 w-2 rounded-full ${
                            !notification.read
                              ? "bg-primary"
                              : "bg-transparent"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">
                              {notification.title}
                            </p>
                            <span className="text-xs text-[#92a4c8]">
                              {notification.time}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-[#92a4c8]">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="border-t border-[#242f47] px-4 py-2 text-center">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#92a4c8] hover:text-white transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {pathname === "/profile" && (
          <div className="flex flex-col items-end mr-2 text-xs leading-tight">
            <span className="text-text-dark font-medium">
              {user?.name || "Pengguna"}
            </span>
            <span className="text-text-muted-dark">{user?.email || ""}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-[#242f47] overflow-hidden"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBydl76-l3Eq09R3PR_58I_zZFqs7fGq4iNseHkNvX5mKaIMGIlZLeVlfqrwSOhg9_nfMttGKWQP27CdRy90b00mLu_tgR21JGhz2Jk1z0HqlldyIolJIY3ca8WptJn2eIHvY-edv85Oh_InrX4hNhvTcPtY6oNsalR0GSDpS6zzPob7Z_uyKPnWyJV_unuMIV_mwOl5OabDCVzfh-zCG0G08n533owe0QQVTJfVxcHvJXUH6I4ptTZNfnMMOqpTWiqV_QRMRKB0JE")`,
          }}
        />
      </div>
    </header>
  );
}
