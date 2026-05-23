import { useCallback, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { FCWithFragments } from "types";
import {
  MutationCheckTodoArgs,
  MutationCreateTodoArgs,
  MutationDeleteTodoArgs,
  MutationUpdateTodoArgs,
  Todo,
} from "types/graphql";
import { TodoRow } from "./TodoRow";
import { useLocalPagination } from "hooks/useLocalPagination";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import cn from "classnames";
import { CreateTodoForm } from "./CreateTodoForm";
import { Paginator } from "components/views/Paginator";
import { ToggleButton } from "components/fields/ToggleButton";
import { useBlockingMutation } from "utils/graphql";
import { PopoverTips } from "components/help/HelpBlock";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";

interface Props {
  className?: string;
}

export const TodoList: FCWithFragments<Props> = (props) => {
  const [showAll, setShowAll] = useState(false);
  const pagination = useLocalPagination({ pageSize: 6 });

  const todoQueryVariables: any = {
    last: pagination.pageSize,
    sort: pagination.sortBy,
    // search: searchFilter,
    offset: pagination.pageSize * pagination.page,
    dynamic: !showAll,
  };

  const { data, loading, refetch } = useQuery<QueryReturnValue["todos"]>(
    GET_TODOS_QUERY,
    {
      variables: todoQueryVariables,
      fetchPolicy: "cache-and-network",
    },
  );

  const [updateTodo] = useBlockingMutation<
    { updateTodo: Todo },
    MutationUpdateTodoArgs
  >(UPDATE_TODO_MUTATION, {
    onError: onGraphQLError({ title: "Todo update failed" }),
    // onCompleted: onMutationComplete({ title: "Todo updated" }),
  });

  const [checkTodo] = useMutation<
    MutationReturnValue["checkTodo"],
    MutationCheckTodoArgs
  >(CHECK_TODO_MUTATION, {
    onError: onGraphQLError({ title: "Todo toggle failed" }),
    // onCompleted: onMutationComplete({ title: "Todo toggled" }),
  });

  const [deleteTodo] = useMutation<
    MutationReturnValue["deleteTodo"],
    MutationDeleteTodoArgs
  >(DELETE_TODO_MUTATION, {
    onError: onGraphQLError({ title: "Todo deletion failed" }),
    onCompleted: onMutationComplete({
      title: "Todo deleted",
      callback: refetch,
    }),
  });

  const [createTodo] = useBlockingMutation<
    MutationReturnValue["createTodo"],
    MutationCreateTodoArgs
  >(CREATE_TODO_MUTATION, {
    onError: onGraphQLError({
      title: "Todo creation failed",
    }),
    onCompleted: onMutationComplete({
      title: "Todo Created",
    }),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }
      const todo = data.createTodo;

      cache.modify({
        fields: {
          todos(paginatedTodos) {
            const newTodo = cache.writeFragment({
              data: todo,
              fragment: TodoRow.fragments.todoRowFragment,
            });

            return {
              ...paginatedTodos,
              nodes: [newTodo, ...paginatedTodos.nodes].slice(
                0,
                pagination.pageSize,
              ),
              totalCount: paginatedTodos.totalCount + 1,
              pageInfo: {
                ...paginatedTodos.pageInfo,
                pageSize: paginatedTodos.pageInfo.pageSize + 1,
              },
            };
          },
        },
      });
    },
  });

  const onCreate = useCallback(
    (body: string) => createTodo({ variables: { input: { body } } }),
    [createTodo],
  );

  if (!data) {
    return null;
  }

  const todos = data.todos;

  const className = cn("space-y-2 flex-1 flex flex-col", props.className);

  return (
    <div className={className} data-e2e="todo-list">
      <div className="flex shrink-0 flex-row items-center justify-between">
        <div className="text-base font-medium text-gray-700">
          Your checklist
          <PopoverTips
            title="Your Checklist"
            className="relative top-1 inline-block px-1"
          >
            <p>
              This is for small items you don't want to lose sight of, but
              aren't really suitable for tickets. As you tick the boxes, those
              items will disappear after a few seconds.
            </p>
            <p className="mt-2">
              Click “Show All” to see everything (done and not done).
            </p>
          </PopoverTips>
        </div>
        <div className="hidden sm:block">
          <ToggleButton
            checked={showAll}
            onChange={() => setShowAll(!showAll)}
            label="Show All"
            leftLabel="Active"
            checkedColor="bg-gray-200"
            uncheckedColor="bg-gray-200"
          />
        </div>
        <div className="sm:hidden">
          <ToggleButton
            checked={showAll}
            onChange={() => setShowAll(!showAll)}
            label="Show All"
            checkedColor="bg-gray-200"
            uncheckedColor="bg-gray-200"
          />
        </div>
      </div>
      <ul className="mt-4 flex flex-1 flex-col space-y-1 overflow-auto">
        {todos.nodes.map((todo) => (
          <TodoRow
            onCheck={(todo, checked) =>
              checkTodo({
                variables: { todoId: todo.id, checked },
                optimisticResponse: {
                  checkTodo: {
                    ...todo,
                    id: todo.id,
                    __typename: "Todo",
                    checked: checked,
                  },
                },
              })
            }
            onUpdate={(todo, body) =>
              updateTodo({
                variables: { todoId: todo.id, input: { body } },
                optimisticResponse: {
                  updateTodo: {
                    ...todo,
                    id: todo.id,
                    __typename: "Todo",
                    body,
                  },
                },
              })
            }
            onDelete={(todo) => deleteTodo({ variables: { todoId: todo.id } })}
            todo={todo}
            key={todo.id}
          />
        ))}
      </ul>
      <CreateTodoForm className="shrink-0 sm:pl-4 " onCreate={onCreate} />
      <Paginator
        total={todos.totalCount}
        {...pagination}
        isLoading={loading}
        itemCount={todos.nodes.length}
        itemName="task"
        className="mt-4 flex shrink-0 items-center justify-between px-4 sm:rounded-md sm:px-0"
      />
    </div>
  );
};

