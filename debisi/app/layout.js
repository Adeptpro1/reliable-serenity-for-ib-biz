import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from './providers';
import "./globals.css";

export const metadata = {
  title: "Debisi NG",
  description: "Debisi connects verified businesses to real customers in Oyo State, Nigeria.",
  keywords: "Debisi, SME, MSME, Nigeria, Ibadan, Oyo State, Business Directory, Shopping",
  icons: {
    icon: "/debisi_logo.png",
    shortcut: "/debisi_logo.png",
    apple: "/debisi_logo.png",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
