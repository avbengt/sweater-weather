import { Inter, Fjord_One, Dancing_Script } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fjordOne = Fjord_One({
  variable: "--font-fjord-one",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export { inter, fjordOne, dancingScript };

export const metadata = {
  title: "Sweater Weather",
  description: "Sweater Weather by Alissa Bengtson",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fjordOne.variable} ${dancingScript.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}