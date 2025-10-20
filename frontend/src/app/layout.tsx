import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "./ClientShell";
import { AuthProvider } from "./auth0/Auth0Provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stocks-App",
  description: "Stocks-App Proyect Progra Web",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
          <AuthProvider>
            <ClientShell>{children}</ClientShell>
          </AuthProvider>
      </body>
    </html>
  );
}
