import { useEffect } from "react";
import { useAppDispatch } from "store";

export const usePageTitle = (title: string) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch({ type: "SET_PAGE", payload: title });
  }, [dispatch, title]);
};
