import type { Metadata } from "next";
import { Suspense } from "react";
import { Outfit } from "next/font/google";
import "./globals.css";
import React from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ScanningProvider } from "@/context/ScanningContext";
import AppSidebar from "@/layout/AppSidebar";
import AppHeader from "@/layout/AppHeader";
import Backdrop from "@/layout/Backdrop";
import { ToastProvider } from "@/components/ui/Toast";
import AuthModal from "@/components/common/AuthModal";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SQL Server SP Manager",
  description: "Manage and Document your Stored Procedures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">Cargando...</div>
          }
        >
          <ThemeProvider>
            <ScanningProvider>
              <SidebarProvider>
                <ToastProvider>
                  <div className="flex h-screen overflow-hidden">
                    <AppSidebar />
                    <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                      <AppHeader />
                      <main>
                        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                          {children}
                        </div>
                      </main>
                      <AuthModal />
                      <Backdrop />
                    </div>
                  </div>
                </ToastProvider>
              </SidebarProvider>
            </ScanningProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
