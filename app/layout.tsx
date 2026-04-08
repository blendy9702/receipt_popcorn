import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SidebarLayout } from "@/components/sidebar-layout";
import { GradientBackground } from "@/components/gradient-background";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Popcorn 영수증",
  description: "Popcorn 영수증",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  modal,
  children,
}: Readonly<{
  modal: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full dark-gradient-layout">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full dark-gradient-layout antialiased">
        <GradientBackground />
        <SidebarLayout>{children}</SidebarLayout>
        {modal}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
