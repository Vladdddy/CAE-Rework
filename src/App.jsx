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
import ChangePassword from "./pages/ChangePassword";
import VerifyEmail from "./pages/VerifyEmail";
import { TaskProvider } from "./components/data/provider/taskAPI/TaskContext.jsx";
import { LogbookProvider } from "./components/data/provider/logbookAPI/LogbookContext.jsx";
import { UserProvider } from "./components/data/provider/userAPI/UserContext.jsx";
import { NoteProvider } from "./components/data/provider/noteAPI/NoteContext.jsx";
import { NoteLogbookProvider } from "./components/data/provider/noteLogbookAPI/NoteLogbookContext.jsx";
import { SimulatorProvider } from "./components/data/provider/simulatorAPI/SimulatorContext.jsx";
import { EmployeeShiftsProvider } from "./components/data/provider/employeeShiftsAPI/EmployeeShiftsContext.jsx";
import { EmployeeOverviewProvider } from "./components/data/provider/employeeOverviewAPI/EmployeeOverviewContext.jsx";
import { EmployeeMessageProvider } from "./components/data/provider/employeeMessageAPI/EmployeeMessageContext.jsx";
import { PatternShiftProvider } from "./components/data/provider/patternShiftAPI/PatternShiftContext.jsx";
import { EmployeeShiftsProvider as EmployeeShiftsProviderMonthly } from "./components/data/provider/employeeShiftsAPI_variant/EmployeeShiftsContext.jsx";
import { ShiftOrderProvider } from "./components/data/provider/shiftOrderAPI/ShiftOrderContext.jsx";
import { ImageTaskProvider } from "./components/data/provider/imageTaskAPI/ImageTaskContext.jsx";
import { ImageLogbookProvider } from "./components/data/provider/imageLogbookAPI/ImageLogbookContext.jsx";
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
        <EmployeeShiftsProviderMonthly>
            <ShiftOrderProvider>
                <PatternShiftProvider>
                    <NoteLogbookProvider>
                        <LogbookProvider>
                            <NoteProvider>
                                <UserProvider>
                                    <TaskProvider>
                                        <ImageTaskProvider>
                                            <ImageLogbookProvider>
                                                <SimulatorProvider>
                                                    <EmployeeShiftsProvider>
                                                        <EmployeeOverviewProvider>
                                                            <EmployeeMessageProvider>
                                                                <Router>
                                                                    <Routes>
                                                                        <Route
                                                                            path="/"
                                                                            element={
                                                                                <Navigate
                                                                                    to="/dashboard"
                                                                                    replace
                                                                                />
                                                                            }
                                                                        />
                                                                        <Route
                                                                            path="/change-password"
                                                                            element={
                                                                                <PublicRoute>
                                                                                    <ChangePassword />
                                                                                </PublicRoute>
                                                                            }
                                                                        />
                                                                        <Route
                                                                            path="/verify-email"
                                                                            element={
                                                                                <PublicRoute>
                                                                                    <VerifyEmail />
                                                                                </PublicRoute>
                                                                            }
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
                                                            </EmployeeMessageProvider>
                                                        </EmployeeOverviewProvider>
                                                    </EmployeeShiftsProvider>
                                                </SimulatorProvider>
                                            </ImageLogbookProvider>
                                        </ImageTaskProvider>
                                    </TaskProvider>
                                </UserProvider>
                            </NoteProvider>
                        </LogbookProvider>
                    </NoteLogbookProvider>
                </PatternShiftProvider>
            </ShiftOrderProvider>
        </EmployeeShiftsProviderMonthly>
    );
}

export default App;
