import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const api = {
  getUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  },

  addUser: async (user) => {
    const response = await axios.post(`${API_BASE_URL}/users`, user);
    return response.data;
  },

  getUserBoards: async (email) => {
    const users = await api.getUsers();
    const user = users.find((u) => u.email === email);
    return user ? user.boards : [];
  },

  updateUserBoards: async (email, updatedBoards) => {
    const users = await api.getUsers();
    const user = users.find((u) => u.email === email);

    if (user) {
      const updatedUser = { ...user, boards: updatedBoards };
      await axios.put(`${API_BASE_URL}/users/${user.id}`, updatedUser);
    }
  },
};

export default api;
