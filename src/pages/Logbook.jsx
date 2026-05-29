import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import Calendar from "../components/layout/Calendar.jsx";
import MobileCalendar from "../components/layout/MobileCalendar.jsx";
import DatePickerComponent from "../functions/DatePicker.jsx";
import Table from "../components/data/Table.jsx";
import { useState, useEffect, useMemo, useRef } from "react";
import LogbookIcon from "../assets/icons/logbook.tsx";
import SimulatorIcon from "../assets/icons/simulator.tsx";
import BackIcon from "../assets/icons/back.tsx";
import CreateModal from "../components/modals/CreateModal.jsx";
import SimulatorModal from "../components/modals/SimulatorModal.jsx";
import Popup from "../components/modals/Popup.jsx";
import { GetTodayDate } from "../functions/CurrentTime.jsx";
import { useTasks } from "../components/data/provider/taskAPI/useTasks";
import { useUnavailableTasks } from "../components/data/provider/unavailableTaskAPI/useUnavailableTasks";
import { useTaskSimOne } from "../components/data/provider/taskSimOneAPI/useTaskSimOne";
import { getPmPlanTime } from "../functions/GetPmPlanTime.jsx";
import { usePMTechComments } from "../components/data/provider/PMTechCommentsAPI/usePMTechComments";
import { useUnavailableLogbooks } from "../components/data/provider/unavailableLogbookAPI/useUnavailableLogbooks";
import { useLogbooks } from "../components/data/provider/logbookAPI/useLogbooks";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import { useSimulators } from "../components/data/provider/simulatorAPI/useSimulators";
import { useTrainingLoads } from "../components/data/provider/trainingLoadAPI/useTrainingLoads";
import { exportTasksToPDF } from "../functions/ExportPDF.jsx";

const SIMULATOR_MAP = {
    1: "109FFS",
    2: "FTD",
    3: "139#1",
    4: "139#3",
    5: "169",
    6: "189",
    13: "109FFS",
};

