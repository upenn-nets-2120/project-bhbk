import { MdManageSearch } from "react-icons/md";

export const searchBarGraphicSize = 14;

export const SearchBar = () => {
  return (
    <div className="w-full flex-1">
      <button className="inline-flex items-center text-xs whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-3 py-1 relative h-8 w-full justify-start rounded-[0.5rem] bg-background font-normal text-muted-foreground shadow-none sm:pr-12 sm:w-[60%] lg:w-[30%]">
        <span className="hidden lg:inline-flex">Search actors, posts...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <div className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <MdManageSearch size={searchBarGraphicSize} />
        </div>
      </button>
    </div>
  );
};
