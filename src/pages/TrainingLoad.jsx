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

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    const normalizedRows = useMemo(() => {
        return (trainingLoads || []).map((row, index) => ({
            id: row.ID_SIM ?? row.Simulator ?? `${row.SIMULATORE}-${index}`,
            simulator: getField(row, ["SIMULATORE", "Simulatore", "Simulator"]),
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
            qtgVersion: getField(row, ["QTG Tool version", "QTG_Tool_version"]),
            comments: getField(row, ["Comments", "Comment"]),
            evalLoad: getField(row, ["Eval Load", "Eval_Load"]),
        }));
    }, [trainingLoads]);

    return (
        <section className="flex h-screen">
            <Sidebar active="training-load" isSidebarOpen={isSidebarOpen} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarStatus={setSidebarStatus}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="border border-[var(--light-primary)] rounded-lg bg-[var(--bento-bg)] p-4 md:p-6">
                        <div className="w-full flex items-center justify-between gap-4 border-b border-[var(--light-primary)] pb-4 mb-4">
                            <h1 className="text-xl md:text-xl text-[var(--black)] font-semibold">
                                Training Load List
                            </h1>
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
