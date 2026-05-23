import { CreateTodoResolver } from "./createTodo.resolver";
import { UpdateTodoResolver } from "./updateTodo.resolver";
import { TodoResolver } from "./todo.resolver";
import { TodosResolver } from "./todos.resolver";
import { DeleteTodoResolver } from "./deleteTodo.resolver";

export default [
  CreateTodoResolver,
  UpdateTodoResolver,
  TodoResolver,
  TodosResolver,
  DeleteTodoResolver,
];
