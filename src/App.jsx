import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Logbook from "./pages/Logbook";
import Signin from "./pages/Signin";
import Shifts from "./pages/Shifts";
import Register from "./pages/Register";
import { TaskProvider } from "./components/data/provider/taskAPI/TaskContext.jsx";
import { UserProvider } from "./components/data/provider/userAPI/UserContext.jsx";
import { NoteProvider } from "./components/data/provider/noteAPI/NoteContext.jsx";
import "./App.css";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    return children;
};

const PublicRoute = ({ children }) => {
    return children;
};

function App() {
    return (
        <NoteProvider>
            <UserProvider>
                <TaskProvider>
                    <Router>
                        <Routes>
                            <Route
                                path="/"
                                element={<Navigate to="/dashboard" replace />}
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tasks"
                                element={
                                    <ProtectedRoute>
                                        <Tasks />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/logbook"
                                element={
                                    <ProtectedRoute>
                                        <Logbook />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/signin"
                                element={
                                    <PublicRoute>
                                        <Signin />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <PublicRoute>
                                        <Register />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/shifts"
                                element={
                                    <ProtectedRoute>
                                        <Shifts />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Router>
                </TaskProvider>
            </UserProvider>
        </NoteProvider>
    );
}

export default App;
