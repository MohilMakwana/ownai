import React, { useState } from "react";

const Note = ({ note, deleteNote, editNote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...note });

  const saveEdit = () => {
    editNote(note.id, editedData);
    setIsEditing(false);
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "10px", margin: "5px 0" }}>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editedData.title}
            onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
          />
          <textarea
            value={editedData.content}
            onChange={(e) =>
              setEditedData({ ...editedData, content: e.target.value })
            }
          />
          <select
            value={editedData.priority}
            onChange={(e) =>
              setEditedData({ ...editedData, priority: e.target.value })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={saveEdit}>Save</button>
        </div>
      ) : (
        <div>
          <h4>{note.title}</h4>
          <p>{note.content}</p>
          <p>Priority: {note.priority}</p>
          <button onClick={() => setIsEditing(true)} style={{marginRight:"5px"}}>Edit</button>
          <button onClick={() => deleteNote(note.id)}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default Note;
