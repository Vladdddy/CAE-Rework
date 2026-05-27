import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";

const API_URL = import.meta.env.VITE_API_URL;
import { useUsers } from "./provider/userAPI/useUsers.js";
import DragIcon from "../../assets/icons/drag.tsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import { GetColorForShift } from "../../functions/GetColorPerShift.jsx";
import { useEmployeeShifts } from "./provider/employeeShiftsAPI_variant/useEmployeeShifts.js";
import { useShiftOrder } from "./provider/shiftOrderAPI/useShiftOrder.js";
import Popup from "../modals/Popup.jsx";
import Colors from "../../assets/icons/color.tsx";

function ShiftsTable({
    selectedMonth,
    numMonths = 1,
    onChangesDetected,
    currentUserRole,
    onVisibleMonthChange,
}) {
    const { users, loading } = useUsers();
    const {
        shiftOrders,
        saveShiftOrders,
        loading: shiftOrdersLoading,
    } = useShiftOrder();
    const [orderedUsers, setOrderedUsers] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [showNotes, setShowNotes] = useState({});
    const [shiftValues, setShiftValues] = useState(() => {
        const saved = localStorage.getItem("shiftValues");
        return saved ? JSON.parse(saved) : {};
    });
    const { employeeShifts } = useEmployeeShifts();
    const scrollContainerRef = useRef(null);
    const todayColumnRef = useRef(null);
    const lastReportedMonthRef = useRef(null);
    const [popup, setPopup] = useState({ show: false, type: "", message: "" });
    // Track if we're on mobile — initialize synchronously to avoid layout flash
    const [selectedUserIndex, setSelectedUserIndex] = useState(null);
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== "undefined" && window.innerWidth < 768,
    );

    const [highlights, setHighlights] = useState(() => {
        const saved = localStorage.getItem("shiftHighlights");
        return saved ? JSON.parse(saved) : {};
    });

    const [cellColorChoices, setCellColorChoices] = useState(() => {
        const saved = localStorage.getItem("shiftColorChoices");
        return saved ? JSON.parse(saved) : {};
    });
    const [openColorPicker, setOpenColorPicker] = useState(null);

    // Track POST and PUT changes
    const [postChanges, setPostChanges] = useState(() => {
        const saved = localStorage.getItem("shiftPostChanges");
        return saved ? JSON.parse(saved) : {};
    });
    const [putChanges, setPutChanges] = useState(() => {
        const saved = localStorage.getItem("shiftPutChanges");
        return saved ? JSON.parse(saved) : {};
    });

    const shiftMeanings = [
        "O",
        "OP",
        "ON",
        "D",
        "N",
        "F",
        "M",
        "R",
        "C",
        "CA",
        "T",
        "P",
        "CG",
        "FND",
    ];

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Apply shift order from database
    useEffect(() => {
        if (shiftOrdersLoading) return;

        // Debug: log every unique Role value returned by the API
        const uniqueRoles = [...new Set(users.map((u) => u.Role))];
        console.log("[ShiftsTable] roles from API:", uniqueRoles);

        // "employee" is the legacy role name from dbo.Employee (maps to "tech staff" in new DB)
        const VISIBLE_ROLES = ["tech staff", "shift leader", "crew chief", "employee"];
        const visibleUsers = users.filter((u) =>
            VISIBLE_ROLES.includes((u.Role || "").trim().toLowerCase()),
        );
        if (visibleUsers.length === 0) {
            setOrderedUsers([]);
            return;
        }
        if (shiftOrders.length === 0) {
            setOrderedUsers(visibleUsers);
            return;
        }

        const positionMap = {};
        shiftOrders.forEach((order) => {
            positionMap[order.POSITIONED_USER_ID] = order.POSITION;
        });

        const sorted = [...visibleUsers].sort((a, b) => {
            const posA = positionMap[a.ID] || 9999;
            const posB = positionMap[b.ID] || 9999;
            return posA - posB;
        });

        setOrderedUsers(sorted);
    }, [users, shiftOrders, shiftOrdersLoading]);

    // Save changes to localStorage and notify parent
    useEffect(() => {
        localStorage.setItem("shiftPostChanges", JSON.stringify(postChanges));
        localStorage.setItem("shiftPutChanges", JSON.stringify(putChanges));
        localStorage.setItem("shiftValues", JSON.stringify(shiftValues));

        const hasChanges =
            Object.keys(postChanges).length > 0 ||
            Object.keys(putChanges).length > 0;
        if (onChangesDetected) {
            onChangesDetected(hasChanges, postChanges, putChanges);
        }
    }, [postChanges, putChanges, shiftValues, onChangesDetected]);

    useEffect(() => {
        localStorage.setItem(
            "shiftColorChoices",
            JSON.stringify(cellColorChoices),
        );
    }, [cellColorChoices]);

    useEffect(() => {
        const close = () => setOpenColorPicker(null);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, []);

    const highlightsRef = useRef({});
    const cellColorChoicesRef = useRef({});
    const postChangesRef = useRef({});
    const putChangesRef = useRef({});
    useEffect(() => {
        highlightsRef.current = highlights;
    }, [highlights]);
    useEffect(() => {
        cellColorChoicesRef.current = cellColorChoices;
    }, [cellColorChoices]);
    useEffect(() => {
        postChangesRef.current = postChanges;
    }, [postChanges]);
    useEffect(() => {
        putChangesRef.current = putChanges;
    }, [putChanges]);

    // On mount: fetch saved highlights from DB and merge with localStorage pending ones
    useEffect(() => {
        fetch(`${API_URL}/shiftCellHighlight`)
            .then((r) => r.json())
            .then((data) => {
                if (!Array.isArray(data)) return;
                const dbMap = {};
                data.forEach((h) => {
                    const dateStr = String(h.SELECTED_DATE).split("T")[0];
                    dbMap[`${h.EMPLOYEE_ID}-${dateStr}`] = h.CHANGE_TYPE;
                });
                // DB is the base; localStorage pending highlights take precedence
                setHighlights((prev) => ({ ...dbMap, ...prev }));
            })
            .catch((err) =>
                console.error("ShiftCellHighlight fetch error:", err),
            );
    }, []);

    // Expose clear function via ref or prop callback
    useEffect(() => {
        window.clearShiftChanges = () => {
            setPostChanges({});
            setPutChanges({});
            setShiftValues({});
            setCellColorChoices({});
            localStorage.removeItem("shiftPostChanges");
            localStorage.removeItem("shiftPutChanges");
            localStorage.removeItem("shiftValues");
            localStorage.removeItem("shiftHighlights");
            localStorage.removeItem("shiftColorChoices");
        };

        window.applyPatternChanges = (newPostChanges, newPutChanges) => {
            const postChangesWithSource = Object.fromEntries(
                Object.entries(newPostChanges).map(([key, value]) => [
                    key,
                    { ...value, CHANGE_SOURCE: "pattern" },
                ]),
            );
            const putChangesWithSource = Object.fromEntries(
                Object.entries(newPutChanges).map(([key, value]) => [
                    key,
                    { ...value, CHANGE_SOURCE: "pattern" },
                ]),
            );

            setPostChanges((prev) => ({ ...prev, ...postChangesWithSource }));
            setPutChanges((prev) => ({ ...prev, ...putChangesWithSource }));

            setShiftValues((prev) => {
                const updated = { ...prev };
                Object.entries(postChangesWithSource).forEach(
                    ([key, value]) => {
                        updated[key] = value.SHIFT_TYPE;
                    },
                );
                Object.entries(putChangesWithSource).forEach(([key, value]) => {
                    updated[key] = value.SHIFT_TYPE;
                });
                return updated;
            });
        };

        window.commitShiftHighlights = () => {
            const current = highlightsRef.current;
            const colors = cellColorChoicesRef.current;
            const posts = postChangesRef.current;
            const puts = putChangesRef.current;

            const toPost = [];
            const toDelete = [];

            Object.entries(current).forEach(([key, changeType]) => {
                const isManual =
                    posts[key]?.CHANGE_SOURCE === "manual" ||
                    puts[key]?.CHANGE_SOURCE === "manual";
                const dashIdx = key.indexOf("-");
                const employeeId = parseInt(key.slice(0, dashIdx));
                const date = key.slice(dashIdx + 1);

                if (isManual) {
                    if (colors[key] != null) {
                        toPost.push({
                            employeeId,
                            date,
                            changeType: colors[key],
                        });
                    } else {
                        toDelete.push({ employeeId, date });
                    }
                } else {
                    toPost.push({ employeeId, date, changeType });
                }
            });

            const promises = [];

            if (toPost.length > 0) {
                promises.push(
                    fetch(`${API_URL}/shiftCellHighlight`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ items: toPost }),
                    })
                        .then((r) => {
                            if (!r.ok)
                                r.json().then((e) =>
                                    console.error(
                                        "Highlight commit failed:",
                                        e,
                                    ),
                                );
                        })
                        .catch((err) =>
                            console.error("Highlight commit error:", err),
                        ),
                );
            }

            if (toDelete.length > 0) {
                promises.push(
                    fetch(`${API_URL}/shiftCellHighlight`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ items: toDelete }),
                    })
                        .then((r) => {
                            if (!r.ok)
                                r.json().then((e) =>
                                    console.error(
                                        "Highlight delete failed:",
                                        e,
                                    ),
                                );
                        })
                        .catch((err) =>
                            console.error("Highlight delete error:", err),
                        ),
                );
            }

            if (promises.length === 0) return Promise.resolve();
            return Promise.all(promises);
        };

        window.cancelShiftChanges = () => {
            setPostChanges({});
            setPutChanges({});
            setShiftValues({});
            setCellColorChoices({});
            localStorage.removeItem("shiftPostChanges");
            localStorage.removeItem("shiftPutChanges");
            localStorage.removeItem("shiftValues");
            localStorage.removeItem("shiftHighlights");
            localStorage.removeItem("shiftColorChoices");
            fetch(`${API_URL}/shiftCellHighlight`)
                .then((r) => r.json())
                .then((data) => {
                    if (!Array.isArray(data)) return;
                    const map = {};
                    data.forEach((h) => {
                        const dateStr = String(h.SELECTED_DATE).split("T")[0];
                        map[`${h.EMPLOYEE_ID}-${dateStr}`] = h.CHANGE_TYPE;
                    });
                    setHighlights(map);
                })
                .catch(() => {});
        };

        return () => {
            delete window.clearShiftChanges;
            delete window.applyPatternChanges;
            delete window.commitShiftHighlights;
            delete window.cancelShiftChanges;
        };
    }, []);

    const MONTH_NAMES = {
        gennaio: 0,
        febbraio: 1,
        marzo: 2,
        aprile: 3,
        maggio: 4,
        giugno: 5,
        luglio: 6,
        agosto: 7,
        settembre: 8,
        ottobre: 9,
        novembre: 10,
        dicembre: 11,
    };

    const dayOfWeekLabels = [
        "Domenica",
        "Lunedì",
        "Martedì",
        "Mercoledì",
        "Giovedì",
        "Venerdì",
        "Sabato",
    ];
    const dayOfWeekShort = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

    // Flat array of Date objects covering all months in the view
    const allDays = useMemo(() => {
        const [monthName, year] = selectedMonth.split(" ");
        const startDate = new Date(
            parseInt(year),
            MONTH_NAMES[monthName.toLowerCase()],
            1,
        );
        const result = [];
        for (let m = 0; m < numMonths; m++) {
            const md = new Date(
                startDate.getFullYear(),
                startDate.getMonth() + m,
                1,
            );
            const count = new Date(
                md.getFullYear(),
                md.getMonth() + 1,
                0,
            ).getDate();
            for (let d = 1; d <= count; d++) {
                result.push(new Date(md.getFullYear(), md.getMonth(), d));
            }
        }
        return result;
    }, [selectedMonth, numMonths]);

    // Keep `date` as the first day of the selected month (used by auto-scroll dep)
    const date = allDays[0] ?? new Date();

    const formatDateStr = (d) => {
        const y = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${mo}-${day}`;
    };

    const calculateEaster = (year) => {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return { month, day };
    };

    const isHoliday = (dayDate) => {
        const month = dayDate.getMonth() + 1;
        const dayOfMonth = dayDate.getDate();
        const year = dayDate.getFullYear();
        const easter = calculateEaster(year);
        const easterDate = new Date(year, easter.month - 1, easter.day);
        const easterMonday = new Date(easterDate);
        easterMonday.setDate(easterDate.getDate() + 1);

        const holidays = [
            { month: 1, day: 1 },
            { month: 1, day: 6 },
            { month: easter.month, day: easter.day },
            { month: easterMonday.getMonth() + 1, day: easterMonday.getDate() },
            { month: 4, day: 25 },
            { month: 5, day: 1 },
            { month: 6, day: 2 },
            { month: 8, day: 15 },
            { month: 11, day: 1 },
            { month: 12, day: 8 },
            { month: 12, day: 25 },
            { month: 12, day: 26 },
        ];

        return holidays.some(
            (holiday) => holiday.month === month && holiday.day === dayOfMonth,
        );
    };

    const today = new Date();
    const todayIndex = allDays.findIndex(
        (d) =>
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear(),
    );
    const isCurrentMonth = todayIndex !== -1;

    // Auto-scroll to today's date or start of table
    useEffect(() => {
        if (scrollContainerRef.current && !isMobile) {
            const containerElement = scrollContainerRef.current;
            if (isCurrentMonth && todayColumnRef.current) {
                const columnElement = todayColumnRef.current;
                const scrollPosition =
                    columnElement.offsetLeft -
                    containerElement.clientWidth / 2 +
                    columnElement.clientWidth / 2;
                containerElement.scrollTo({
                    left: Math.max(0, scrollPosition),
                    behavior: "smooth",
                });
            } else {
                containerElement.scrollTo({ left: 0, behavior: "smooth" });
            }
        }
    }, [selectedMonth, isCurrentMonth, todayIndex, isMobile]);

    const handleTableScroll = useCallback(() => {
        if (
            !scrollContainerRef.current ||
            !onVisibleMonthChange ||
            numMonths <= 1
        )
            return;
        const colWidth = 128; // 8rem at 16px base font size
        const dayIndex = Math.min(
            Math.floor(scrollContainerRef.current.scrollLeft / colWidth),
            allDays.length - 1,
        );
        const visibleDay = allDays[Math.max(0, dayIndex)];
        const monthKey = `${visibleDay.getFullYear()}-${visibleDay.getMonth()}`;
        if (lastReportedMonthRef.current !== monthKey) {
            lastReportedMonthRef.current = monthKey;
            onVisibleMonthChange(visibleDay);
        }
    }, [allDays, onVisibleMonthChange, numMonths]);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el || numMonths <= 1) return;
        el.addEventListener("scroll", handleTableScroll, { passive: true });
        return () => el.removeEventListener("scroll", handleTableScroll);
    }, [handleTableScroll, numMonths]);

    // Report initial visible month when allDays changes (month picker or numMonths changed)
    useEffect(() => {
        if (!onVisibleMonthChange || numMonths <= 1 || allDays.length === 0)
            return;
        lastReportedMonthRef.current = null;
        const colWidth = 128;
        const scrollLeft = scrollContainerRef.current?.scrollLeft ?? 0;
        const dayIndex = Math.min(
            Math.floor(scrollLeft / colWidth),
            allDays.length - 1,
        );
        const visibleDay = allDays[Math.max(0, dayIndex)];
        const monthKey = `${visibleDay.getFullYear()}-${visibleDay.getMonth()}`;
        lastReportedMonthRef.current = monthKey;
        onVisibleMonthChange(visibleDay);
    }, [allDays, onVisibleMonthChange, numMonths]);

    const formatUsername = (user) => {
        if (!user) return "";
        const first = (user.firstname || "").trim();
        const last = (user.lastname || "").trim();
        if (first || last) {
            return [
                first ? first.charAt(0).toUpperCase() + first.slice(1) : "",
                last ? last.charAt(0).toUpperCase() + last.slice(1) : "",
            ]
                .filter(Boolean)
                .join(" ");
        }
        return user.Username || (user.FullName || "").trim() || "";
    };

    // Drag and drop handlers
    // All visible roles are draggable (tech staff, shift leader, crew chief, legacy employee)
    const isDraggable = (role) => {
        const r = (role || "").trim().toLowerCase();
        return ["tech staff", "employee", "shift leader", "crew chief"].includes(r);
    };

    const handleDragStart = (e, index) => {
        const user = orderedUsers[index];
        if (!isDraggable(user.Role)) {
            e.preventDefault();
            return;
        }
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.currentTarget);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        const targetUser = orderedUsers[index];
        if (!isDraggable(targetUser.Role)) {
            e.dataTransfer.dropEffect = "none";
            return;
        }
        e.dataTransfer.dropEffect = "move";
        if (draggedIndex !== null && draggedIndex !== index)
            setDragOverIndex(index);
    };

    const handleDragLeave = () => setDragOverIndex(null);

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDragOverIndex(null);
            return;
        }

        const newUsers = [...orderedUsers];
        const draggedUser = newUsers[draggedIndex];
        newUsers.splice(draggedIndex, 1);
        newUsers.splice(dropIndex, 0, draggedUser);
        setOrderedUsers(newUsers);
        setDragOverIndex(null);

        const orderedUserIds = newUsers.map((user) => user.ID);
        saveShiftOrders(orderedUserIds)
            .then((result) => {
                if (result.success) {
                    setPopup({
                        show: true,
                        type: "success",
                        message:
                            "Hai spostato con successo la posizione del tecnico",
                    });
                } else {
                    setPopup({
                        show: true,
                        type: "error",
                        message:
                            "Non è stato possibile spostare la posizione del tecnico",
                    });
                }
                setTimeout(
                    () => setPopup({ show: false, type: "", message: "" }),
                    3000,
                );
            })
            .catch(() => {
                setPopup({
                    show: true,
                    type: "error",
                    message:
                        "Non è stato possibile spostare la posizione del tecnico",
                });
                setTimeout(
                    () => setPopup({ show: false, type: "", message: "" }),
                    3000,
                );
            });
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const allShiftOptions = ["--", ...shiftMeanings];

    const handleShiftKeyDown = (userIndex, dayIndex, currentValue, e) => {
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
        e.preventDefault();
        const idx = allShiftOptions.indexOf(currentValue);
        const next =
            e.key === "ArrowDown"
                ? Math.min(idx + 1, allShiftOptions.length - 1)
                : Math.max(idx - 1, 0);
        handleShiftChange(userIndex, dayIndex, allShiftOptions[next]);
    };

    const handleShiftChange = (userIndex, dayIndex, value) => {
        const user = orderedUsers[userIndex];
        const formattedDate = formatDateStr(allDays[dayIndex]);
        const key = `${user.ID}-${formattedDate}`;

        const matchingShift = employeeShifts.find(
            (shift) =>
                shift.EMPLOYEE_ID === user.ID &&
                shift.SELECTED_DATE &&
                shift.SELECTED_DATE.split("T")[0] === formattedDate,
        );

        const currentDbValue = matchingShift ? matchingShift.SHIFT_TYPE : "--";
        const shiftId = matchingShift ? matchingShift.ID : null;

        if (value === currentDbValue) {
            setShiftValues((prev) => {
                const n = { ...prev };
                delete n[key];
                return n;
            });
            setPostChanges((prev) => {
                const n = { ...prev };
                delete n[key];
                return n;
            });
            setPutChanges((prev) => {
                const n = { ...prev };
                delete n[key];
                return n;
            });
            setHighlights((prev) => {
                const n = { ...prev };
                delete n[key];
                localStorage.setItem("shiftHighlights", JSON.stringify(n));
                return n;
            });
            fetch(`${API_URL}/shiftCellHighlight`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [{ employeeId: user.ID, date: formattedDate }],
                }),
            }).catch(() => {});
            return;
        }

        let changeType = "modified";
        if (value === "--") {
            changeType = "removed";
        } else if (currentDbValue === "--") {
            changeType = "added";
        } else if (
            (user.Role || "").trim().toLowerCase() === "tech staff" &&
            ((currentDbValue === "D" && value === "N") ||
                (currentDbValue === "N" && value === "D"))
        ) {
            changeType = "swap";
        }

        setHighlights((prev) => {
            const n = { ...prev, [key]: changeType };
            localStorage.setItem("shiftHighlights", JSON.stringify(n));
            return n;
        });

        if (value === "--" && currentDbValue !== "--") {
            setShiftValues((prev) => ({ ...prev, [key]: null }));
            setPutChanges((prev) => ({
                ...prev,
                [key]: {
                    id: shiftId,
                    EMPLOYEE_ID: user.ID,
                    SELECTED_DATE: formattedDate,
                    SHIFT_TYPE: null,
                    CHANGE_SOURCE: "manual",
                    CHANGE_TYPE: changeType,
                },
            }));
            setPostChanges((prev) => {
                const n = { ...prev };
                delete n[key];
                return n;
            });
        } else if (value === "--") {
            setShiftValues((prev) => {
                const n = { ...prev };
                delete n[key];
                return n;
            });
            setPostChanges((prev) => {
                const n = { ...prev };
                delete n[key];
                return n;
            });
            setPutChanges((prev) => {
                const n = { ...prev };
                delete n[key];
                return n;
            });
        } else if (currentDbValue === "--") {
            setShiftValues((prev) => ({ ...prev, [key]: value }));
            setPostChanges((prev) => ({
                ...prev,
                [key]: {
                    EMPLOYEE_ID: user.ID,
                    SELECTED_DATE: formattedDate,
                    SHIFT_TYPE: value,
                    CHANGE_SOURCE: "manual",
                    CHANGE_TYPE: changeType,
                },
            }));
            setPutChanges((prev) => {
                const n = { ...prev };
                delete n[key];
                return n;
            });
        } else {
            setShiftValues((prev) => ({ ...prev, [key]: value }));
            setPutChanges((prev) => ({
                ...prev,
                [key]: {
                    id: shiftId,
                    EMPLOYEE_ID: user.ID,
                    SELECTED_DATE: formattedDate,
                    SHIFT_TYPE: value,
                    CHANGE_SOURCE: "manual",
                    CHANGE_TYPE: changeType,
                },
            }));
            setPostChanges((prev) => {
                const n = { ...prev };
                delete n[key];
                return n;
            });
        }
    };

    const getShiftValue = (userIndex, dayIndex) => {
        const user = orderedUsers[userIndex];
        if (!user) return "--";

        const formattedDate = formatDateStr(allDays[dayIndex]);
        const key = `${user.ID}-${formattedDate}`;

        if (key in shiftValues) {
            return shiftValues[key] === null ? "--" : shiftValues[key];
        }

        const matchingShift = employeeShifts.find(
            (shift) =>
                shift.EMPLOYEE_ID === user.ID &&
                shift.SELECTED_DATE &&
                shift.SELECTED_DATE.split("T")[0] === formattedDate,
        );

        return matchingShift ? matchingShift.SHIFT_TYPE : "--";
    };

    const countShiftsForDay = (time, dayDate) => {
        const formattedDate = formatDateStr(dayDate);
        const shiftTypes = time === "Diurno" ? ["D"] : ["N"];
        const shiftsMap = {};

        employeeShifts.forEach((shift) => {
            if (!shift.SELECTED_DATE) return;
            if (shift.SELECTED_DATE.split("T")[0] === formattedDate) {
                shiftsMap[shift.EMPLOYEE_ID] = shift.SHIFT_TYPE;
            }
        });

        Object.values(postChanges).forEach((change) => {
            if (change.SELECTED_DATE === formattedDate)
                shiftsMap[change.EMPLOYEE_ID] = change.SHIFT_TYPE;
        });

        Object.values(putChanges).forEach((change) => {
            if (change.SELECTED_DATE === formattedDate) {
                if (change.SHIFT_TYPE === null)
                    delete shiftsMap[change.EMPLOYEE_ID];
                else shiftsMap[change.EMPLOYEE_ID] = change.SHIFT_TYPE;
            }
        });

        const count = Object.values(shiftsMap).filter(
            (shiftType) =>
                shiftType !== "--" &&
                shiftType !== null &&
                shiftTypes.includes(shiftType),
        ).length;

        const prefix = time === "Diurno" ? "D" : "N";
        return `${prefix}-${count}`;
    };

    const getShiftCountColor = (time, dayDate) => {
        const result = countShiftsForDay(time, dayDate);
        const count = parseInt(result.split("-")[1]);
        if (count <= 1) return "text-white bg-[var(--red)]";
        else if (count === 2) return "text-white bg-[var(--orange)]";
        else if (count === 3) return "text-white bg-[var(--green)]";
        else return "text-white bg-[var(--dark-green)]";
    };

    const isCellModified = (userIndex, dayIndex) => {
        const user = orderedUsers[userIndex];
        if (!user) return false;
        const key = `${user.ID}-${formatDateStr(allDays[dayIndex])}`;
        return (
            Object.hasOwn(postChanges, key) || Object.hasOwn(putChanges, key)
        );
    };

    const getCellChangeType = (userIndex, dayIndex) => {
        const user = orderedUsers[userIndex];
        if (!user) return null;
        const key = `${user.ID}-${formatDateStr(allDays[dayIndex])}`;
        return highlights[key] || null;
    };

    const getCellChangeBg = (userIndex, dayIndex) => {
        const user = orderedUsers[userIndex];
        if (!user) return "";
        const key = `${user.ID}-${formatDateStr(allDays[dayIndex])}`;
        const isManual =
            postChanges[key]?.CHANGE_SOURCE === "manual" ||
            putChanges[key]?.CHANGE_SOURCE === "manual";
        if (isManual) {
            const chosen = cellColorChoices[key];
            if (chosen === "violet") return "!bg-violet-400";
            if (chosen === "green") return "!bg-green-500";
            if (chosen === "light-green") return "!bg-green-200";
            return "";
        }
        const type = highlights[key];
        if (type === "swap") return "!bg-green-500";
        if (type === "removed") return "!bg-violet-400";
        if (type === "added") return "!bg-green-200";
        if (type === "modified") return "!bg-[var(--orange-light)]";
        if (type === "violet") return "!bg-violet-400";
        if (type === "green") return "!bg-green-500";
        if (type === "light-green") return "!bg-green-200";
        return "";
    };

    const isUserRowModified = (userIndex) => {
        const user = orderedUsers[userIndex];
        if (!user) return false;
        for (const dayDate of allDays) {
            const key = `${user.ID}-${formatDateStr(dayDate)}`;
            if (
                Object.hasOwn(postChanges, key) ||
                Object.hasOwn(putChanges, key)
            )
                return true;
        }
        return false;
    };

    const COLOR_OPTIONS = [
        {
            id: "violet",
            label: "Turno tolto",
            cellBg: "!bg-violet-400",
            btnBg: "bg-violet-400",
        },
        {
            id: "green",
            label: "Turno aggiunto",
            cellBg: "!bg-green-500",
            btnBg: "bg-green-500",
        },
        {
            id: "light-green",
            label: "Turno cambiato",
            cellBg: "!bg-green-200",
            btnBg: "bg-green-200",
        },
    ];

    const handleColorChoice = (key, colorId) => {
        setCellColorChoices((prev) => ({ ...prev, [key]: colorId }));
        setOpenColorPicker(null);
    };

    const isManualChange = (userIndex, dayIndex) => {
        const user = orderedUsers[userIndex];
        if (!user) return false;
        const key = `${user.ID}-${formatDateStr(allDays[dayIndex])}`;
        return (
            postChanges[key]?.CHANGE_SOURCE === "manual" ||
            putChanges[key]?.CHANGE_SOURCE === "manual"
        );
    };

    const canEdit =
        currentUserRole === "Admin" || currentUserRole === "Shift Leader";

    // ─── MOBILE CARD LAYOUT ──────────────────────────────────────────────────
    if (isMobile) {
        return (
            <div className="flex flex-col gap-3 w-full max-h-[calc(100vh-10rem)] overflow-y-auto pb-4 px-2">
                {/* ── Shift Counter Card (separate table at the top) ── */}
                <div className="border border-[var(--separator)] rounded-xl bg-[var(--bento-bg)] shadow-sm">
                    <div className="px-4 py-3 border-b border-[var(--separator)] bg-[var(--light-primary)] rounded-t-xl">
                        <p className="text-sm font-semibold text-[var(--black)]">
                            Conteggio turni
                        </p>
                    </div>
                    <div
                        className="overflow-x-auto w-full"
                        style={{ minHeight: "5rem" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                width: "max-content",
                            }}
                        >
                            {allDays.map((dayDate, index) => {
                                const dow = dayOfWeekLabels[dayDate.getDay()];
                                const isWeekend =
                                    dow === "Sabato" || dow === "Domenica";
                                const isHolidayDay = isHoliday(dayDate);
                                const isToday = index === todayIndex;
                                const isMonthStart =
                                    dayDate.getDate() === 1 && index > 0;

                                let cellBg = "bg-[var(--light-primary)]";
                                if (isToday)
                                    cellBg = "bg-[var(--weekend-cells)]";
                                else if (isHolidayDay)
                                    cellBg = "bg-[var(--holiday-cells)]";

                                return (
                                    <div
                                        key={`counter-day-${index}`}
                                        className={`flex flex-col items-center border-r border-[var(--separator)] ${cellBg} ${isMonthStart ? "border-l-2 border-l-[var(--primary)]" : ""}`}
                                        style={{
                                            minWidth: "4.5rem",
                                            width: "4.5rem",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {/* Day label */}
                                        <div
                                            className={`w-full text-center py-1 border-b border-[var(--separator)] ${isToday ? "text-[var(--weekend-text)]" : isHolidayDay ? "text-[var(--holiday-text)]" : "text-[var(--gray)]"}`}
                                        >
                                            {isMonthStart && (
                                                <p className="text-[9px] font-bold leading-tight uppercase text-[var(--primary)]">
                                                    {dayDate.toLocaleString(
                                                        "it-IT",
                                                        { month: "short" },
                                                    )}
                                                </p>
                                            )}
                                            <p className="text-[10px] font-medium leading-tight">
                                                {
                                                    dayOfWeekShort[
                                                        dayDate.getDay()
                                                    ]
                                                }
                                            </p>
                                            <p className="text-sm font-bold leading-tight">
                                                {dayDate.getDate()}
                                            </p>
                                        </div>
                                        {/* Badges */}
                                        <div className="flex flex-col items-center gap-1 py-2">
                                            <span
                                                className={`${getShiftCountColor("Diurno", dayDate)} text-xs font-bold px-2 py-0.5 rounded leading-none`}
                                            >
                                                {countShiftsForDay(
                                                    "Diurno",
                                                    dayDate,
                                                )}
                                            </span>
                                            <span
                                                className={`${getShiftCountColor("Notturno", dayDate)} text-xs font-bold px-2 py-0.5 rounded leading-none`}
                                            >
                                                {countShiftsForDay(
                                                    "Notturno",
                                                    dayDate,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Employee Cards ── */}
                {loading || shiftOrdersLoading ? (
                    <div className="p-8 text-center text-[var(--black)] text-sm">
                        Caricamento...
                    </div>
                ) : orderedUsers.length === 0 ? (
                    <div className="p-8 text-center text-[var(--gray)] text-sm">
                        Nessun utente trovato.
                    </div>
                ) : (
                    orderedUsers.map((user, userIndex) => {
                        const isEmployee = isDraggable(user.Role);
                        const isModified = isUserRowModified(userIndex);

                        return (
                            <div
                                key={`mobile-user-${userIndex}`}
                                className={`border rounded-xl bg-[var(--bento-bg)] shadow-sm ${isModified ? "border-[var(--orange)] border-2" : "border-[var(--separator)]"}`}
                            >
                                {/* Card header: employee name */}
                                <div
                                    className={`flex items-center gap-2 px-4 py-3 border-b border-[var(--separator)] rounded-t-xl ${isModified ? "bg-[var(--orange-light)]" : "bg-[var(--light-primary)]"}`}
                                >
                                    {isEmployee && canEdit && (
                                        <DragIcon className="w-5 text-[var(--gray)] flex-shrink-0" />
                                    )}
                                    <p className="text-sm font-semibold text-[var(--black)] flex-1 select-none">
                                        {formatUsername(user)}
                                    </p>
                                    {isModified && (
                                        <span className="text-xs bg-[var(--orange)] text-white px-2 py-0.5 rounded-full font-medium">
                                            Modificato
                                        </span>
                                    )}
                                </div>

                                {/* Horizontally scrollable day strip — no per-cell counters, bigger text */}
                                <div
                                    className="overflow-x-auto w-full"
                                    style={{ minHeight: "6rem" }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            width: "max-content",
                                        }}
                                    >
                                        {allDays.map((dayDate, index) => {
                                            const dow =
                                                dayOfWeekLabels[
                                                    dayDate.getDay()
                                                ];
                                            const isWeekend =
                                                dow === "Sabato" ||
                                                dow === "Domenica";
                                            const isHolidayDay =
                                                isHoliday(dayDate);
                                            const isToday =
                                                index === todayIndex;
                                            const changeType =
                                                getCellChangeType(
                                                    userIndex,
                                                    index,
                                                );
                                            const isMonthStart =
                                                dayDate.getDate() === 1 &&
                                                index > 0;

                                            let cellBg = "";
                                            if (changeType === "swap")
                                                cellBg = "bg-green-500";
                                            else if (changeType === "removed")
                                                cellBg = "bg-violet-400";
                                            else if (changeType === "added")
                                                cellBg = "bg-green-200";
                                            else if (changeType === "modified")
                                                cellBg =
                                                    "bg-[var(--orange-light)]";
                                            else if (isToday)
                                                cellBg =
                                                    "bg-[var(--weekend-cells)]";
                                            else if (isHolidayDay)
                                                cellBg =
                                                    "bg-[var(--holiday-cells)]";
                                            else if (isWeekend)
                                                cellBg =
                                                    "bg-[var(--light-primary)]";

                                            return (
                                                <div
                                                    key={`mobile-user-${userIndex}-day-${index}`}
                                                    className={`flex flex-col items-center border-r border-[var(--separator)] ${cellBg} ${isMonthStart ? "border-l-2 border-l-[var(--primary)]" : ""}`}
                                                    style={{
                                                        minWidth: "4.5rem",
                                                        width: "4.5rem",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {/* Day label */}
                                                    <div
                                                        className={`w-full text-center py-1 border-b border-[var(--separator)] ${isToday ? "text-[var(--weekend-text)]" : isHolidayDay ? "text-[var(--holiday-text)]" : "text-[var(--gray)]"}`}
                                                    >
                                                        {isMonthStart && (
                                                            <p className="text-[9px] font-bold leading-tight uppercase text-[var(--primary)]">
                                                                {dayDate.toLocaleString(
                                                                    "it-IT",
                                                                    {
                                                                        month: "short",
                                                                    },
                                                                )}
                                                            </p>
                                                        )}
                                                        <p className="text-[10px] font-medium leading-tight">
                                                            {
                                                                dayOfWeekShort[
                                                                    dayDate.getDay()
                                                                ]
                                                            }
                                                        </p>
                                                        <p className="text-sm font-bold leading-tight">
                                                            {dayDate.getDate()}
                                                        </p>
                                                    </div>

                                                    {/* Shift select — bigger */}
                                                    <div className="py-2 px-1 flex items-center justify-center flex-1">
                                                        <select
                                                            value={getShiftValue(
                                                                userIndex,
                                                                index,
                                                            )}
                                                            onChange={(e) =>
                                                                handleShiftChange(
                                                                    userIndex,
                                                                    index,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onKeyDown={(e) =>
                                                                handleShiftKeyDown(
                                                                    userIndex,
                                                                    index,
                                                                    getShiftValue(
                                                                        userIndex,
                                                                        index,
                                                                    ),
                                                                    e,
                                                                )
                                                            }
                                                            disabled={!canEdit}
                                                            className={`
                                                                text-base font-bold text-center rounded border border-[var(--light-primary)]
                                                                focus:outline-none transition-all duration-200 appearance-none
                                                                ${canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-60"}
                                                                ${GetColorForShift(getShiftValue(userIndex, index))}
                                                            `}
                                                            style={{
                                                                width: "3.8rem",
                                                                padding:
                                                                    "5px 2px",
                                                            }}
                                                        >
                                                            <option value="--">
                                                                --
                                                            </option>
                                                            {shiftMeanings.map(
                                                                (value) => (
                                                                    <option
                                                                        key={
                                                                            value
                                                                        }
                                                                        value={
                                                                            value
                                                                        }
                                                                    >
                                                                        {value ===
                                                                        "CG"
                                                                            ? "CD"
                                                                            : value}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {popup.show && (
                    <Popup type={popup.type} message={popup.message} />
                )}
            </div>
        );
    }

    // ─── DESKTOP TABLE LAYOUT (unchanged) ────────────────────────────────────
    return (
        <div
            ref={scrollContainerRef}
            className="flex-1 w-[800px] max-h-[calc(100vh-14rem)] overflow-x-auto rounded-lg pb-1"
        >
            <div className="min-w-max bg-[var(--bento-bg)] border-t border-[var(--separator)] rounded-lg">
                {/* Header Row 1: Day of Week */}
                <div className="flex sticky top-0 z-30">
                    <div className="sticky left-0 z-30 bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)]">
                        <div className="min-w-[240px] w-[240px]">
                            <p className="text-[var(--gray)] text-sm p-4 text-start">
                                Giorno della settimana
                            </p>
                        </div>
                    </div>
                    <div className="flex border-b border-[var(--separator)]">
                        {allDays.map((dayDate, index) => {
                            const dow = dayOfWeekLabels[dayDate.getDay()];
                            const isWeekend =
                                dow === "Sabato" || dow === "Domenica";
                            const isHolidayDay = isHoliday(dayDate);
                            const isMonthStart =
                                dayDate.getDate() === 1 && index > 0;
                            return (
                                <div
                                    key={`dow-${index}`}
                                    className={`min-w-[8rem] w-[8rem] ${isMonthStart ? "border-l-2 border-l-[var(--primary)]" : ""}`}
                                >
                                    <p
                                        className={`${index === todayIndex ? "bg-[var(--weekend-cells)] text-[var(--weekend-text)]" : isHolidayDay ? "bg-[var(--holiday-cells)] text-[var(--holiday-text)]" : isWeekend ? "bg-[var(--light-primary)] text-[var(--black)]" : "bg-[var(--bento-bg)] text-[var(--gray)]"} text-sm p-4 text-center border-r border-[var(--separator)]`}
                                    >
                                        {dow}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Header Row 2: Day of Month */}
                <div className="flex sticky top-10 z-30">
                    <div className="sticky left-0 z-30 bg-[var(--bento-bg)] border-r border-b border-l border-[var(--separator)]">
                        <div className="min-w-[240px] w-[240px]">
                            <p className="text-[var(--gray)] text-sm p-4 text-start">
                                Giorno del mese
                            </p>
                        </div>
                    </div>
                    <div className="flex border-b border-[var(--separator)]">
                        {allDays.map((dayDate, index) => {
                            const dow = dayOfWeekLabels[dayDate.getDay()];
                            const isWeekend =
                                dow === "Sabato" || dow === "Domenica";
                            const isHolidayDay = isHoliday(dayDate);
                            const isMonthStart =
                                dayDate.getDate() === 1 && index > 0;
                            return (
                                <div
                                    key={`day-${index}`}
                                    ref={
                                        index === todayIndex
                                            ? todayColumnRef
                                            : null
                                    }
                                    className={`min-w-[8rem] w-[8rem] ${isMonthStart ? "border-l-2 border-l-[var(--primary)]" : ""}`}
                                >
                                    <p
                                        className={`${index === todayIndex ? "bg-[var(--weekend-cells)] text-[var(--weekend-text)]" : isHolidayDay ? "bg-[var(--holiday-cells)] text-[var(--holiday-text)]" : isWeekend ? "bg-[var(--light-primary)] text-[var(--black)]" : "bg-[var(--bento-bg)] text-[var(--gray)]"} text-sm p-4 text-center border-r border-[var(--separator)]`}
                                    >
                                        {dayDate.getDate()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Header Row 3: Shift Count */}
                <div className="flex sticky top-20 z-30">
                    <div className="sticky left-0 z-30 bg-[var(--light-primary)] border-r border-b border-l border-[var(--separator)]">
                        <div className="min-w-[240px] w-[240px]">
                            <p className="text-[var(--gray)] text-sm p-4 text-start">
                                Conteggio turni
                            </p>
                        </div>
                    </div>
                    <div className="flex border-b border-[var(--separator)]">
                        {allDays.map((dayDate, index) => {
                            const isMonthStart =
                                dayDate.getDate() === 1 && index > 0;
                            return (
                                <div
                                    key={`count-${index}`}
                                    className={`min-w-[8rem] w-[8rem] ${isMonthStart ? "border-l-2 border-l-[var(--primary)]" : ""}`}
                                >
                                    <div className="text-[var(--primary)] bg-[var(--light-primary)] text-sm p-4 text-center border-r border-[var(--separator)]">
                                        <span
                                            className={`${getShiftCountColor("Diurno", dayDate)} p-2 rounded mr-2 font-bold`}
                                        >
                                            {countShiftsForDay(
                                                "Diurno",
                                                dayDate,
                                            )}
                                        </span>
                                        <span
                                            className={`${getShiftCountColor("Notturno", dayDate)} p-2 rounded font-bold`}
                                        >
                                            {countShiftsForDay(
                                                "Notturno",
                                                dayDate,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Users Rows */}
                {!loading ? (
                    orderedUsers.map((user, userIndex) => {
                        const isEmployee = isDraggable(user.Role);
                        return (
                            <div
                                key={`user-${userIndex}`}
                                className={`flex relative ${draggedIndex === userIndex ? "opacity-50" : ""} ${dragOverIndex === userIndex && isEmployee ? "border-t-2 border-t-blue-500" : ""}`}
                                draggable={isEmployee && canEdit}
                                onDragStart={(e) =>
                                    handleDragStart(e, userIndex)
                                }
                                onDragOver={(e) => handleDragOver(e, userIndex)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, userIndex)}
                                onDragEnd={handleDragEnd}
                                style={{
                                    cursor: isEmployee ? "grab" : "default",
                                }}
                            >
                                <div
                                    className={`flex items-center justify-center sticky left-0 z-20 border-r border-b border-l border-[var(--separator)] cursor-pointer ${["shift leader", "crew chief"].includes((user.Role || "").trim().toLowerCase()) ? "bg-[var(--shift-leader-bg)]" : "bg-[var(--bento-bg)]"} ${selectedUserIndex === userIndex && !isUserRowModified(userIndex) ? "!bg-blue-200" : ""} ${isUserRowModified(userIndex) ? "!bg-[var(--orange-light)]" : ""}`}
                                    onClick={() =>
                                        setSelectedUserIndex(
                                            selectedUserIndex === userIndex
                                                ? null
                                                : userIndex,
                                        )
                                    }
                                >
                                    <div className="flex justify-between min-w-[240px] w-[240px]">
                                        <p
                                            className={`text-[var(--black)] ${selectedUserIndex === userIndex && !isUserRowModified(userIndex) ? "!text-black" : ""} text-sm p-4 text-start select-none flex items-center gap-2`}
                                        >
                                            {isEmployee &&
                                                (currentUserRole === "Admin" ||
                                                    currentUserRole ===
                                                        "Shift Leader") && (
                                                    <DragIcon className="w-6 text-[var(--black)]" />
                                                )}
                                            {formatUsername(user)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex border-b border-[var(--separator)]">
                                    {allDays.map((dayDate, index) => {
                                        const dow =
                                            dayOfWeekLabels[dayDate.getDay()];
                                        const isWeekend =
                                            dow === "Sabato" ||
                                            dow === "Domenica";
                                        const isHolidayDay = isHoliday(dayDate);
                                        const isMonthStart =
                                            dayDate.getDate() === 1 &&
                                            index > 0;
                                        return (
                                            <div
                                                key={`user-${userIndex}-day-${index}`}
                                                className={`min-w-[8rem] w-[8rem] ${isMonthStart ? "border-l-2 border-l-[var(--primary)] " : ""} `}
                                            >
                                                <div
                                                    className={`py-2 border-r border-[var(--separator)] gap-2 flex flex-col items-center justify-center relative ${index === todayIndex ? "bg-[var(--weekend-cells)]" : isHolidayDay ? "bg-[var(--holiday-cells)] text-[var(--holiday-text)]" : isWeekend ? "bg-[var(--light-primary)] text-[var(--weekend-text)]" : ""} ${selectedUserIndex === userIndex && !isCellModified(userIndex, index) ? "!bg-blue-200" : ""} ${getCellChangeBg(userIndex, index)}`}
                                                >
                                                    {canEdit &&
                                                        isManualChange(
                                                            userIndex,
                                                            index,
                                                        ) &&
                                                        (() => {
                                                            const cellKey = `${user.ID}-${formatDateStr(allDays[index])}`;
                                                            const chosen =
                                                                cellColorChoices[
                                                                    cellKey
                                                                ];
                                                            return (
                                                                <div
                                                                    className="absolute -top-2 -right-2 z-50"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                >
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            setOpenColorPicker(
                                                                                openColorPicker ===
                                                                                    cellKey
                                                                                    ? null
                                                                                    : cellKey,
                                                                            );
                                                                        }}
                                                                        className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-sm"
                                                                        title="Scegli colore evidenziazione"
                                                                    >
                                                                        <Colors className="w-5 h-5 text-white" />
                                                                    </button>
                                                                    {openColorPicker ===
                                                                        cellKey && (
                                                                        <div className="absolute top-7 right-0 z-50 bg-white rounded-lg shadow-xl py-1 px-1 flex flex-col gap-0.5 border border-gray-200 min-w-[130px]">
                                                                            {COLOR_OPTIONS.map(
                                                                                (
                                                                                    opt,
                                                                                ) => (
                                                                                    <button
                                                                                        key={
                                                                                            opt.id
                                                                                        }
                                                                                        onClick={() =>
                                                                                            handleColorChoice(
                                                                                                cellKey,
                                                                                                opt.id,
                                                                                            )
                                                                                        }
                                                                                        className={`flex items-center gap-2 w-full px-2 py-1 rounded-md hover:bg-gray-100 transition-colors ${chosen === opt.id ? "bg-gray-100" : ""}`}
                                                                                    >
                                                                                        <span
                                                                                            className={`w-6 h-6 rounded-full flex-shrink-0 ${opt.btnBg} `}
                                                                                        />
                                                                                        <span className="text-md text-gray-700 whitespace-nowrap">
                                                                                            {
                                                                                                opt.label
                                                                                            }
                                                                                        </span>
                                                                                    </button>
                                                                                ),
                                                                            )}
                                                                            <button
                                                                                onClick={() => {
                                                                                    setCellColorChoices(
                                                                                        (
                                                                                            prev,
                                                                                        ) => {
                                                                                            const n =
                                                                                                {
                                                                                                    ...prev,
                                                                                                };
                                                                                            delete n[
                                                                                                cellKey
                                                                                            ];
                                                                                            return n;
                                                                                        },
                                                                                    );
                                                                                    setOpenColorPicker(
                                                                                        null,
                                                                                    );
                                                                                }}
                                                                                className={`flex items-center gap-2 w-full px-2 py-1 rounded-md hover:bg-gray-100 transition-colors ${!chosen ? "bg-gray-100" : ""}`}
                                                                            >
                                                                                <span className="text-md text-[var(--gray)] whitespace-nowrap">
                                                                                    Nessun
                                                                                    colore
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    <div className="relative">
                                                        <select
                                                            value={getShiftValue(
                                                                userIndex,
                                                                index,
                                                            )}
                                                            onChange={(e) =>
                                                                handleShiftChange(
                                                                    userIndex,
                                                                    index,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            onKeyDown={(e) =>
                                                                handleShiftKeyDown(
                                                                    userIndex,
                                                                    index,
                                                                    getShiftValue(
                                                                        userIndex,
                                                                        index,
                                                                    ),
                                                                    e,
                                                                )
                                                            }
                                                            disabled={!canEdit}
                                                            className={`px-8 py-2 font-bold w-full text-center text-lg border border-[var(--light-primary)] rounded-md hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none ${canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${GetColorForShift(getShiftValue(userIndex, index))} ${getShiftValue(userIndex, index) === "R" ? "focus:text-black" : ""} ${getShiftValue(userIndex, index) === "FND" ? "focus:text-black" : ""}`}
                                                        >
                                                            <option value="--">
                                                                --
                                                            </option>
                                                            {shiftMeanings.map(
                                                                (value) => (
                                                                    <option
                                                                        key={
                                                                            value
                                                                        }
                                                                        value={
                                                                            value
                                                                        }
                                                                    >
                                                                        {value ===
                                                                        "CG"
                                                                            ? "CD"
                                                                            : value}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div
                                                        className={`flex flex-col w-full mt-2 gap-2 px-2 ${showNotes[user.ID] ? "block" : "hidden"}`}
                                                    >
                                                        <button className="w-full flex-1 text-xs text-white p-2 px-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition duration-300">
                                                            Aggiungi nota
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <h1 className="p-8 pb-64 text-[var(--black)] text-md">
                        Caricamento...
                    </h1>
                )}
            </div>
            {popup.show && <Popup type={popup.type} message={popup.message} />}
        </div>
    );
}

export default ShiftsTable;
