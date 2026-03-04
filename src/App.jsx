import React, { useState, useEffect, useRef } from "react";

const COLOR_KEYS = ["orange", "yellow", "purple", "blue", "green"];

const colorMap = {
  orange: "bg-orange-300",
  yellow: "bg-yellow-200",
  purple: "bg-purple-300",
  blue:   "bg-sky-300",
  green:  "bg-lime-200",
};

const dotMap = {
  orange: "bg-orange-400",
  yellow: "bg-yellow-300",
  purple: "bg-purple-400",
  blue:   "bg-sky-400",
  green:  "bg-lime-300",
};

const INITIAL_NOTES = [
  { id: 1, title: "This is Heated note.", color: "orange", date: "" },
  { id: 2, title: "Screenless design UI jobs — 7 types of UX/UI roles that don't require a screen.", color: "yellow", date: "May 21, 2020" },
  { id: 3, title: "13 Things You Should Give Up If You Want To Be a Successful UX Designer.", color: "orange", date: "May 25, 2020" },
  { id: 4, title: "10 UI & UX lessons learned from designing for scale.", color: "purple", date: "" },
  { id: 5, title: "52 Research Terms you need to know as a UX Designer in 2019.", color: "green", date: "" },
  { id: 6, title: "Text fields & Forms design — UI components series.", color: "blue", date: "" },
];

function loadNotes() {
  try {
    const saved = localStorage.getItem("heated-notes");
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  } catch {
    return INITIAL_NOTES;
  }
}

const App = () => {
  const [notes, setNotes] = useState(loadNotes);
  const [query, setQuery] = useState("");
  const [activeColor, setActiveColor] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const textareaRef = useRef(null);

  // Persist notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("heated-notes", JSON.stringify(notes));
  }, [notes]);

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (editingId !== null && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [editingId]);

  const filteredNotes = notes.filter((note) => {
    const matchesQuery = note.title.toLowerCase().includes(query.toLowerCase());
    const matchesColor = activeColor === "all" || note.color === activeColor;
    return matchesQuery && matchesColor;
  });

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: "New note ✍️",
      color: "orange",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    };
    setNotes((prev) => [newNote, ...prev]);
    // Start editing the new note right away
    setEditingId(newNote.id);
    setEditText(newNote.title);
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditText(note.title);
  };

  const saveEditing = () => {
    if (editingId === null) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === editingId ? { ...n, title: editText.trim() || n.title } : n))
    );
    setEditingId(null);
  };

  const changeColor = (id, color) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color } : n)));
  };

  const toggleColorFilter = (color) => {
    setActiveColor((prev) => (prev === color ? "all" : color));
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-20 min-h-screen bg-white flex flex-col items-center py-6 gap-5 shadow-sm sticky top-0 h-screen">
          <div className="text-xs font-bold text-gray-800 tracking-wide">Heated</div>

          {/* Add Note Button */}
          <button
            onClick={addNote}
            title="Add note"
            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl hover:bg-gray-700 transition-colors shadow"
          >
            +
          </button>

          {/* Color Filter Dots */}
          <div className="flex flex-col gap-3 mt-2">
            {COLOR_KEYS.map((color) => (
              <button
                key={color}
                title={`Filter by ${color}`}
                onClick={() => toggleColorFilter(color)}
                className={`w-3.5 h-3.5 rounded-full ${dotMap[color]} transition-all duration-150 ${
                  activeColor === color
                    ? "ring-2 ring-offset-2 ring-gray-700 scale-125"
                    : "hover:scale-110 opacity-70 hover:opacity-100"
                }`}
              />
            ))}
            {/* "All" reset */}
            {activeColor !== "all" && (
              <button
                title="Show all"
                onClick={() => setActiveColor("all")}
                className="text-[10px] text-gray-400 hover:text-gray-700 leading-none mt-1 transition-colors"
              >
                all
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-10 py-8">
          {/* Header */}
          <div className="flex items-center gap-8 mb-10">
            <h1 className="text-5xl font-bold text-gray-900">Notes</h1>
            <input
              type="text"
              placeholder="Search notes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-white rounded-full px-5 py-2 shadow-sm outline-none border border-gray-200 w-80 text-sm focus:ring-2 focus:ring-gray-300 transition"
            />
            {activeColor !== "all" && (
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotMap[activeColor]}`} />
                Filtering by {activeColor}
                <button
                  onClick={() => setActiveColor("all")}
                  className="ml-1 text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-24 text-gray-400 select-none">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg font-medium">No notes found</p>
              <p className="text-sm mt-1">
                {query ? `No results for "${query}"` : "Click + to create your first note"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`relative rounded-2xl p-5 shadow-sm transition-all duration-200 group ${colorMap[note.color]} ${
                    hoveredId === note.id ? "shadow-md -translate-y-0.5" : ""
                  }`}
                  style={{ minHeight: "11rem" }}
                  onMouseEnter={() => setHoveredId(note.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteNote(note.id)}
                    title="Delete note"
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/10 hover:bg-red-400 hover:text-white text-gray-600 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150"
                  >
                    ×
                  </button>

                  {/* Note Title — editable on click */}
                  {editingId === note.id ? (
                    <textarea
                      ref={textareaRef}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={saveEditing}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") saveEditing();
                        if (e.key === "Enter" && e.metaKey) saveEditing();
                      }}
                      rows={4}
                      className="w-full bg-transparent resize-none outline-none text-gray-900 font-medium text-sm leading-relaxed pr-6"
                    />
                  ) : (
                    <p
                      onClick={() => startEditing(note)}
                      title="Click to edit"
                      className="text-gray-900 font-medium text-sm leading-relaxed pr-6 cursor-text"
                    >
                      {note.title}
                    </p>
                  )}

                  {/* Date */}
                  {note.date && (
                    <p className="absolute bottom-10 left-5 text-xs text-gray-600 opacity-70">
                      {note.date}
                    </p>
                  )}

                  {/* Color Picker */}
                  <div className="absolute bottom-3 left-5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    {COLOR_KEYS.map((c) => (
                      <button
                        key={c}
                        title={c}
                        onClick={() => changeColor(note.id, c)}
                        className={`w-3 h-3 rounded-full ${dotMap[c]} transition-transform hover:scale-125 ${
                          note.color === c ? "ring-1 ring-offset-1 ring-gray-700 scale-110" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
