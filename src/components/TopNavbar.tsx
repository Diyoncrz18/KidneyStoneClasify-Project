// src/components/TopNavbar.tsx
"use client";

import { usePathname } from "next/navigation";


export default function TopNavbar() {
  const pathname = usePathname();

  let title = "Dashboard";
  if (pathname === "/upload") {
    title = "Upload Images";
  } else if (pathname === "/model") {
    title = "Model Overview";
  }

  return (
    <header className="flex h-[73px] items-center justify-between whitespace-nowrap border-b border-solid border-[#242f47] px-10 py-3">
      <h2 className="text-white text-2xl font-bold">{title}</h2>
      <div className="flex items-center gap-4">
        <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#242f47] text-white">
          <span className="material-symbols-outlined">
            notifications
          </span>
        </button>
        <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#242f47] text-white">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBydl76-l3Eq09R3PR_58I_zZFqs7fGq4iNseHkNvX5mKaIMGIlZLeVlfqrwSOhg9_nfMttGKWQP27CdRy90b00mLu_tgR21JGhz2Jk1z0HqlldyIolJIY3ca8WptJn2eIHvY-edv85Oh_InrX4hNhvTcPtY6oNsalR0GSDpS6zzPob7Z_uyKPnWyJV_unuMIV_mwOl5OabDCVzfh-zCG0G08n533owe0QQVTJfVxcHvJXUH6I4ptTZNfnMMOqpTWiqV_QRMRKB0JE")`,
          }}
        ></div>
      </div>
    </header>
  );
}