import { SignUpCard } from "@/components/auth/SignUpCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | InstaLite",
  description: "Sign up into the InstaLite community",
};

const SignUpPage = () => {
  return (
    <div className="w-full h-[calc(100vh-58px)] flex items-center justify-center">
      <SignUpCard />
    </div>
  );
};

export default SignUpPage;
