import { forwardRef, type ReactNode } from "react";
import { SearchIcon } from "../icons/search";
import { Input, type InputProps } from "./input";

export type SearchSource = "local" | "remote";

export interface SearchInputProps extends Omit<InputProps, "type"> {
  source?: SearchSource;
  onSearch?: (value: string) => void;
  emptyResult?: ReactNode;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      leadingIcon,
      clearable = true,
      onSearch,
      onKeyDown,
      source: _source,
      emptyResult: _emptyResult,
      ...props
    },
    ref,
  ) {
    return (
      <Input
        {...props}
        ref={ref}
        type="search"
        clearable={clearable}
        leadingIcon={leadingIcon ?? <SearchIcon size={14} />}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && event.key === "Enter" && onSearch) {
            onSearch(event.currentTarget.value);
          }
        }}
      />
    );
  },
);

SearchInput.displayName = "SearchInput";
