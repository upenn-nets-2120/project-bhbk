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
import { PostsProvider } from "@/providers/PostsProvider";
import { Layout } from "@/components/common/layout/Layout";
import { ChatProvider } from "@/providers/ChatProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

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
  let initialUsers: User[] = [];

  try {
    const { data: userData } = await api.get<User>("/auth", {
      headers: {
        Cookie: cookies().toString(),
      },
    });

    const { data: users } = await api.get<User[]>("/user/list", {
      headers: {
        Cookie: cookies().toString(),
      },
    });

    initialUser = userData;
    initialUsers = users;
  } catch (error) {
    console.log(error);
    initialUser = undefined;
    initialUsers = [];
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        <div className="relative flex min-h-screen flex-col bg-background">
          <ThemeProvider attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <UserProvider initialUser={initialUser} initialUsers={initialUsers}>
              <PostsProvider>
                <ChatProvider>
                  <Navbar />
                  <Layout>{children}</Layout>
                </ChatProvider>
              </PostsProvider>
            </UserProvider>
          </ThemeProvider>
        </div>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
