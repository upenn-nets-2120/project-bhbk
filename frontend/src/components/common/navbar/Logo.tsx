import Link from "next/link";
import { BsInstagram } from "react-icons/bs";
import { SearchBar } from "./SearchBar";

export const logoGraphicSize = 20;

export const Logo = () => {
  return (
    <div className="mr-2 md:mr-4 flex flex-1 items-center">
      <Link href="/" className="mr-2 md:mr-6 flex items-center space-x-2">
        <BsInstagram size={logoGraphicSize} />
        <div className="hidden font-bold sm:inline-block">InstaLite</div>
      </Link>
      <SearchBar />
    </div>
  );
};
