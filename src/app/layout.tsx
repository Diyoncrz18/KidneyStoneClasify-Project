"use client";

// src/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import AuthGuard from "@/components/AuthGuard";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-display" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body
        className={`${inter.variable} bg-background-light dark:bg-background-dark font-display`}
      >
        {isAuthPage ? (
          <div className="min-h-screen w-full flex items-center justify-center p-4">
            {children}
          </div>
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
