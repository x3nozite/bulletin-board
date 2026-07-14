"use client"

import { useNoteStore } from "../store/useNoteStore";

export function AddItemBox() {
  const addNote = useNoteStore(n => n.addNote)

  const addNewNote = () => {
    addNote({
      id: crypto.randomUUID(),
      x: 50, y: 50,
      width: 150, height: 150,
      text: "new note"
    })
  }
  return (
    <button
      onClick={() => addNewNote()}
      className="flex flex-col items-center justify-center min-h-50 w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-6 text-muted-foreground transition-all hover:border-foreground hover:bg-muted/20 hover:text-foreground group"
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
    </button>
  );
}
