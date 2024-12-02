import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    const users = await api.getUsers();
    const userExists = users.some((user) => user.email === email);

    if (!userExists) {
      await api.addUser({ email, password, boards: [] });
      alert("Signup successful!");
      navigate("/");
    } else {
      alert("User already exists!");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignup}>Signup</button>
      <p onClick={() => navigate("/")}>Already have an account? Login</p>
    </div>
  );
};

export default Signup;
