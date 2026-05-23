import { SearchIcon } from "@heroicons/react/solid";
import { useDebouncedState } from "hooks/useDebouncedState";
import React, { useEffect, useRef } from "react";

interface Props {
  onChange: (query: string) => void;
  query?: string;
}

export const ObjectSelectSearch: React.FC<Props> = (props) => {
  const { onChange, query } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter, debouncedFilterValue] = useDebouncedState<string>(
    query ? query : "",
    500,
    onChange
  );

  // focus the search filter field
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [inputRef]);

  useEffect(() => {
    onChange(debouncedFilterValue);
  }, [onChange, debouncedFilterValue]);

  return (
    <div className="relative bg-gray-100 px-2 pt-2 pb-2">
      <SearchIcon className="absolute top-4 left-4 h-4 w-4 text-gray-500" />
      <input
        type="text"
        ref={inputRef}
        onKeyDown={(evt) =>
          evt.code === "Space" ? evt.stopPropagation() : true
        }
        value={filter}
        placeholder="Filter..."
        onChange={(e) => setFilter(e.currentTarget.value)}
        className="block w-full min-w-0 flex-1 rounded border-gray-300 py-1.5 pl-7 text-gray-800 transition duration-150 ease-in-out focus:border-brand-500 focus:ring focus:ring-brand-400 focus:ring-opacity-25 sm:text-sm sm:leading-5"
      />
    </div>
  );
};
