import React, { useState, useEffect } from "react";
import Note from "./Note";
import api from "../api";

const Board = ({ board, deleteBoard, updateBoard }) => {
  const [notes, setNotes] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", priority: "" });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      const boards = await api.getUserBoards(JSON.parse(localStorage.getItem("currentUser")).email);
      const currentBoard = boards.find((b) => b.id === board.id);
      setNotes(currentBoard?.notes || []);
    };
    fetchNotes();
  }, [board.id]);

  const saveNotes = async (updatedNotes) => {
    setNotes(updatedNotes);

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const updatedBoards = currentUser.boards.map((b) =>
      b.id === board.id ? { ...b, notes: updatedNotes } : b
    );

    // Persist to localStorage and database
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ ...currentUser, boards: updatedBoards })
    );
    await api.updateUserBoards(currentUser.email, updatedBoards);
  };

  const addNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const noteToAdd = { id: Date.now(), ...newNote }; // Create the new note
      const updatedNotes = [...notes, noteToAdd]; // Add new note to the notes array
      setNotes(updatedNotes); // Update local state
      updateBoard(board.id, updatedNotes); // Update board in parent component
      setNewNote({ title: "", content: "", priority: "low" }); // Clear input fields only after successful addition
    } else {
      alert("Please fill in all fields before adding a note.");
    }
  };

  const deleteNote = async (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    await saveNotes(updatedNotes);
    updateBoard(board.id, updatedNotes);
  };

  const editNote = async (noteId, updatedNote) => {
    const updatedNotes = notes.map((note) =>
      note.id === noteId ? { ...note, ...updatedNote } : note
    );
    await saveNotes(updatedNotes);
    updateBoard(board.id, updatedNotes); 
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleShowNotes = () => setShowNotes(!showNotes);

  const priorityCounts = notes.reduce(
    (counts, note) => {
      counts[note.priority] += 1;
      return counts;
    },
    { low: 0, medium: 0, high: 0 }
  );

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
      <h3>{board.name}</h3>
      <button onClick={() => deleteBoard(board.id)} style={{marginRight:"5px"}}>Delete Board</button>
      <button onClick={toggleShowNotes}>
        {showNotes ? "Hide Notes" : "Show Notes"}
      </button>

      {showNotes && (
        <>
          <div>
            <p>Total Notes: {notes.length}</p>
            <p>Low Priority: {priorityCounts.low}</p>
            <p>Medium Priority: {priorityCounts.medium}</p>
            <p>High Priority: {priorityCounts.high}</p>
          </div>

          <input
            type="text"
            placeholder="Search Notes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div>
            {filteredNotes.map((note) => (
              <Note
                key={note.id}
                note={note}
                deleteNote={deleteNote}
                editNote={editNote}
              />
            ))}
          </div>

          <div>
            <input
              type="text"
              placeholder="Title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
            <textarea
              placeholder="Content"
              value={newNote.content}
              onChange={(e) =>
                setNewNote({ ...newNote, content: e.target.value })
              }
            />
            <select
              value={newNote.priority}
              onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button onClick={addNote}>Add Note</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Board;
