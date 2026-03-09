import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Email App",
  description: "A Gmail-like email webapp powered by Nylas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
