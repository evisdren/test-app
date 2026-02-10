"use client";

import { useState, useEffect, DragEvent } from "react";

interface Todo {
  id: number;
  text: string;
  status: "backlog" | "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
}

const STORAGE_KEY = "kanban-todos";

const columns = [
  { id: "backlog" as const, title: "Backlog", color: "bg-purple-500" },
  { id: "todo" as const, title: "To Do", color: "bg-zinc-500" },
  { id: "in-progress" as const, title: "In Progress", color: "bg-blue-500" },
  { id: "done" as const, title: "Done", color: "bg-green-500" },
];

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTodos(JSON.parse(stored));
    } else {
      setTodos([
        { id: 1, text: "Review pull request", status: "todo", priority: "medium", dueDate: "2026-02-12" },
        { id: 2, text: "Fix login bug", status: "in-progress", priority: "high", dueDate: "2026-02-11" },
        { id: 3, text: "Write unit tests", status: "todo", priority: "low" },
        { id: 4, text: "Update documentation", status: "done", priority: "low", dueDate: "2026-02-08" },
        { id: 5, text: "Deploy to staging", status: "in-progress", priority: "high" },
      ]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const addTodo = () => {
    if (inputValue.trim() === "") return;
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: inputValue.trim(),
        status: "todo",
        priority,
        dueDate: dueDate || undefined,
      },
    ]);
    setInputValue("");
    setDueDate("");
    setPriority("medium");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleDragStart = (e: DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: DragEvent, status: Todo["status"]) => {
    e.preventDefault();
    if (draggedId === null) return;

    setTodos(
      todos.map((todo) =>
        todo.id === draggedId ? { ...todo, status } : todo
      )
    );
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editingId === null) return;
    if (editText.trim() === "") {
      deleteTodo(editingId);
    } else {
      setTodos(
        todos.map((todo) =>
          todo.id === editingId ? { ...todo, text: editText.trim() } : todo
        )
      );
    }
    setEditingId(null);
    setEditText("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditText("");
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getTodosByStatus = (status: Todo["status"]) => {
    return todos.filter((todo) => todo.status === status);
  };

  const getPriorityStyle = (priority: Todo["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 py-8 font-sans dark:bg-zinc-900">
      <header className="px-6">
        <h1 className="mb-6 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Kanban Board
        </h1>

        <div className="mx-auto mb-8 flex max-w-xl gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Todo["priority"])}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-3 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-3 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <button
            onClick={addTodo}
            className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add
          </button>
        </div>
      </header>

      <main className="flex flex-1 gap-4 overflow-x-auto px-6 pb-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex w-80 flex-shrink-0 flex-col rounded-xl bg-zinc-100 dark:bg-zinc-800"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center gap-2 p-4">
              <div className={`h-3 w-3 rounded-full ${column.color}`} />
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                {column.title}
              </h2>
              <span className="ml-auto rounded-full bg-zinc-200 px-2 py-0.5 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                {getTodosByStatus(column.id).length}
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {getTodosByStatus(column.id).map((todo) => (
                <div
                  key={todo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo.id)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-grab rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-all active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-900 ${
                    draggedId === todo.id ? "opacity-50" : ""
                  }`}
                >
                  <span
                    className={`mb-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${getPriorityStyle(
                      todo.priority
                    )}`}
                  >
                    {todo.priority}
                  </span>
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:text-zinc-50"
                    />
                  ) : (
                    <p
                      onDoubleClick={() => startEditing(todo)}
                      className={`text-sm ${
                        todo.status === "done"
                          ? "text-zinc-400 line-through dark:text-zinc-500"
                          : "text-zinc-900 dark:text-zinc-50"
                      }`}
                    >
                      {todo.text}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    {todo.dueDate ? (
                      <span
                        className={`text-xs ${
                          todo.status === "done"
                            ? "text-zinc-400 dark:text-zinc-500"
                            : isOverdue(todo.dueDate)
                            ? "font-medium text-red-500"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {isOverdue(todo.dueDate) && todo.status !== "done"
                          ? "Overdue: "
                          : "Due: "}
                        {formatDate(todo.dueDate)}
                      </span>
                    ) : (
                      <span />
                    )}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {getTodosByStatus(column.id).length === 0 && (
                <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
                  Drop tasks here
                </p>
              )}
            </div>
          </div>
        ))}
      </main>

      <footer className="px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {todos.length} total tasks · {getTodosByStatus("done").length} completed
      </footer>
    </div>
  );
}
