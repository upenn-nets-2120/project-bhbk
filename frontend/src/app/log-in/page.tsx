import { LogInCard } from "@/components/auth/LogInCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in | InstaLite",
  description: "Log in to your InstaLite",
};

export const LogInPage = () => {
  return (
    <div className="w-full h-[calc(100vh-58px)] flex items-center justify-center">
      <LogInCard />
    </div>
  );
};

export default LogInPage;
