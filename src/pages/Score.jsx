import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Table, ConfigProvider } from "antd";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { useUsers } from "../components/data/provider/userAPI/useUsers";
import { useEmployeeShifts } from "../components/data/provider/employeeShiftsAPI/useEmployeeShifts";
import SearchIcon from "../assets/icons/search.tsx";
import ScoreCalendar from "../components/modals/ScoreCalendar.jsx";
import MasterScoreModal from "../components/modals/MasterScoreModal.jsx";
import GraficoModal from "../components/modals/GraficoModal.jsx";
import AddIcon from "../assets/icons/add.tsx";

const API_URL = import.meta.env.VITE_API_URL;

function Score() {
    const [isMobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("tutti");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showMasterModal, setShowMasterModal] = useState(false);
    const [showGrafico, setShowGrafico] = useState(false);
    const [scoreSummaries, setScoreSummaries] = useState({});

    const { users, loading: usersLoading } = useUsers();
    const { employeeShifts, loading: shiftsLoading } = useEmployeeShifts();

    const loadSummaries = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/score/values/summary`);
            const data = await res.json();
            const map = {};
            data.forEach((row) => {
                map[row.employee_id] = row;
            });
            setScoreSummaries(map);
        } catch (err) {
            console.error("Failed to load score summaries:", err);
        }
    }, []);

    useEffect(() => {
        loadSummaries();
    }, [loadSummaries]);

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    const todayDate = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }, []);

    const ACTIVE_SHIFT_TYPES = ["D", "N", "OP", "ON", "O"];

    const todayShiftIds = useMemo(() => {
        return new Set(
            employeeShifts
                .filter(
                    (s) =>
                        s.SELECTED_DATE?.split("T")[0] === todayDate &&
                        ACTIVE_SHIFT_TYPES.includes(s.SHIFT_TYPE),
                )
                .map((s) => s.EMPLOYEE_ID),
        );
    }, [employeeShifts, todayDate]);

    const tableData = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return users
            .filter((u) => u.Role === "Employee")
            .filter((u) => filter === "tutti" || todayShiftIds.has(u.ID))
            .map((u) => {
                const summary = scoreSummaries[u.ID];
                const softskills = summary?.softskills_total ?? 0;
                const competenze = summary?.competenze_total ?? 0;
                return {
                    key: u.ID,
                    nome: u.Username,
                    softskills,
                    competenze,
                    totale: softskills + competenze,
                    inTurno: todayShiftIds.has(u.ID),
                };
            })
            .filter((row) => !query || row.nome.toLowerCase().includes(query));
    }, [users, todayShiftIds, searchQuery, filter, scoreSummaries]);

    const columns = [
        {
            title: "Nome",
            dataIndex: "nome",
            key: "nome",
            sorter: (a, b) => a.nome.localeCompare(b.nome),
            render: (val) => (
                <span
                    style={{
                        color: "var(--black)",
                        fontSize: "1rem",
                    }}
                >
                    {val
                        .split(".")
                        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                        .join(" ")}
                </span>
            ),
        },
        {
            title: "Totale",
            dataIndex: "totale",
            key: "totale",
            align: "center",
            width: 120,
            defaultSortOrder: "descend",
            sorter: (a, b) => a.totale - b.totale,
            render: (val) => (
                <span>
                    <span
                        style={{
                            fontWeight: 700,
                            color: "var(--primary)",
                            fontSize: "1.25rem",
                        }}
                    >
                        {val}
                    </span>
                </span>
            ),
        },
        {
            title: "Softskills",
            dataIndex: "softskills",
            key: "softskills",
            align: "center",
            width: 140,
            sorter: (a, b) => a.softskills - b.softskills,
            render: (val) => (
                <span>
                    <span
                        style={{
                            fontWeight: 600,
                            color: "var(--black)",
                            fontSize: "1.25rem",
                        }}
                    >
                        {val}
                    </span>
                </span>
            ),
        },
        {
            title: "Competenze tecniche",
            dataIndex: "competenze",
            key: "competenze",
            align: "center",
            width: 190,
            sorter: (a, b) => a.competenze - b.competenze,
            render: (val) => (
                <span>
                    <span
                        style={{
                            fontWeight: 600,
                            color: "var(--black)",
                            fontSize: "1.25rem",
                        }}
                    >
                        {val}
                    </span>
                </span>
            ),
        },

        {
            title: "In turno oggi",
            dataIndex: "inTurno",
            key: "inTurno",
            align: "center",
            width: 140,
            render: (val) =>
                val ? (
                    <span
                        style={{
                            display: "inline-block",
                            padding: "2px 10px",
                            borderRadius: "8px",
                            background: "var(--primary)",
                            color: "#ffffff",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                        }}
                    >
                        In turno
                    </span>
                ) : (
                    <span style={{ color: "var(--gray)" }}>—</span>
                ),
        },
    ];

    return (
        <section className="flex h-screen overflow-hidden">
            <Sidebar
                active="score"
                isSidebarOpen={isSidebarOpen}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />

            <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarStatus={setSidebarStatus}
                    setMobileSidebarOpen={setMobileSidebarOpen}
                />

                <div className="overflow-y-auto h-full pb-6 sm:pb-10">
                    <div className="flex flex-col gap-4 border border-[var(--light-primary)] rounded-lg p-3 sm:p-4 bg-[var(--bento-bg)] m-3 sm:m-4 lg:m-8">
                        <p className="text-l text-[var(--gray)] border-b border-[var(--light-primary)] pb-4">
                            Valutazioni
                        </p>

                        <div className="flex flex-col md:flex-row gap-3 md:gap-6 justify-between">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-[var(--placeholder)]" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    type="search"
                                    placeholder="Cerca dipendente"
                                    className="border border-[var(--light-primary)] rounded-md pl-10 pr-2 py-2 bg-[var(--pure-white)] w-full text-md placeholder:text-[var(--placeholder)] focus:outline-none focus:border-[var(--separator)]"
                                />
                            </div>
                            <button
                                className="btn flex gap-2 items-center px-3 md:px-4"
                                onClick={() => setShowMasterModal(true)}
                            >
                                <p className="hidden lg:block truncate">
                                    Imposta valutazioni
                                </p>
                            </button>
                        </div>

                        <div className="flex gap-2 items-center">
                            {["tutti", "inTurno"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className="px-4 py-1.5 rounded-md text-sm font-medium border transition-colors"
                                    style={{
                                        background:
                                            filter === f
                                                ? "var(--primary)"
                                                : "var(--pure-white)",
                                        color:
                                            filter === f
                                                ? "#ffffff"
                                                : "var(--gray)",
                                        borderColor:
                                            filter === f
                                                ? "var(--primary)"
                                                : "var(--light-primary)",
                                    }}
                                >
                                    {f === "tutti"
                                        ? "Tutti i tecnici"
                                        : "In turno"}
                                </button>
                            ))}
                            <button
                                onClick={() => setShowGrafico(true)}
                                className="px-4 py-1.5 rounded-md text-sm font-medium border transition-colors ml-auto"
                                style={{
                                    background: "var(--pure-white)",
                                    color: "var(--gray)",
                                    borderColor: "var(--light-primary)",
                                }}
                            >
                                Grafico andamento
                            </button>
                        </div>

                        <ConfigProvider
                            theme={{
                                token: {
                                    colorPrimary: "var(--primary)",
                                    borderRadius: 6,
                                    fontFamily: "Quicksand, sans-serif",
                                    colorBgContainer: "var(--pure-white)",
                                    colorBorderSecondary:
                                        "var(--light-primary)",
                                },
                                components: {
                                    Table: {
                                        headerBg: "var(--light-bg)",
                                        headerColor: "var(--black)",
                                        headerIconColor: "var(--black)",
                                        headerSortActiveBg: "var(--light-bg)",
                                        headerSortHoverBg: "var(--light-bg)",
                                        bodySortBg: "var(--light-bg)",
                                        rowHoverBg: "var(--bento-bg)",
                                    },
                                },
                            }}
                        >
                            <Table
                                columns={columns}
                                dataSource={tableData}
                                loading={usersLoading || shiftsLoading}
                                pagination={false}
                                locale={{
                                    emptyText: "Nessun dipendente trovato",
                                }}
                                size="middle"
                                onRow={(record) => ({
                                    onClick: () => setSelectedEmployee(record),
                                    style: { cursor: "pointer" },
                                })}
                            />
                        </ConfigProvider>
                    </div>
                </div>
            </div>
            {selectedEmployee && (
                <ScoreCalendar
                    employee={selectedEmployee}
                    onClose={() => {
                        setSelectedEmployee(null);
                        loadSummaries();
                    }}
                />
            )}
            {showMasterModal && (
                <MasterScoreModal onClose={() => setShowMasterModal(false)} />
            )}
            {showGrafico && (
                <GraficoModal
                    users={users}
                    onClose={() => setShowGrafico(false)}
                />
            )}
        </section>
    );
}

export default Score;
