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
import { TaskProvider } from "./components/data/provider/TaskContext.jsx";
import "./App.css";

function App() {
    return (
        <TaskProvider>
            <Router>
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/logbook" element={<Logbook />} />
                    <Route path="/signin" element={<Signin />} />
                    <Route path="/shifts" element={<Shifts />} />
                </Routes>
            </Router>
        </TaskProvider>
    );
}

export default App;
