import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vocab AI",
  description: "Personal AI vocabulary learning system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
        <AuthProvider>
          <div className="fixed right-4 top-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </AuthProvider>
      </ThemeProvider>
      </body>
    </html>
  );
}