import type { Metadata } from "next";
import { Outfit, Inter, Fira_Code } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SchemaAI — Instant Database Blueprint Generator",
  description: "Generate strict, structured SQL schemas and seed data instantly from natural language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${outfit.variable} ${inter.variable} ${firaCode.variable} font-sans bg-[#F4F5F6] text-[#111111] min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
