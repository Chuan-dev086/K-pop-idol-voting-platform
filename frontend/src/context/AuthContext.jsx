import { createContext, useContext, useState } from "react";
import api from "../services/api";

// create a context object
const AuthContext = createContext();

/* lazy init: read user from localStorage on first render */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  //   when user logout it will clear the token and user in localstorage
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);

    return user;
  };

  const register = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    return res.data;
  };

  const refreshUser = async () => {
    const res = await api.get("/auth/me");
    const updatedUser = res.data.user;
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  };

  //   pack the object and set to provider
  const value = { user, login, logout, setUser, register, refreshUser };

  //   return the value and render out the children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// pack the useContext and AuthContext become custom hook 'useAuth'
export const useAuth = () => {
  return useContext(AuthContext);
};