function Logbook() {
    const { tasks, loading, fetchTasks } = useTasks();
    const {
        tasks: unavailableTasks,
        loading: unavailableLoading,
        fetchTasks: fetchUnavailableTasks,
    } = useUnavailableTasks();
    const { taskSimOne, unfinishedPmTasks, fetchUnfinishedPmTasks } =
        useTaskSimOne();
    const { techComments } = usePMTechComments();
    const {
        logbooks: unavailableLogbooks,
        loading: unavailableLogbooksLoading,
        fetchLogbooks: fetchUnavailableLogbooks,
    } = useUnavailableLogbooks();
    const { logbooks, fetchLogbooks } = useLogbooks();
    const { simulators: todaySimulators } = useSimulators();
    const { trainingLoads } = useTrainingLoads();
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("success");
    const [popupMessage, setPopupMessage] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [selectedDay, setSelectedDay] = useState(null);
    const { users, currentUserRole } = useUsers();
    const [viewDays, setViewDays] = useState(1);
    const [showExportReportMenu, setShowExportReportMenu] = useState(false);
    const [showExportActivityMenu, setShowExportActivityMenu] = useState(false);
    const [showEmailMenu, setShowEmailMenu] = useState(false);
    const exportReportMenuRef = useRef(null);
    const exportActivityMenuRef = useRef(null);
    const emailMenuRef = useRef(null);

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                exportReportMenuRef.current &&
                !exportReportMenuRef.current.contains(event.target)
            ) {
                setShowExportReportMenu(false);
            }
            if (
                exportActivityMenuRef.current &&
                !exportActivityMenuRef.current.contains(event.target)
            ) {
                setShowExportActivityMenu(false);
            }
            if (
                emailMenuRef.current &&
                !emailMenuRef.current.contains(event.target)
            ) {
                setShowEmailMenu(false);
            }
        };

        if (showExportReportMenu || showExportActivityMenu || showEmailMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showExportReportMenu, showExportActivityMenu, showEmailMenu]);

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setShowCalendar(false);
        const newDate = new Date(startDate);
        newDate.setDate(day);
        setStartDate(newDate);
    };

    const handleBackToCalendar = () => {
        setShowCalendar(true);
        setSelectedDay(null);
    };

    const handleTaskClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSimulatorClick = () => {
        setIsSimulatorModalOpen(true);
    };

    const handleCloseSimulatorModal = () => {
        setIsSimulatorModalOpen(false);
    };

    const handleSuccess = async (isSuccess, message) => {
        if (isSuccess) {
            await fetchTasks();
            await fetchUnavailableTasks();
            await fetchLogbooks();
            await fetchUnavailableLogbooks();
        }
        setPopupType(isSuccess ? "success" : "error");
        setPopupMessage(
            message ||
                (isSuccess
                    ? "Hai creato la task con successo"
                    : "Errore durante la creazione della task"),
        );
        setShowPopup(true);
        setTimeout(() => {
            setShowPopup(false);
        }, 2000);
    };

    const handleExportPDF = async (
        timeFilter = null,
        exportType = "report",
    ) => {
        try {
            const normalizedUnavailableTasks = (unavailableTasks || []).map(
                (task) => ({
                    ...task,
                    IS_UNAVAILABLE: true,
                }),
            );

            const resolvePmAssignees = (raw) => {
                const ids =
                    typeof raw === "number"
                        ? [raw]
                        : typeof raw === "string"
                          ? raw
                                .split(",")
                                .map((v) => Number(v.trim()))
                                .filter(Number.isInteger)
                          : [];
                return (
                    ids
                        .map((id) => users.find((u) => u.ID === id)?.Username)
                        .filter(Boolean)
                        .join(", ") || ""
                );
            };

            const normalizedPmTasks = (taskSimOne || [])
                .filter((task) => {
                    const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                    return simulatorId && SIMULATOR_MAP[simulatorId];
                })
                .map((task) => {
                    const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                    const taskDone = task["Task done"] ?? task["Task Done"];
                    const isDone =
                        taskDone !== undefined &&
                        taskDone !== null &&
                        Boolean(taskDone);
                    return {
                        ...task,
                        ID: task["ID_task"] ?? task.ID,
                        SIMULATOR: SIMULATOR_MAP[simulatorId],
                        DATE: task["Scheduled on"] ?? task.DATE,
                        TIME: getPmPlanTime(task),
                        TITLE: task["Task"] || "PM Task",
                        ASSIGNED_TO: isDone
                            ? task["Task Performed By"] || task["Tech id"] || ""
                            : resolvePmAssignees(task["AssignedTo"]),
                        STATUS: isDone ? "Completato" : "Non completato",
                        IS_PM_PLAN_TASK: true,
                    };
                });

            const allTasksForExport = [
                ...(tasks || []),
                ...normalizedUnavailableTasks,
                ...normalizedPmTasks,
            ];

            const hasActiveFilters = false;

            const normalizedUnavailableLogbooks = (
                unavailableLogbooks || []
            ).map((logbook) => ({
                ...logbook,
                IS_UNAVAILABLE: true,
            }));

            const allLogbooksForExport = [
                ...(logbooks || []),
                ...normalizedUnavailableLogbooks,
            ];

            let itemsToExport;
            let simulatorsToExport;

            if (hasActiveFilters) {
                itemsToExport = [...allTasksForExport, ...allLogbooksForExport];
                simulatorsToExport = [];
            } else {
                const selectedDate = new Date(startDate);
                selectedDate.setHours(0, 0, 0, 0);

                const tasksForDate = allTasksForExport.filter((task) => {
                    const taskDate = new Date(task.DATE);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate.getTime() === selectedDate.getTime();
                });

                const logbooksForDate = allLogbooksForExport.filter(
                    (logbook) => {
                        const logbookDate = new Date(logbook.DATE);
                        logbookDate.setHours(0, 0, 0, 0);
                        return logbookDate.getTime() === selectedDate.getTime();
                    },
                );

                itemsToExport = [...tasksForDate, ...logbooksForDate];

                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(
                    2,
                    "0",
                );
                const day = String(selectedDate.getDate()).padStart(2, "0");
                const formattedDate = `${year}-${month}-${day}`;

                simulatorsToExport = (todaySimulators || []).filter((sim) => {
                    if (!sim.CREATION_DATE) return false;
                    const simDate = new Date(sim.CREATION_DATE);
                    const simYear = simDate.getFullYear();
                    const simMonth = String(simDate.getMonth() + 1).padStart(
                        2,
                        "0",
                    );
                    const simDay = String(simDate.getDate()).padStart(2, "0");
                    const simFormattedDate = `${simYear}-${simMonth}-${simDay}`;
                    return simFormattedDate === formattedDate;
                });
            }

            if (timeFilter) {
                itemsToExport = itemsToExport.filter(
                    (item) => item.TIME === timeFilter,
                );
            }

            if (exportType === "activities" || exportType === "activity") {
                itemsToExport = itemsToExport.filter((item) => !item.ISLOGBOOK);
            }

            const statusPriority = {
                Completato: 1,
                "In corso": 2,
                "Non completato": 3,
            };

            itemsToExport.sort((a, b) => {
                const priorityA = statusPriority[a.STATUS] || 999;
                const priorityB = statusPriority[b.STATUS] || 999;
                return priorityA - priorityB;
            });

            const API_URL = import.meta.env.VITE_API_URL;
            const notesMap = {};

            await Promise.all(
                itemsToExport.map(async (item) => {
                    try {
                        const isUnavailableTask =
                            item?.TYPE === "Unavailable" ||
                            item?.IS_UNAVAILABLE === true;
                        const notesEntityId =
                            !item.ISLOGBOOK && isUnavailableTask
                                ? item?.ORIGINAL_TASK_ID || item.ID
                                : item.ID;

                        const endpoint = item.ISLOGBOOK
                            ? `${API_URL}/notesLogbook/${item.ID}`
                            : `${API_URL}/notes/${notesEntityId}`;
                        const notesKey = item.ISLOGBOOK
                            ? `logbook_${item.ID}`
                            : notesEntityId;
                        const response = await fetch(endpoint);
                        if (response.ok) {
                            const notes = await response.json();
                            notesMap[notesKey] = notes;
                        }
                    } catch (error) {
                        console.error(
                            `Failed to fetch notes for item ${item.ID}:`,
                            error,
                        );
                    }
                }),
            );

            // For reports: include notes from yesterday at 19:30 onwards through any time today.
            // For activity exports: include all notes regardless of date.
            if (exportType !== "activity" && exportType !== "activities") {
                const noteCutoff = new Date();
                noteCutoff.setDate(noteCutoff.getDate() - 1);
                noteCutoff.setHours(19, 30, 0, 0);
                Object.keys(notesMap).forEach((key) => {
                    notesMap[key] = notesMap[key].filter((note) => {
                        if (!note.CREATEDDATE) return true;
                        return new Date(note.CREATEDDATE) >= noteCutoff;
                    });
                });
            }

            // Add PM tech comments to notesMap for PM Plan tasks, then filter
            // out PM tasks that have no comments at all.
            itemsToExport.forEach((item) => {
                if (!item.IS_PM_PLAN_TASK) return;
                const pmComments = (techComments || []).filter(
                    (c) => c.RecordID === item.ID,
                );
                if (pmComments.length > 0) {
                    const normalized = pmComments.map((c) => ({
                        DESCRIPTION: c.TechComment,
                        AUTHOR_OVERRIDE: c.TechName,
                        TYPE: "pm_comment",
                    }));
                    notesMap[item.ID] = [
                        ...(notesMap[item.ID] || []),
                        ...normalized,
                    ];
                }
            });

            const isActivityExport =
                exportType === "activity" || exportType === "activities";
            if (!isActivityExport) {
                itemsToExport = itemsToExport.filter((item) => {
                    if (!item.IS_PM_PLAN_TASK) return true;
                    if (
                        (item.TITLE || "")
                            .trim()
                            .toLowerCase()
                            .startsWith("morning readiness")
                    )
                        return true;
                    const notes = (notesMap[item.ID] || []).filter(
                        (n) => n.TYPE !== "automatico",
                    );
                    return notes.length > 0;
                });
            }

            let pdfTitle;
            if (exportType === "activity" || exportType === "activities") {
                pdfTitle =
                    timeFilter === "Diurno"
                        ? "Day Activities"
                        : "Night Activities";
            } else {
                pdfTitle =
                    timeFilter === "Diurno" ? "Day Report" : "Night Report";
            }

            const isReportExport = !isActivityExport;
            const itemsExported = exportTasksToPDF(
                itemsToExport,
                hasActiveFilters ? null : startDate,
                simulatorsToExport,
                trainingLoads,
                pdfTitle,
                notesMap,
                users,
                isReportExport,
                isReportExport && timeFilter === "Diurno",
            );
            setPopupType("success");
            setPopupMessage(
                `PDF esportato con successo! (${itemsExported} item${
                    itemsExported !== 1 ? "s" : ""
                })`,
            );
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2000);
            setShowExportReportMenu(false);
            setShowExportActivityMenu(false);
        } catch (error) {
            console.error("Errore durante l'esportazione del PDF:", error);
            setPopupType("error");
            setPopupMessage("Errore durante l'esportazione del PDF");
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2000);
            setShowExportReportMenu(false);
            setShowExportActivityMenu(false);
        }
    };

    const handleEmailPDF = async (timeFilter = null) => {
        try {
            const normalizedUnavailableTasks = (unavailableTasks || []).map(
                (task) => ({ ...task, IS_UNAVAILABLE: true }),
            );

            const resolvePmAssignees = (raw) => {
                const ids =
                    typeof raw === "number"
                        ? [raw]
                        : typeof raw === "string"
                          ? raw
                                .split(",")
                                .map((v) => Number(v.trim()))
                                .filter(Number.isInteger)
                          : [];
                return (
                    ids
                        .map((id) => users.find((u) => u.ID === id)?.Username)
                        .filter(Boolean)
                        .join(", ") || ""
                );
            };

            const normalizedPmTasks = (taskSimOne || [])
                .filter((task) => {
                    const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                    return simulatorId && SIMULATOR_MAP[simulatorId];
                })
                .map((task) => {
                    const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                    const taskDone = task["Task done"] ?? task["Task Done"];
                    const isDone =
                        taskDone !== undefined &&
                        taskDone !== null &&
                        Boolean(taskDone);
                    return {
                        ...task,
                        ID: task["ID_task"] ?? task.ID,
                        SIMULATOR: SIMULATOR_MAP[simulatorId],
                        DATE: task["Scheduled on"] ?? task.DATE,
                        TIME: getPmPlanTime(task),
                        TITLE: task["Task"] || "PM Task",
                        ASSIGNED_TO: isDone
                            ? task["Task Performed By"] || task["Tech id"] || ""
                            : resolvePmAssignees(task["AssignedTo"]),
                        STATUS: isDone ? "Completato" : "Non completato",
                        IS_PM_PLAN_TASK: true,
                    };
                });

            const allTasksForExport = [
                ...(tasks || []),
                ...normalizedUnavailableTasks,
                ...normalizedPmTasks,
            ];
            const normalizedUnavailableLogbooks = (
                unavailableLogbooks || []
            ).map((logbook) => ({
                ...logbook,
                IS_UNAVAILABLE: true,
            }));
            const allLogbooksForExport = [
                ...(logbooks || []),
                ...normalizedUnavailableLogbooks,
            ];

            const selectedDate = new Date(startDate);
            selectedDate.setHours(0, 0, 0, 0);

            const tasksForDate = allTasksForExport.filter((task) => {
                const taskDate = new Date(task.DATE);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === selectedDate.getTime();
            });

            const logbooksForDate = allLogbooksForExport.filter((logbook) => {
                const logbookDate = new Date(logbook.DATE);
                logbookDate.setHours(0, 0, 0, 0);
                return logbookDate.getTime() === selectedDate.getTime();
            });

            let itemsToExport = [...tasksForDate, ...logbooksForDate];

            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const day = String(selectedDate.getDate()).padStart(2, "0");
            const formattedDate = `${year}-${month}-${day}`;

            const simulatorsToExport = (todaySimulators || []).filter((sim) => {
                if (!sim.CREATION_DATE) return false;
                const simDate = new Date(sim.CREATION_DATE);
                const simFormattedDate = `${simDate.getFullYear()}-${String(simDate.getMonth() + 1).padStart(2, "0")}-${String(simDate.getDate()).padStart(2, "0")}`;
                return simFormattedDate === formattedDate;
            });

            if (timeFilter) {
                itemsToExport = itemsToExport.filter(
                    (item) => item.TIME === timeFilter,
                );
            }

            const statusPriority = {
                Completato: 1,
                "In corso": 2,
                "Non completato": 3,
            };
            itemsToExport.sort(
                (a, b) =>
                    (statusPriority[a.STATUS] || 999) -
                    (statusPriority[b.STATUS] || 999),
            );

            const API_URL = import.meta.env.VITE_API_URL;
            const notesMap = {};

            await Promise.all(
                itemsToExport.map(async (item) => {
                    try {
                        const isUnavailableTask =
                            item?.TYPE === "Unavailable" ||
                            item?.IS_UNAVAILABLE === true;
                        const notesEntityId =
                            !item.ISLOGBOOK && isUnavailableTask
                                ? item?.ORIGINAL_TASK_ID || item.ID
                                : item.ID;
                        const endpoint = item.ISLOGBOOK
                            ? `${API_URL}/notesLogbook/${item.ID}`
                            : `${API_URL}/notes/${notesEntityId}`;
                        const notesKey = item.ISLOGBOOK
                            ? `logbook_${item.ID}`
                            : notesEntityId;
                        const response = await fetch(endpoint);
                        if (response.ok)
                            notesMap[notesKey] = await response.json();
                    } catch (error) {
                        console.error(
                            `Failed to fetch notes for item ${item.ID}:`,
                            error,
                        );
                    }
                }),
            );

            const noteCutoff = new Date();
            noteCutoff.setDate(noteCutoff.getDate() - 1);
            noteCutoff.setHours(19, 30, 0, 0);
            Object.keys(notesMap).forEach((key) => {
                notesMap[key] = notesMap[key].filter((note) => {
                    if (!note.CREATEDDATE) return true;
                    return new Date(note.CREATEDDATE) >= noteCutoff;
                });
            });

            itemsToExport.forEach((item) => {
                if (!item.IS_PM_PLAN_TASK) return;
                const pmComments = (techComments || []).filter(
                    (c) => c.RecordID === item.ID,
                );
                if (pmComments.length > 0) {
                    const normalized = pmComments.map((c) => ({
                        DESCRIPTION: c.TechComment,
                        AUTHOR_OVERRIDE: c.TechName,
                        TYPE: "pm_comment",
                    }));
                    notesMap[item.ID] = [
                        ...(notesMap[item.ID] || []),
                        ...normalized,
                    ];
                }
            });

            itemsToExport = itemsToExport.filter((item) => {
                if (!item.IS_PM_PLAN_TASK) return true;
                if (
                    (item.TITLE || "")
                        .trim()
                        .toLowerCase()
                        .startsWith("morning readiness")
                )
                    return true;
                const notes = (notesMap[item.ID] || []).filter(
                    (n) => n.TYPE !== "automatico",
                );
                return notes.length > 0;
            });

            const undefinedItems = itemsToExport.filter(
                (item) => item.STATUS === "Da definire",
            );
            if (undefinedItems.length > 0) {
                setPopupType("error");
                setPopupMessage(
                    `Impossibile inviare: ci sono ${undefinedItems.length} attività con stato "Da definire"`,
                );
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 4000);
                setShowEmailMenu(false);
                return;
            }

            const pdfTitle =
                timeFilter === "Diurno" ? "Day Report" : "Night Report";

            const result = exportTasksToPDF(
                itemsToExport,
                startDate,
                simulatorsToExport,
                trainingLoads,
                pdfTitle,
                notesMap,
                users,
                true,
                timeFilter === "Diurno",
                true,
            );

            if (!result || !result.blob) {
                throw new Error("PDF generation failed");
            }

            const arrayBuffer = await result.blob.arrayBuffer();
            const pdfBase64 = btoa(
                String.fromCharCode(...new Uint8Array(arrayBuffer)),
            );

            const emailResponse = await fetch(`${API_URL}/email/send-pdf`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pdfBase64,
                    fileName: result.fileName,
                    subject: `${timeFilter === "Diurno" ? "Day" : "Night"} ${day}/${month}/${year}`,
                    message: `Hi All,\nAttached the details about the activities performed ${timeFilter === "Diurno" ? "today" : "tonight"}.\n\nRegards,\nTech Team.`,
                    site: "RS",
                }),
            });

            if (!emailResponse.ok)
                throw new Error(
                    `Email server responded with ${emailResponse.status}`,
                );

            setPopupType("success");
            setPopupMessage("Email inviata con successo");
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
            setShowEmailMenu(false);
        } catch (error) {
            console.error("Errore durante l'invio dell'email:", error);
            setPopupType("error");
            setPopupMessage("Errore durante l'invio dell'email");
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
            setShowEmailMenu(false);
        }
    };

    const datesList = useMemo(() => {
        return Array.from({ length: viewDays }).map((_, index) => {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + index);
            return currentDate;
        });
    }, [startDate, viewDays]);

    useEffect(() => {
        fetchUnfinishedPmTasks();
    }, [fetchUnfinishedPmTasks]);

    const pmPlanTasks = useMemo(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        const todayDateStr = `${y}-${m}-${d}`;

        return (taskSimOne || [])
            .filter((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                if (!simulatorId || !SIMULATOR_MAP[simulatorId]) return false;
                // Exclude past unfinished tasks — they are handled by normalizedUnfinishedPmTasks
                const isDone = task["Task Done"] === true;
                const scheduledOn = task["Scheduled on"] ?? task.DATE;
                const scheduledDateStr = scheduledOn
                    ? String(scheduledOn).split("T")[0]
                    : null;
                const isOverdue =
                    !isDone &&
                    scheduledDateStr &&
                    scheduledDateStr < todayDateStr;
                return !isOverdue;
            })
            .map((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                const isDone = task["Task Done"] === true;
                const scheduledOn = task["Scheduled on"] ?? task.DATE;
                const performedOn = task["Performed on"]
                    ? String(task["Performed on"]).split("T")[0] +
                      "T00:00:00.000Z"
                    : null;
                const resolveAssignees = (raw) => {
                    const ids =
                        typeof raw === "number"
                            ? [raw]
                            : typeof raw === "string"
                              ? raw
                                    .split(",")
                                    .map((v) => Number(v.trim()))
                                    .filter(Number.isInteger)
                              : [];
                    const names = ids
                        .map((id) => users.find((u) => u.ID === id)?.Username)
                        .filter(Boolean)
                        .join(", ");
                    return names || null;
                };
                const displayAssignee = isDone
                    ? (task["Task Performed By"] ?? null)
                    : resolveAssignees(task["AssignedTo"]);
                return {
                    ...task,
                    ID: task["ID_task"] ?? task.ID,
                    TITLE: task["Task"] ?? task.TITLE,
                    DATE: isDone ? (performedOn ?? scheduledOn) : scheduledOn,
                    STATUS: isDone ? "Completato" : "Non completato",
                    ASSIGNED_TO: displayAssignee,
                    DESCRIPTION:
                        task["Reference Doc"] ??
                        task["Maintenance Manual Reference"] ??
                        task.DESCRIPTION,
                    TYPE: "PM Plan",
                    IS_PM_PLAN_TASK: true,
                    SIMULATOR: SIMULATOR_MAP[simulatorId],
                    TIME: getPmPlanTime(task),
                    Data: scheduledOn ?? task.Data,
                };
            });
    }, [taskSimOne, users]);

    const normalizedUnfinishedPmTasks = useMemo(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        const todayIso = `${y}-${m}-${d}T00:00:00.000Z`;

        return (unfinishedPmTasks || [])
            .filter((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                return simulatorId && SIMULATOR_MAP[simulatorId];
            })
            .map((task) => {
                const simulatorId = task["ID_sim"] ?? task.SIMULATOR;
                const resolveAssignees = (raw) => {
                    const ids =
                        typeof raw === "number"
                            ? [raw]
                            : typeof raw === "string"
                              ? raw
                                    .split(",")
                                    .map((v) => Number(v.trim()))
                                    .filter(Number.isInteger)
                              : [];
                    const names = ids
                        .map((id) => users.find((u) => u.ID === id)?.Username)
                        .filter(Boolean)
                        .join(", ");
                    return names || null;
                };
                return {
                    ...task,
                    ID: task["ID_task"] ?? task.ID,
                    TITLE: task["Task"] ?? task.TITLE,
                    DATE: todayIso,
                    STATUS: "Non completato",
                    ASSIGNED_TO: resolveAssignees(task["AssignedTo"]),
                    DESCRIPTION:
                        task["Reference Doc"] ??
                        task["Maintenance Manual Reference"] ??
                        task.DESCRIPTION,
                    TYPE: "PM Plan",
                    IS_PM_PLAN_TASK: true,
                    SIMULATOR: SIMULATOR_MAP[simulatorId],
                    TIME: getPmPlanTime(task),
                    Data: todayIso,
                };
            });
    }, [unfinishedPmTasks, users]);

    const mergedTasks = useMemo(() => {
        const normalizedUnavailableTasks = (unavailableTasks || []).map(
            (task) => ({ ...task, IS_UNAVAILABLE: true }),
        );
        return [
            ...(tasks || []),
            ...normalizedUnavailableTasks,
            ...pmPlanTasks,
            ...normalizedUnfinishedPmTasks,
        ];
    }, [tasks, unavailableTasks, pmPlanTasks, normalizedUnfinishedPmTasks]);

    const morningReadinessAssignee = useMemo(() => {
        const task = mergedTasks.find(
            (t) =>
                t.IS_PM_PLAN_TASK === true &&
                t.TITLE?.toLowerCase() === "morning readiness" &&
                t.ASSIGNED_TO,
        );
        return task?.ASSIGNED_TO ?? null;
    }, [mergedTasks]);

    const mergedLogbooks = useMemo(() => {
        const normalizedUnavailableLogbooks = (unavailableLogbooks || []).map(
            (logbook) => ({ ...logbook, IS_UNAVAILABLE: true }),
        );
        return [...(logbooks || []), ...normalizedUnavailableLogbooks];
    }, [logbooks, unavailableLogbooks]);

    const getSelectedDateString = (currentDate) => {
        return (
            currentDate
                .toLocaleDateString("it-IT", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                })
                .charAt(0)
                .toUpperCase() +
            currentDate
                .toLocaleDateString("it-IT", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                })
                .slice(1)
        );
    };

    // Reusable export dropdown component
    const ExportDropdown = ({
        label,
        menuRef,
        isOpen,
        setIsOpen,
        onDiurno,
        onNotturno,
    }) => (
        <div className="relative w-full sm:w-auto" ref={menuRef}>
            <button
                className="btn secondary w-full sm:w-auto justify-center flex items-center gap-1"
                onClick={() => setIsOpen(!isOpen)}
            >
                {label}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[var(--pure-white)] border border-[var(--light-primary)] rounded-lg shadow-lg z-50 text-[var(--black)]">
                    <button
                        className="w-full text-left px-4 py-3 hover:bg-[var(--bento-bg)] transition-colors duration-200 rounded-t-lg border-b border-[var(--light-primary)]"
                        onClick={onDiurno}
                    >
                        Giorno
                    </button>
                    <button
                        className="w-full text-left px-4 py-3 hover:bg-[var(--bento-bg)] transition-colors duration-200 rounded-b-lg"
                        onClick={onNotturno}
                    >
                        Notte
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <section className="flex h-screen">
            <Sidebar
                active="logbook"
                isSidebarOpen={isSidebarOpen}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarStatus={setSidebarStatus}
                    setMobileSidebarOpen={setMobileSidebarOpen}
                />

                <div className="flex-1 overflow-y-auto">
                    {showCalendar ? (
                        <>
                            <div className="hidden md:block">
                                <Calendar
                                    startDate={startDate}
                                    setStartDate={setStartDate}
                                    onDayClick={handleDayClick}
                                    type="logbooks"
                                />
                            </div>

                            <div className="md:hidden">
                                <MobileCalendar
                                    startDate={startDate}
                                    setStartDate={setStartDate}
                                    onDayClick={handleDayClick}
                                    type="logbooks"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* ── Top navigation bar ── */}
                            <div className="mx-3 mt-4 mb-2 md:m-8 md:mb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {/* Left: back + date picker */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <button
                                        className="btn flex gap-2 items-center w-full sm:w-auto justify-center"
                                        onClick={handleBackToCalendar}
                                    >
                                        <BackIcon className="w-5 md:w-6" />
                                        <p className="text-sm md:text-base">
                                            Torna al Calendario
                                        </p>
                                    </button>

                                    <div className="flex justify-center items-center w-full sm:w-auto">
                                        <DatePickerComponent
                                            startDate={startDate}
                                            setStartDate={setStartDate}
                                            isCalendar={false}
                                        />
                                    </div>
                                </div>

                                {/* Right: export buttons */}
                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                    <ExportDropdown
                                        label="Export Report"
                                        menuRef={exportReportMenuRef}
                                        isOpen={showExportReportMenu}
                                        setIsOpen={setShowExportReportMenu}
                                        onDiurno={() =>
                                            handleExportPDF("Diurno", "report")
                                        }
                                        onNotturno={() =>
                                            handleExportPDF(
                                                "Notturno",
                                                "report",
                                            )
                                        }
                                    />
                                    <ExportDropdown
                                        label="Export Activity"
                                        menuRef={exportActivityMenuRef}
                                        isOpen={showExportActivityMenu}
                                        setIsOpen={setShowExportActivityMenu}
                                        onDiurno={() =>
                                            handleExportPDF(
                                                "Diurno",
                                                "activities",
                                            )
                                        }
                                        onNotturno={() =>
                                            handleExportPDF(
                                                "Notturno",
                                                "activities",
                                            )
                                        }
                                    />
                                    <ExportDropdown
                                        label="Manda email"
                                        menuRef={emailMenuRef}
                                        isOpen={showEmailMenu}
                                        setIsOpen={setShowEmailMenu}
                                        onDiurno={() =>
                                            handleEmailPDF("Diurno")
                                        }
                                        onNotturno={() =>
                                            handleEmailPDF("Notturno")
                                        }
                                    />
                                </div>
                            </div>

                            {/* ── Main content card ── */}
                            <div className="mx-3 my-3 md:m-8 gap-8 grid grid-cols-1">
                                <div className="flex flex-col gap-3 md:gap-4 border border-[var(--light-primary)] rounded-lg p-3 md:p-4 bg-[var(--bento-bg)]">
                                    {/* Card title */}
                                    <p className="text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-3 md:pb-4">
                                        Tabella logbook
                                    </p>

                                    {/* Action bar: add button + view toggle */}
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
                                        {/* Left: action buttons */}
                                        <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap">
                                            {currentUserRole !== "View" &&
                                                currentUserRole !== "Guest" && (
                                                    <button
                                                        className="btn tertiary flex gap-2 items-center text-sm w-full md:w-fit justify-center"
                                                        onClick={
                                                            handleTaskClick
                                                        }
                                                    >
                                                        <LogbookIcon className="w-5 shrink-0" />
                                                        <p>Aggiungi entry</p>
                                                    </button>
                                                )}

                                            {GetTodayDate(startDate) ===
                                                GetTodayDate(new Date()) && (
                                                <button
                                                    className="btn secondary flex gap-2 items-center text-sm w-full md:w-fit justify-center"
                                                    onClick={
                                                        handleSimulatorClick
                                                    }
                                                >
                                                    <SimulatorIcon className="w-6 shrink-0" />
                                                    <p>Imposta simulatore</p>
                                                </button>
                                            )}
                                        </div>

                                        {/* Right: view toggle */}
                                        <div className="overflow-x-auto pb-0.5">
                                            <div className="flex items-center justify-start border border-[var(--light-primary)] rounded-md w-full p-1 min-w-max">
                                                {[
                                                    { label: "Oggi", days: 1 },
                                                    {
                                                        label: "1 settimana",
                                                        days: 7,
                                                    },
                                                    {
                                                        label: "2 settimane",
                                                        days: 14,
                                                    },
                                                ].map(({ label, days }) => (
                                                    <div
                                                        key={days}
                                                        className={`flex items-center gap-2 p-2 px-3 md:px-4 rounded-md cursor-pointer whitespace-nowrap flex-1 justify-center ${
                                                            viewDays === days
                                                                ? "bg-[var(--light-primary)] text-[var(--primary)]"
                                                                : "text-[var(--black)] hover:bg-[var(--light-primary)]"
                                                        } transition-all duration-200`}
                                                        onClick={() =>
                                                            setViewDays(days)
                                                        }
                                                    >
                                                        <p className="text-sm">
                                                            {label}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date sections */}
                                    {datesList.map((currentDate, index) => (
                                        <div key={currentDate.toISOString()}>
                                            {viewDays > 1 && (
                                                <h1 className="text-base md:text-xl font-semibold text-[var(--black)] mb-1 mt-4">
                                                    {getSelectedDateString(
                                                        currentDate,
                                                    )}
                                                </h1>
                                            )}
                                            <div
                                                className={
                                                    viewDays > 1
                                                        ? "p-3 md:p-4 bg-[var(--pure-white)] rounded-xl"
                                                        : ""
                                                }
                                            >
                                                <Table
                                                    type="tasks&logbook"
                                                    loading={
                                                        loading ||
                                                        unavailableLoading ||
                                                        unavailableLogbooksLoading
                                                    }
                                                    taskList={mergedTasks}
                                                    logbookList={mergedLogbooks}
                                                    date={currentDate}
                                                    onDeleteSuccess={
                                                        handleSuccess
                                                    }
                                                />
                                            </div>

                                            {viewDays > 1 &&
                                                index < viewDays - 1 && (
                                                    <div className="my-4" />
                                                )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <CreateModal
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                    type="logbook"
                    initialDate={startDate.toISOString().split("T")[0]}
                />
            )}
            {isSimulatorModalOpen && (
                <SimulatorModal
                    onClose={handleCloseSimulatorModal}
                    morningReadinessAssignee={morningReadinessAssignee}
                />
            )}

            {showPopup && <Popup type={popupType} message={popupMessage} />}
        </section>
    );
}

export default Logbook;
