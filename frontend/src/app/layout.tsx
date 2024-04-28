import { Navbar } from "@/components/common/navbar/Navbar";
import { cn } from "@/lib/utils";
import { UserProvider } from "@/providers/UserProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Instalite",
  description: "Join the InstaLite community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        <div className="relative  max-w-screen-xl mx-auto flex min-h-screen flex-col bg-background">
          <UserProvider>
            <Navbar />
            {children}
          </UserProvider>
        </div>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
