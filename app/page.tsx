"use client";

import { useState, useEffect, DragEvent } from "react";

interface Todo {
  id: number;
  text: string;
  status: "backlog" | "todo" | "in-progress" | "done";
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  description?: string;
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
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTodos(JSON.parse(stored));
    } else {
      setTodos([
        { id: 1, text: "Review pull request", status: "todo", dueDate: "2026-02-12", priority: "medium" },
        { id: 2, text: "Fix login bug", status: "in-progress", dueDate: "2026-02-11", priority: "high" },
        { id: 3, text: "Write unit tests", status: "todo", priority: "low" },
        { id: 4, text: "Update documentation", status: "done", dueDate: "2026-02-08", priority: "low" },
        { id: 5, text: "Deploy to staging", status: "in-progress", priority: "high" },
        { id: 6, text: "Refactor auth module", status: "backlog", priority: "medium" },
        { id: 7, text: "Set up CI/CD pipeline", status: "backlog", dueDate: "2026-02-20", priority: "high" },
        { id: 8, text: "Design new landing page", status: "todo", dueDate: "2026-02-18", priority: "medium" },
        { id: 9, text: "Fix mobile responsiveness", status: "in-progress", dueDate: "2026-02-14", priority: "medium" },
        { id: 10, text: "Add dark mode toggle", status: "done", priority: "low" },
        { id: 11, text: "Optimize database queries", status: "backlog", priority: "high" },
        { id: 12, text: "Write API documentation", status: "todo", dueDate: "2026-02-16", priority: "low" },
      ]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedTask) {
        setSelectedTask(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedTask]);

  const addTodo = () => {
    if (inputValue.trim() === "") return;
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: inputValue.trim(),
        status: "todo",
        dueDate: dueDate || undefined,
        priority,
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

  const handleDragOver = (e: DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: DragEvent, status: Todo["status"]) => {
    e.preventDefault();
    setDragOverColumn(null);
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
    setDragOverColumn(null);
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

  const getPriorityColor = (priority?: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-zinc-400";
    }
  };

  const updateTask = (updatedTask: Todo) => {
    setTodos(todos.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  const getStatusLabel = (status: Todo["status"]) => {
    const col = columns.find((c) => c.id === status);
    return col?.title || status;
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-zinc-900">
      {/* Left Sidebar */}
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="p-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">justdoit</h2>
        </div>

        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            <li>
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                All Tasks
                <span className="ml-auto rounded-full bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-600">
                  {todos.length}
                </span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                In Progress
                <span className="ml-auto rounded-full bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-600">
                  {getTodosByStatus("in-progress").length}
                </span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed
                <span className="ml-auto rounded-full bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-600">
                  {getTodosByStatus("done").length}
                </span>
              </a>
            </li>
          </ul>

          <div className="mt-6">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Priority
            </h3>
            <ul className="mt-2 space-y-1">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  High
                  <span className="ml-auto rounded-full bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-600">
                    {todos.filter((t) => t.priority === "high").length}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Medium
                  <span className="ml-auto rounded-full bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-600">
                    {todos.filter((t) => t.priority === "medium").length}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Low
                  <span className="ml-auto rounded-full bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-600">
                    {todos.filter((t) => t.priority === "low").length}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-700">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {todos.length} total tasks
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col py-8">
        <header className="px-6">
          <h1 className="mb-6 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            justdoit
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
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-3 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-3 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
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
            className={`flex w-80 flex-shrink-0 flex-col rounded-xl transition-colors duration-200 ${
              dragOverColumn === column.id
                ? "bg-zinc-200 ring-2 ring-zinc-400 dark:bg-zinc-700 dark:ring-zinc-500"
                : "bg-zinc-100 dark:bg-zinc-800"
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
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
                  onClick={() => setSelectedTask(todo)}
                  className={`cursor-grab rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 ${
                    draggedId === todo.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${getPriorityColor(todo.priority)}`}
                      title={`${todo.priority || "no"} priority`}
                    />
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
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {todo.dueDate && (
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
                      )}
                      {todo.description && (
                        <span className="text-zinc-400 dark:text-zinc-500" title="Has notes">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTodo(todo.id);
                      }}
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

        <footer className="px-6">
          <div className="mx-auto max-w-md">
            <div className="mb-1 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span>{getTodosByStatus("done").length} of {todos.length} tasks completed</span>
              <span>{todos.length > 0 ? Math.round((getTodosByStatus("done").length / todos.length) * 100) : 0}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
                style={{ width: `${todos.length > 0 ? (getTodosByStatus("done").length / todos.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </footer>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-150"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Task Details
                </h2>
                {selectedTask.dueDate && isOverdue(selectedTask.dueDate) && selectedTask.status !== "done" && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    Overdue
                  </span>
                )}
                {selectedTask.status === "done" && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    Completed
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                title="Close (Esc)"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Text */}
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Task
                </label>
                <input
                  type="text"
                  value={selectedTask.text}
                  onChange={(e) => updateTask({ ...selectedTask, text: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </label>
                <select
                  value={selectedTask.status}
                  onChange={(e) => updateTask({ ...selectedTask, status: e.target.value as Todo["status"] })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Priority
                </label>
                <select
                  value={selectedTask.priority || "medium"}
                  onChange={(e) => updateTask({ ...selectedTask, priority: e.target.value as "low" | "medium" | "high" })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Due Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={selectedTask.dueDate || ""}
                    onChange={(e) => updateTask({ ...selectedTask, dueDate: e.target.value || undefined })}
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  />
                  {selectedTask.dueDate && (
                    <button
                      onClick={() => updateTask({ ...selectedTask, dueDate: undefined })}
                      className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                      title="Clear due date"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Description/Notes */}
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Notes
                </label>
                <textarea
                  value={selectedTask.description || ""}
                  onChange={(e) => updateTask({ ...selectedTask, description: e.target.value || undefined })}
                  placeholder="Add notes or details..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-500"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {selectedTask.status !== "done" ? (
                  <button
                    onClick={() => updateTask({ ...selectedTask, status: "done" })}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark as Done
                  </button>
                ) : (
                  <button
                    onClick={() => updateTask({ ...selectedTask, status: "todo" })}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reopen Task
                  </button>
                )}
              </div>

              {/* Task Info */}
              <div className="flex items-center gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${getPriorityColor(selectedTask.priority)}`} />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {selectedTask.priority || "No"} priority
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${columns.find((c) => c.id === selectedTask.status)?.color}`} />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {getStatusLabel(selectedTask.status)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      deleteTodo(selectedTask.id);
                      setSelectedTask(null);
                    }}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      const duplicate: Todo = {
                        ...selectedTask,
                        id: Date.now(),
                        text: `${selectedTask.text} (copy)`,
                        status: "todo",
                      };
                      setTodos([...todos, duplicate]);
                      setSelectedTask(duplicate);
                    }}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  >
                    Duplicate
                  </button>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
