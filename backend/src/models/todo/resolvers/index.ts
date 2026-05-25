/**
 * Side-effect barrel for Todo resolvers.
 *
 * Importing this module registers all Todo query and mutation fields
 * on the Pothos builder. No exports — purely side-effect imports.
 */

import "./todo.resolver";
import "./todos.resolver";
import "./createTodo.resolver";
import "./updateTodo.resolver";
import "./deleteTodo.resolver";
