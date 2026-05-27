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

// Simulators that support mode switching; value = default mode keyword
const MODE_SIMULATORS = {
    "A109E FFS#1": "POWER",
    "A109E FTD#1": "POWER",
    "A109L FFS#1": "LUHS",
    "A109L FTD#1": "LUHS",
};

// Each simulator shares training load options with the other members of its group
const SIMULATOR_GROUPS = {
    "A109E FFS#1": ["A109E FFS#1", "A109L FFS#1"],
    "A109L FFS#1": ["A109E FFS#1", "A109L FFS#1"],
    "A109E FTD#1": ["A109E FTD#1", "A109L FTD#1"],
    "A109L FTD#1": ["A109E FTD#1", "A109L FTD#1"],
};

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
    const [selectedTrainingLoads, setSelectedTrainingLoads] = useState({});

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    const groupedBySimulator = useMemo(() => {
        const groups = {};
        (trainingLoads || []).forEach((row) => {
            const simName = getField(row, ["SIMULATORE", "Simulatore", "Simulator"]);
            if (simName in MODE_SIMULATORS) {
                if (!groups[simName]) groups[simName] = [];
                groups[simName].push(row);
            }
        });
        return groups;
    }, [trainingLoads]);

    const normalizedRows = useMemo(() => {
        const seenSimulators = new Set();

        return (trainingLoads || [])
            .map((row, index) => {
                const simName = getField(row, ["SIMULATORE", "Simulatore", "Simulator"]);

                if (simName in MODE_SIMULATORS) {
                    if (seenSimulators.has(simName)) return null;
                    seenSimulators.add(simName);

                    // Own row supplies the default training load and all non-TL column values
                    const ownRows = groupedBySimulator[simName] || [];
                    const ownRow = ownRows[0];

                    // Collect training load options from all simulators in the same group
                    const groupMembers = SIMULATOR_GROUPS[simName];
                    const allGroupRows = groupMembers.flatMap(
                        (member) => groupedBySimulator[member] || [],
                    );
                    const tlOptions = allGroupRows
                        .map((r) => getField(r, ["Training Load", "Training_Load"], ""))
                        .filter(
                            (v, i, arr) =>
                                v !== "---" && v !== "" && arr.indexOf(v) === i,
                        );

                    // Selected value, or fall back to this simulator's own training load
                    const selectedTL = selectedTrainingLoads[simName];
                    const displayTL =
                        selectedTL && tlOptions.includes(selectedTL)
                            ? selectedTL
                            : getField(ownRow, ["Training Load", "Training_Load"]);

                    return {
                        id: simName,
                        simulator: simName,
                        trainingLoadOptions: tlOptions,
                        trainingLoad: displayTL,
                        debriefLoad: getField(ownRow, [
                            "Debrief Load",
                            "Debrief_Load",
                            "Debrief Config",
                            "DebriefConfig",
                        ]),
                        previousTrainingLoad: getField(ownRow, [
                            "Previous Training Load",
                            "Previous_Training_Load",
                        ]),
                        qtgVersion: getField(ownRow, ["QTG Tool version", "QTG_Tool_version"]),
                        comments: getField(ownRow, ["Comments", "Comment"]),
                        evalLoad: getField(ownRow, ["Eval Load", "Eval_Load"]),
                    };
                }

                return {
                    id: row.ID_SIM ?? row.Simulator ?? `${simName}-${index}`,
                    simulator: simName,
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
                };
            })
            .filter(Boolean);
    }, [trainingLoads, groupedBySimulator, selectedTrainingLoads]);

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
                                                    {row.trainingLoadOptions ? (
                                                        <select
                                                            value={row.trainingLoad}
                                                            onChange={(e) =>
                                                                setSelectedTrainingLoads((prev) => ({
                                                                    ...prev,
                                                                    [row.simulator]: e.target.value,
                                                                }))
                                                            }
                                                            className="w-full bg-transparent border border-[var(--separator)] rounded px-2 py-1 text-sm text-[var(--black)] cursor-pointer focus:outline-none focus:border-[var(--primary)]"
                                                        >
                                                            {row.trainingLoadOptions.map((option) => (
                                                                <option key={option} value={option}>
                                                                    {option}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        row.trainingLoad
                                                    )}
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
