import { createContext, useContext, useState } from "react";

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

  //   pack the object and set to provider
  const value = { user, logout, setUser };

  //   return the value and render out the children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// pack the useContext and AuthContext become custom hook 'useAuth'
export const useAuth = () => {
  return useContext(AuthContext);
};
