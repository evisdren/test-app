"use client";

import { useState } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 py-12 font-sans dark:bg-zinc-900">
      <main className="w-full max-w-lg px-4">
        <h1 className="mb-8 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Todo App
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

        {todos.length === 0 ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            No todos yet. Add one above!
          </p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
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

        {todos.length > 0 && (
          <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {todos.filter((t) => t.completed).length} of {todos.length} completed
          </p>
        )}
      </main>
    </div>
  );
}
