"use client";

import { useState, useEffect, DragEvent } from "react";

type Status = "todo" | "in-progress" | "done";

interface Todo {
  id: number;
  text: string;
  status: Status;
  dueDate?: string;
}

const STORAGE_KEY = "kanban-todos";

const COLUMNS: { id: Status; title: string }[] = [
  { id: "todo", title: "Todo" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export default function KanbanBoard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

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
      {
        id: Date.now(),
        text: inputValue.trim(),
        status: "todo",
        dueDate: dueDate || undefined,
      },
    ]);
    setInputValue("");
    setDueDate("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, status: Status) => {
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

  const getColumnTodos = (status: Status) =>
    todos.filter((todo) => todo.status === status);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 p-6 font-sans dark:bg-zinc-900">
      <header className="mb-6">
        <h1 className="text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Kanban Board
        </h1>
      </header>

      <div className="mb-6 flex justify-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
          className="w-64 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <button
          onClick={addTodo}
          className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add
        </button>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="flex w-80 min-w-[320px] flex-col rounded-lg bg-zinc-100 dark:bg-zinc-800"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                {column.title}
              </h2>
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-sm text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {getColumnTodos(column.id).length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {getColumnTodos(column.id).map((todo) => (
                <div
                  key={todo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo.id)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-grab rounded-lg border bg-white p-3 shadow-sm transition-all active:cursor-grabbing dark:bg-zinc-700 ${
                    draggedId === todo.id
                      ? "border-zinc-400 opacity-50 dark:border-zinc-500"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-600 dark:hover:border-zinc-500"
                  } ${
                    todo.status === "done"
                      ? "opacity-75"
                      : ""
                  }`}
                >
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
                    <>
                      <p
                        onDoubleClick={() => startEditing(todo)}
                        className={`mb-2 cursor-pointer text-sm ${
                          todo.status === "done"
                            ? "text-zinc-400 line-through dark:text-zinc-500"
                            : "text-zinc-900 dark:text-zinc-50"
                        }`}
                      >
                        {todo.text}
                      </p>
                      <div className="flex items-center justify-between">
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
                          className="rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-600 dark:hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {getColumnTodos(column.id).length === 0 && (
                <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
                  Drop tasks here
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
