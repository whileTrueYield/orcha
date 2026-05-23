import { useEffect, useState } from "react";

export const useUrlQuery = () => {
  const search = window.location.search;

  const [params, setParams] = useState(new URLSearchParams(search));

  useEffect(() => {
    setParams(new URLSearchParams(search));
  }, [search]);

  return params;
};
