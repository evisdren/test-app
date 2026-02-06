"use client";

import { useState, useEffect } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = "todos";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Load todos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTodos(JSON.parse(stored));
    }
    setIsLoaded(true);
  }, []);

  // Save todos to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const addTodo = () => {
    if (inputValue.trim() === "") return;
    setTodos([
      ...todos,
      { id: Date.now(), text: inputValue.trim(), completed: false },
    ]);
    setInputValue("");
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const toggleAll = () => {
    const allCompleted = todos.every((t) => t.completed);
    setTodos(todos.map((todo) => ({ ...todo, completed: !allCompleted })));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 py-12 font-sans dark:bg-zinc-900">
      <main className="w-full max-w-lg px-4">
        <h1 className="mb-8 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          My Todo List
        </h1>

        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new todo..."
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
          <button
            onClick={addTodo}
            className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add
          </button>
        </div>

        {todos.length > 0 && (
          <div className="mb-4 flex gap-1 rounded-lg bg-zinc-200 p-1 dark:bg-zinc-700">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {todos.length === 0 ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            No todos yet. Add one above!
          </p>
        ) : (
          <>
            <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={todos.every((t) => t.completed)}
                onChange={toggleAll}
                className="h-4 w-4 cursor-pointer rounded border-zinc-300 accent-zinc-900 dark:border-zinc-600"
              />
              Mark all as {todos.every((t) => t.completed) ? "incomplete" : "complete"}
            </label>
            {filteredTodos.length === 0 ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            No {filter} todos.
          </p>
        ) : (
          <ul className="space-y-2">
              {filteredTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="h-5 w-5 cursor-pointer rounded border-zinc-300 accent-zinc-900 dark:border-zinc-600"
                  />
                  <span
                    className={`flex-1 ${
                      todo.completed
                        ? "text-zinc-400 line-through dark:text-zinc-500"
                        : "text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="rounded bg-zinc-200 px-2 py-1 text-zinc-600 transition-colors hover:bg-zinc-300 hover:text-red-500 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-red-400"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            )}
          </>
        )}

        {todos.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>
              {todos.filter((t) => t.completed).length} of {todos.length} completed
            </span>
            {todos.some((t) => t.completed) && (
              <button
                onClick={clearCompleted}
                className="text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Clear completed
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
