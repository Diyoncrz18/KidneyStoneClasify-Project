// src/components/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface UserInfo {
  name?: string;
  email?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

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

  const links = [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/upload", icon: "upload", label: "Upload Image" },
    { href: "/patients", icon: "group", label: "Patients" },
    { href: "/model", icon: "history", label: "Model Overview" },
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("kidney_user");
    }
    router.push("/auth/login");
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-[#111622] p-4 border-r border-[#242f47]">
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 text-white pl-3">
            <div className="size-6">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6_319)">
                  <path
                    d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                    fill="currentColor"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_319">
                    <rect fill="white" height="48" width="48"></rect>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              KidneyClassify
            </h2>
          </div>
          <div className="flex gap-3 items-center mt-6">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              data-alt="Profile picture of Dr. Eleanor Vance"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDzCdgUGknwAWomeFr-vIqPv6BWeKEN068ZiHm-_Z4bIUuFeGFnWm-TdVPsiToar5EWBRe0O8bnVFvmYQQiwJtAkpoPtjTKWEwove2oHbX0T96Faqz9vSLUW0bSFrBjmt11vbi91hZTIOi6hO-T52un2vbNHM0Xv-Kl-yBxrN1DKhYqN6sAYLHsCjqrRFox4_wBBRilqweQG3gyHF6zZomnbNviQ7ujX_rvbqjRfZ2mnAqmdpwDrvU6n1zHVsqAyV5UQK7KhVPAM9o")`,
              }}
            ></div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-medium leading-normal">
                dr.{user?.name || "Pengguna"}
              </h1>
              {user?.email && (
                <p className="text-[#92a4c8] text-sm font-normal leading-normal">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {links.map((link) => (
              <a
                key={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
                  pathname === link.href
                    ? "bg-primary text-white"
                    : "text-white hover:bg-[#242f47]"
                }`}
                href={link.href}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings:
                      pathname === link.href ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {link.icon}
                </span>
                <p className="text-sm font-medium leading-normal">
                  {link.label}
                </p>
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <a
            className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
              pathname === "/settings"
                ? "bg-primary text-white"
                : "text-white hover:bg-[#242f47]"
            }`}
            href="/settings"
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  pathname === "/settings" ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              settings
            </span>
            <p className="text-sm font-medium leading-normal">Settings</p>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-white hover:bg-[#242f47] rounded-xl"
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium leading-normal">Log Out</p>
          </button>
        </div>
      </div>
    </aside>
  );
}
