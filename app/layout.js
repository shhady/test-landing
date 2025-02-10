import { Geist, Geist_Mono,Rubik } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "טופס למשיכת כספים",
  description: "טופס למשיכת כספים מקופת גמל",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${rubik.className} antialiased bg-[#e5f0fe]` } 
      >
        {children}
      </body>
    </html>
  );
}
