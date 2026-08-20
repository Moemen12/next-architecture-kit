import type { Metadata } from "next";
import type { ReactNode } from "react";
import { clientEnv } from "@/shared/backend/env";
import "./globals.css";

export const metadata: Metadata = {
  title: clientEnv.NEXT_PUBLIC_APP_NAME,
  description: "A feature-oriented Next.js architecture starter.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