TodoList.fragments = {
  todoListFragment: gql`
    fragment todoListFragment on Todo {
      id
      ...todoRowFragment
    }
    ${TodoRow.fragments.todoRowFragment}
  `,
};

const GET_TODOS_QUERY = gql`
  query GetTodos($last: Int!, $sort: String, $offset: Int, $dynamic: Boolean) {
    todos(last: $last, sort: $sort, offset: $offset, dynamic: $dynamic) {
      nodes {
        id
        ...todoListFragment
      }
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
    }
  }
  ${TodoList.fragments.todoListFragment}
`;

const CREATE_TODO_MUTATION = gql`
  mutation CreateTodoForList($input: CreateTodoInput!) {
    createTodo(input: $input) {
      ...todoListFragment
    }
  }
  ${TodoList.fragments.todoListFragment}
`;

const UPDATE_TODO_MUTATION = gql`
  mutation UpdateTodoForList($input: UpdateTodoInput!, $todoId: Int!) {
    updateTodo(input: $input, todoId: $todoId) {
      ...todoListFragment
    }
  }
  ${TodoList.fragments.todoListFragment}
`;

const CHECK_TODO_MUTATION = gql`
  mutation CheckTodoForList($checked: Boolean!, $todoId: Int!) {
    checkTodo(checked: $checked, todoId: $todoId) {
      ...todoListFragment
    }
  }
  ${TodoList.fragments.todoListFragment}
`;

const DELETE_TODO_MUTATION = gql`
  mutation DeleteTodoForList($todoId: Int!) {
    deleteTodo(todoId: $todoId) {
      ...todoListFragment
    }
  }
  ${TodoList.fragments.todoListFragment}
`;
