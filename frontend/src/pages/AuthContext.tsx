import React, { createContext, useContext, useState } from "react";

interface User {
    username: string;
    email: string;
    idUser: number; // Asegúrate de tener esta propiedad
  }

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const userAuth = () => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth debe usarse dentro de un AuthProvider");  
    };
    return context;
};