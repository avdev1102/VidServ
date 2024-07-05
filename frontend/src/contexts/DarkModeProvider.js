import React, { createContext, useContext } from "react";
import useDarkMode from "../hooks/useDarkMode";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkModeContext() {
    return useContext(DarkModeContext);
}
