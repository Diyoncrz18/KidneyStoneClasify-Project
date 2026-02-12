"use client";

// src/app/layout.tsx
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import AuthGuard from "@/components/AuthGuard";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicPage =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/landing") ||
    pathname === "/";

  return (
    <html lang="en" className={isPublicPage ? "" : "dark"}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,100..700,0..1"
        />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} ${isPublicPage
            ? "bg-white font-sans"
            : "bg-background-light dark:bg-background-dark font-display"
          }`}
      >
        {isPublicPage ? (
          <>{children}</>
        ) : (
          <div className="relative flex min-h-screen w-full">
            <Sidebar />
            <div className="flex flex-1 flex-col">
              <TopNavbar />
              <div className="flex-1 overflow-y-auto p-10">
                <AuthGuard>{children}</AuthGuard>
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
