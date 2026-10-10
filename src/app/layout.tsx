import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberSpend AI | Cyber Risk Intelligence",
  description:
    "Understand cybersecurity risk in financial terms with CyberSpend AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}