import { useMemo, useState } from "react";
import {
  OperationVariables,
  useMutation,
  DefaultContext,
  ApolloCache,
  TypedDocumentNode,
  DocumentNode,
  MutationHookOptions,
  MutationTuple,
} from "@apollo/client";

export function useBlockingMutation<
  TData = any,
  TVariables = OperationVariables,
  TContext = DefaultContext,
  TCache extends ApolloCache<any> = ApolloCache<any>
>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: MutationHookOptions<TData, TVariables, TContext>
): MutationTuple<TData, TVariables, TContext, TCache> {
  const [semaphore, setSemaphore] = useState(false);

  const [mutate, results] = useMutation(mutation, {
    ...options,
    onCompleted: (data: TData) => {
      // release the mutation lock on success
      setSemaphore(false);
      if (options && options.onCompleted) {
        options.onCompleted(data);
      }
    },
    onError: (error) => {
      // release the mutation lock on error
      setSemaphore(false);
      if (options && options.onError) {
        options.onError(error);
      }
    },
  });

  return useMemo(() => {
    const blockingMutate = (...args: Parameters<typeof mutate>) => {
      // only mutate data is the one has not yet been started
      if (!semaphore) {
        // setup the lock as we're about to start a mutation
        setSemaphore(true);
        return mutate(...args);
      }
    };

    return [blockingMutate, results] as MutationTuple<
      TData,
      TVariables,
      TContext,
      TCache
    >;
  }, [semaphore, setSemaphore, mutate, results]);
}
