import { Logo } from "./Logo";
import { ToolBar } from "./Toolbar";

export const Navbar = () => {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-3 md:px-8 flex h-14 max-w-full md:max-w-screen-2xl items-center">
        <Logo />
        <ToolBar />
      </div>
    </div>
  );
};
