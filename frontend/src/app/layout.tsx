import { Navbar } from "@/components/common/navbar/Navbar";
import { cn } from "@/lib/utils";
import { UserProvider } from "@/providers/UserProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { api } from "@/lib/api";
import { User } from "@/types/user";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Instalite",
  description: "Join the InstaLite community",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialUser = undefined;

  try {
    const { data: userData } = await api.get<User>("/auth", {
      headers: {
        Cookie: cookies().toString(),
      },
    });
    initialUser = userData;
  } catch (error) {
    console.log("Errro");
    console.log(error.message);
    initialUser = undefined;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        <div className="relative  max-w-screen-xl mx-auto flex min-h-screen flex-col bg-background">
          <UserProvider initialUser={initialUser}>
            <Navbar />
            {children}
          </UserProvider>
        </div>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
