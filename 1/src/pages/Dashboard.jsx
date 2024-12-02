import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../components/Board";
import api from "../api";

const Dashboard = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [boards, setBoards] = useState([]);
  const [boardName, setBoardName] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    } else {
      const fetchBoards = async () => {
        const userBoards = await api.getUserBoards(currentUser.email);
        setBoards(userBoards);
      };
      fetchBoards();
    }
  }, [currentUser, navigate]);

  const addBoard = async () => {
    if (boardName.trim()) {
      const newBoard = { id: Date.now(), name: boardName, notes: [] };
      const updatedBoards = [...boards, newBoard];
      setBoards(updatedBoards);
      setBoardName("");
      await api.updateUserBoards(currentUser.email, updatedBoards);
    }
  };

  const deleteBoard = async (boardId) => {
    const updatedBoards = boards.filter((board) => board.id !== boardId);
    setBoards(updatedBoards);
    await api.updateUserBoards(currentUser.email, updatedBoards);
  };

  return (
    <div>
      <h2>Welcome, {currentUser?.email}</h2>
      <button
        onClick={() => {
          localStorage.removeItem("currentUser");
          navigate("/");
        }}
      >
        Logout
      </button>
      <input
        type="text"
        placeholder="New Board Name"
        value={boardName}
        onChange={(e) => setBoardName(e.target.value)}
      />
      <button onClick={addBoard}>Add Board</button>
      <div>
  {boards.map((board) => (
    <Board
      key={board.id}
      board={board}
      deleteBoard={deleteBoard}
      updateBoard={(boardId, updatedNotes) => {
        const updatedBoards = boards.map((b) =>
          b.id === boardId ? { ...b, notes: updatedNotes } : b
        );
        setBoards(updatedBoards);
        api.updateUserBoards(currentUser.email, updatedBoards);
      }}
    />
  ))}
</div>
    </div>
  );
};

export default Dashboard;
