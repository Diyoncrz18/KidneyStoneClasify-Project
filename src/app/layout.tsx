// src/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-display" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <div className="relative flex min-h-screen w-full">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <TopNavbar />
            <div className="flex-1 overflow-y-auto p-10">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
