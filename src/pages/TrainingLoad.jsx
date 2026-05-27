import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import { useTrainingLoads } from "../components/data/provider/trainingLoadAPI/useTrainingLoads";

const COLUMNS = [
    "Simulatore",
    "Training Load",
    "Debrief Load",
    "Previous Training Load",
    "QTG Tool version",
    "Comments",
    "Eval Load",
];

export const A109_MODE_KEY = "a109Mode";

const A109E_SIMS = new Set(["A109E FFS#1", "A109E FTD#1"]);
const A109L_SIMS = new Set(["A109L FFS#1", "A109L FTD#1"]);

const normalizeFieldName = (value) =>
    String(value ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

const getField = (row, fieldNames, fallback = "---") => {
    for (const fieldName of fieldNames) {
        if (row?.[fieldName] !== undefined && row?.[fieldName] !== null) {
            return row[fieldName];
        }
    }

    if (row && typeof row === "object") {
        const normalizedCandidates = new Set(
            fieldNames.map((fieldName) => normalizeFieldName(fieldName)),
        );

        for (const [key, value] of Object.entries(row)) {
            if (
                normalizedCandidates.has(normalizeFieldName(key)) &&
                value !== undefined &&
                value !== null
            ) {
                return value;
            }
        }
    }

    return fallback;
};

function TrainingLoad() {
    const { trainingLoads, loading, error } = useTrainingLoads();
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [a109Mode, setA109Mode] = useState(
        () => localStorage.getItem(A109_MODE_KEY) || "A109E",
    );

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    const handleA109ModeChange = (mode) => {
        setA109Mode(mode);
        localStorage.setItem(A109_MODE_KEY, mode);
    };

    const normalizedRows = useMemo(() => {
        const seenSimulators = new Set();

        return (trainingLoads || [])
            .filter((row) => {
                const simName = getField(row, [
                    "SIMULATORE",
                    "Simulatore",
                    "Simulator",
                ]);
                if (A109E_SIMS.has(simName)) return a109Mode === "A109E";
                if (A109L_SIMS.has(simName)) return a109Mode === "A109L";
                return true;
            })
            .filter((row) => {
                const simName = getField(row, [
                    "SIMULATORE",
                    "Simulatore",
                    "Simulator",
                ]);
                if (seenSimulators.has(simName)) return false;
                seenSimulators.add(simName);
                return true;
            })
            .map((row, index) => ({
                id: row.ID_SIM ?? row.Simulator ?? `${row.SIMULATORE}-${index}`,
                simulator: getField(row, [
                    "SIMULATORE",
                    "Simulatore",
                    "Simulator",
                ]),
                trainingLoad: getField(row, ["Training Load", "Training_Load"]),
                debriefLoad: getField(row, [
                    "Debrief Load",
                    "Debrief_Load",
                    "Debrief Config",
                    "DebriefConfig",
                ]),
                previousTrainingLoad: getField(row, [
                    "Previous Training Load",
                    "Previous_Training_Load",
                ]),
                qtgVersion: getField(row, [
                    "QTG Tool version",
                    "QTG_Tool_version",
                ]),
                comments: getField(row, ["Comments", "Comment"]),
                evalLoad: getField(row, ["Eval Load", "Eval_Load"]),
            }));
    }, [trainingLoads, a109Mode]);

    return (
        <section className="flex h-screen">
            <Sidebar
                active="training-load"
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

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="border border-[var(--light-primary)] rounded-lg bg-[var(--bento-bg)] p-4 md:p-6">
                        <div className="w-full flex items-center justify-between gap-4 border-b border-[var(--light-primary)] pb-4 mb-4">
                            <h1 className="text-xl md:text-xl text-[var(--black)] font-semibold">
                                Training Load List
                            </h1>

                            <div className="flex items-center gap-2">
                                <div className="flex rounded-md overflow-hidden border border-[var(--light-primary)]">
                                    <button
                                        onClick={() =>
                                            handleA109ModeChange("A109E")
                                        }
                                        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                            a109Mode === "A109E"
                                                ? "bg-[var(--primary)] text-white"
                                                : "bg-[var(--pure-white)] text-[var(--black)] hover:bg-[var(--bento-bg)]"
                                        }`}
                                    >
                                        A109E
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleA109ModeChange("A109L")
                                        }
                                        className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-[var(--light-primary)] ${
                                            a109Mode === "A109L"
                                                ? "bg-[var(--primary)] text-white"
                                                : "bg-[var(--pure-white)] text-[var(--black)] hover:bg-[var(--bento-bg)]"
                                        }`}
                                    >
                                        A109L
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-md border border-[var(--red)] text-[var(--red)] bg-[var(--pure-white)]">
                                Errore nel recupero dei dati: {error}
                            </div>
                        )}

                        <div className="overflow-x-auto rounded-md bg-[var(--pure-white)]">
                            <table className="w-full min-w-[900px] text-sm text-left border-collapse">
                                <thead className="bg-[var(--primary)] text-white">
                                    <tr>
                                        {COLUMNS.map((column) => (
                                            <th
                                                key={column}
                                                className="px-4 py-3 border border-[var(--primary-hover)]"
                                            >
                                                {column}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={COLUMNS.length}
                                                className="px-4 py-6 text-center text-[var(--gray)] border border-[var(--separator)]"
                                            >
                                                Caricamento dati...
                                            </td>
                                        </tr>
                                    ) : normalizedRows.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={COLUMNS.length}
                                                className="px-4 py-6 text-center text-[var(--gray)] border border-[var(--separator)]"
                                            >
                                                Nessun dato disponibile
                                            </td>
                                        </tr>
                                    ) : (
                                        normalizedRows.map((row, rowIndex) => (
                                            <tr
                                                key={row.id}
                                                className={
                                                    rowIndex % 2 === 0
                                                        ? "bg-[var(--pure-white)]"
                                                        : "bg-[var(--bento-bg)]"
                                                }
                                            >
                                                <td className="px-4 py-3 border border-[var(--separator)] text-[var(--black)]">
                                                    {row.simulator}
                                                </td>
                                                <td className="px-4 py-3 border border-[var(--separator)] text-[var(--black)]">
                                                    {row.trainingLoad}
                                                </td>
                                                <td className="px-4 py-3 border border-[var(--separator)] text-[var(--black)]">
                                                    {row.debriefLoad}
                                                </td>
                                                <td className="px-4 py-3 border border-[var(--separator)] text-[var(--black)]">
                                                    {row.previousTrainingLoad}
                                                </td>
                                                <td className="px-4 py-3 border border-[var(--separator)] text-[var(--black)]">
                                                    {row.qtgVersion}
                                                </td>
                                                <td className="px-4 py-3 border border-[var(--separator)] text-[var(--black)]">
                                                    {row.comments}
                                                </td>
                                                <td className="px-4 py-3 border border-[var(--separator)] text-[var(--black)]">
                                                    {row.evalLoad}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TrainingLoad;
