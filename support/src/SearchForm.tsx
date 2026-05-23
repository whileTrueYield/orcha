import { FormEvent, useEffect, useState } from "react";
import { Index as LunrIndex } from "lunr";
import {
  getCachedQuery,
  getCachedResults,
  setCachedQuery,
  setCachedResults,
} from "./cache";
import { SearchResult } from "./SearchResult";

interface Props {
  documentationId: string;
  setDocumentationPageId: (pageId: string) => void;
}

export const SearchForm: React.FC<Props> = (props) => {
  const { documentationId, setDocumentationPageId } = props;

  const setQuery = (query: string) => {
    setCachedQuery(documentationId, query);
    _setQuery(query);
  };

  const setResults = (results: string[]) => {
    setCachedResults(documentationId, results);
    _setResults(results);
  };

  const [query, _setQuery] = useState(getCachedQuery(documentationId));
  const [results, _setResults] = useState<string[]>(
    getCachedResults(documentationId)
  );

  const [isLunrLoaded, setLunrLoaded] = useState(false);
  const [isIndexLoaded, setIndexLoaded] = useState(false);
  const [inputQuery, setInputQuery] = useState(getCachedQuery(documentationId));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setQuery(inputQuery);
    if (isLunrLoaded && isIndexLoaded) {
      const idx = (window as any).idx as LunrIndex;
      setResults(
        idx
          .search(inputQuery)
          .slice(0, 50)
          .map((result) => result.ref)
      );
    }
  };

  useEffect(() => {
    const hasLunrScript = document.getElementById("lunrjs");
    const hasIdxScript = document.getElementById("idxjs");

    if (!hasLunrScript) {
      const script = document.createElement("script");
      script.src = `${import.meta.env.VITE_DOCUMENTATION_URI}/script/lunr.js`;
      script.id = "lunrjs";
      document.body.appendChild(script);

      const lunrInterval = setInterval(() => {
        if (!!(window as any).lunr) {
          clearInterval(lunrInterval);
          setLunrLoaded(true);
        }
      }, 300);
    } else if (!!(window as any).lunr) {
      setLunrLoaded(true);
    }

    if (isLunrLoaded && !hasIdxScript) {
      const script = document.createElement("script");
      script.src = `${
        import.meta.env.VITE_DOCUMENTATION_URI
      }/doc/${documentationId}/search.js`;
      script.id = "idxjs";
      document.body.appendChild(script);

      const idxInterval = setInterval(() => {
        if (!!(window as any).idx) {
          clearInterval(idxInterval);
          setIndexLoaded(true);
        }
      }, 300);
    } else if (!!(window as any).idx) {
      setIndexLoaded(true);
    }
  }, [isLunrLoaded, isIndexLoaded, documentationId]);

  if (!isLunrLoaded || !isIndexLoaded) {
    return (
      <div className="flex items-center text-xl justify-center text-gray-400 h-full">
        Loading...
      </div>
    );
  }

  const renderResults = () =>
    results.map((ref) => (
      <SearchResult
        onClick={() => setDocumentationPageId(ref)}
        query={query}
        result={ref}
        key={ref}
        documentationId={documentationId}
      />
    ));

  const renderNoResults = () => {
    if (query) {
      return (
        <div className="py-8">
          <div className="text-xl text-gray-500">No Results</div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col px-4 py-2">
      <form className="py-2" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 sr-only"
          >
            Search
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              autoFocus
              value={inputQuery}
              onChange={(event) => setInputQuery(event.currentTarget.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              placeholder="Search the documentation"
            />
          </div>
        </div>
      </form>
      <ul className="space-y-4 text-center">
        {query
          ? results.length > 0
            ? renderResults()
            : renderNoResults()
          : null}
      </ul>
    </div>
  );
};
