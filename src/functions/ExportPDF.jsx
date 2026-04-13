import { jsPDF } from "jspdf";

/**
 * Formats a date to DD/MM/YYYY
 */
const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Formats a time to HH:MM
 */
const formatTime = (time) => {
    if (!time) return "----";
    const d = new Date(time);
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
};

/**
 * Gets formatted username by user ID
 */
const getUsernameById = (userId, users) => {
    const user = users.find((u) => u.ID === userId);
    if (!user || !user.Username) return "N/A";

    const parts = user.Username.split(".");
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const lastNameInitial = parts[1] ? parts[1].charAt(0).toUpperCase() : "";

    return lastNameInitial ? `${firstName} ${lastNameInitial}` : firstName;
};

const getNotesKeyForItem = (item) => {
    const isUnavailableTask =
        item?.TYPE === "Unavailable" || item?.IS_UNAVAILABLE === true;

    if (isUnavailableTask && item?.ORIGINAL_TASK_ID) {
        return item.ORIGINAL_TASK_ID;
    }

    return item?.ID;
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

const getCanonicalSimulatorKey = (name) => {
    const normalized = String(name ?? "")
        .toUpperCase()
        .replace(/\s+/g, "");

    if (normalized === "FTD" || normalized.includes("A109EFTD#1")) {
        return "FTD";
    }
    if (normalized === "109FFS" || normalized.includes("A109EFFS#1")) {
        return "109FFS";
    }
    if (normalized === "139#1" || normalized.includes("AW139FFS#1")) {
        return "139#1";
    }
    if (normalized === "139#3" || normalized.includes("AW139FFS#3")) {
        return "139#3";
    }
    if (normalized === "169" || normalized.includes("AW169FFS#1")) {
        return "169";
    }
    if (normalized === "189" || normalized.includes("AW189FFS#1")) {
        return "189";
    }

    return String(name ?? "").trim();
};

const buildTrainingLoadMap = (trainingLoads = []) => {
    const rowsBySimulator = {};

    trainingLoads.forEach((row) => {
        const simulatorLabel = getField(
            row,
            ["SIMULATORE", "Simulatore", "Simulator"],
            "",
        );
        const canonicalKey = getCanonicalSimulatorKey(simulatorLabel);
        if (!canonicalKey) return;

        if (!rowsBySimulator[canonicalKey]) {
            rowsBySimulator[canonicalKey] = [];
        }
        rowsBySimulator[canonicalKey].push(row);
    });

    const selectedBySimulator = {};
    Object.entries(rowsBySimulator).forEach(([key, rows]) => {
        const preferredRow =
            rows.find((row) => {
                const comments = String(
                    getField(row, ["Comments", "Comment"], ""),
                ).toLowerCase();
                return !comments.includes("dismissed");
            }) || rows[0];

        selectedBySimulator[key] = {
            MASTER_CONFIG: getField(preferredRow, [
                "Training Load",
                "Training_Load",
            ]),
            DEBRIEF_CONFIG: getField(preferredRow, [
                "Debrief Load",
                "Debrief_Load",
                "Debrief Config",
                "DebriefConfig",
            ]),
            QTG_VERSION: getField(preferredRow, [
                "QTG Tool version",
                "QTG_Tool_version",
            ]),
        };
    });

    return selectedBySimulator;
};

/**
 * Exports tasks to a PDF file grouped by simulator
 * Layout mirrors the bordered card style with header table, task list, and footer config table.
 *
 * @param {Array} tasks - Array of task objects (can be pre-filtered)
 * @param {Date} date - The date for the report title (optional, null if using filters)
 * @param {Array} simulators - Array of simulator objects for today (optional)
 * @param {String} title - Custom title for the PDF (optional, defaults to "Report Giornaliero")
 * @param {Object} notesMap - Map of task IDs to their notes arrays (optional)
 * @param {Array} users - Array of user objects for name lookup (optional)
 * @param {Boolean} showStatus - Whether to show task status (optional, defaults to true)
 */
export const exportTasksToPDF = (
    tasks,
    date = null,
    simulators = [],
    trainingLoads = [],
    title = "Report Giornaliero",
    notesMap = {},
    users = [],
    showStatus = true,
) => {
    // Exclude rescheduled items from export.
    const tasksForExport = tasks.filter(
        (task) => (task?.STATUS || "").trim() !== "Rischedulato",
    );

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // ── Helpers ──────────────────────────────────────────────────────────────

    const checkPageBreak = (needed = 10) => {
        if (y + needed > pageHeight - 15) {
            doc.addPage();
            y = 20;
        }
    };

    /**
     * Draw a filled rectangle (used for header rows inside simulator cards).
     */
    const fillRect = (x, rectY, w, h, r, g, b) => {
        doc.setFillColor(r, g, b);
        doc.rect(x, rectY, w, h, "F");
    };

    /**
     * Draw the outer border of a rectangle (no fill).
     */
    const strokeRect = (x, rectY, w, h, lw = 0.4) => {
        doc.setLineWidth(lw);
        doc.setDrawColor(160, 160, 160);
        doc.rect(x, rectY, w, h, "S");
    };

    /**
     * Draw a horizontal rule inside a card.
     */
    const hRule = (x, ruleY, w, lw = 0.3, r = 160, g = 160, b = 160) => {
        doc.setLineWidth(lw);
        doc.setDrawColor(r, g, b);
        doc.line(x, ruleY, x + w, ruleY);
    };

    /**
     * Draw a vertical rule.
     */
    const vRule = (x, ruleY, h, lw = 0.3) => {
        doc.setLineWidth(lw);
        doc.setDrawColor(160, 160, 160);
        doc.line(x, ruleY, x, ruleY + h);
    };

    // ── Page title ────────────────────────────────────────────────────────────

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${title} - ${formatDate(date)}`, margin, y);
    y += 6;
    hRule(margin, y, contentWidth, 0.6, 80, 80, 80);
    y += 10;

    // ── Build simulator groupings ─────────────────────────────────────────────

    const getMacroSimulator = (simName) => {
        const simxxi = ["FTD", "109FFS", "139#1"];
        const s3000 = ["139#3", "169", "189"];
        if (simxxi.includes(simName)) return "SIMXXI";
        if (s3000.includes(simName)) return "S3000";
        return "OTHERS";
    };

    const predefinedSimulators = [
        "FTD",
        "109FFS",
        "139#1",
        "139#3",
        "169",
        "189",
    ];

    const tasksBySimulator = {};
    tasksForExport.forEach((task) => {
        const simName = task.SIMULATOR || "No Simulator";
        if (!tasksBySimulator[simName]) tasksBySimulator[simName] = [];
        tasksBySimulator[simName].push(task);
    });

    const statusPriority = {
        Completato: 1,
        "In corso": 2,
        "Non completato": 3,
    };
    Object.keys(tasksBySimulator).forEach((simName) => {
        tasksBySimulator[simName].sort((a, b) => {
            return (
                (statusPriority[a.STATUS] || 999) -
                (statusPriority[b.STATUS] || 999)
            );
        });
    });

    const simulatorMap = {};
    simulators.forEach((sim) => {
        simulatorMap[sim.NAME] = sim;
        if (!tasksBySimulator[sim.NAME]) tasksBySimulator[sim.NAME] = [];
    });
    const trainingLoadMap = buildTrainingLoadMap(trainingLoads);
    predefinedSimulators.forEach((simName) => {
        if (!tasksBySimulator[simName]) tasksBySimulator[simName] = [];
    });

    const tasksByMacroSimulator = {};
    Object.keys(tasksBySimulator)
        .sort()
        .forEach((simName) => {
            const macro = getMacroSimulator(simName);
            if (!tasksByMacroSimulator[macro])
                tasksByMacroSimulator[macro] = {};
            tasksByMacroSimulator[macro][simName] = tasksBySimulator[simName];
        });
    if (!tasksByMacroSimulator["OTHERS"]) tasksByMacroSimulator["OTHERS"] = {};

    const macroSimOrder = ["SIMXXI", "S3000", "OTHERS"];
    const macroSimulatorNames = macroSimOrder.filter(
        (m) => tasksByMacroSimulator[m],
    );

    // ── Status translation ────────────────────────────────────────────────────

    const statusTranslations = {
        Completato: "Completed",
        "In corso": "In progress",
        "Non completato": "Not completed",
        "Da definire": "To be defined",
        "Non iniziato": "Not started",
    };

    // ── Draw one simulator card ───────────────────────────────────────────────
    /**
     * Draws the full bordered card for a simulator, matching the reference image:
     *
     *  ┌──────────────────────────────────────────────────────────────────────┐
     *  │ Sim: <NAME>  │  Training end time: HH:MM   │  Morning Readiness (PH) │
     *  │              │  Training start time: HH:MM  │  Tech: <TECH>           │
     *  ├──────────────────────────────────────────────────────────────────────┤
     *  │  - Task 1 title (Assigned: X)                                        │
     *  │  - Task 2 title (Assigned: X)   [status]                             │
     *  │    Description …                                                     │
     *  │    Notes …                                                            │
     *  ├───────────────────┬───────────────────┬──────────────────────────────┤
     *  │ Master config: X  │ Debrief config: X │ QTG tool version: X          │
     *  └──────────────────────────────────────────────────────────────────────┘
     */
    const drawSimulatorCard = (simName, simTasks) => {
        const sim = simulatorMap[simName] || {};
        const configFromTrainingLoad =
            trainingLoadMap[getCanonicalSimulatorKey(simName)] || {};

        // ── Estimate card height before drawing so we can page-break early ──
        // Header rows: fixed 14 pt
        const headerH = 14;

        // Task body: estimate per task
        let bodyH = 4; // top padding
        if (simTasks.length === 0) {
            bodyH += 8;
        } else {
            simTasks.forEach((task) => {
                bodyH += 8; // title line
                bodyH += 6; // assigned to line
                if (task.DESCRIPTION) {
                    const lines = doc.splitTextToSize(
                        task.DESCRIPTION,
                        contentWidth - 20,
                    );
                    bodyH += lines.length * 5 + 2;
                }
                const notes = (notesMap[getNotesKeyForItem(task)] || []).filter(
                    (n) => n.TYPE !== "automatico",
                );
                if (notes.length > 0) {
                    bodyH += 6; // "Notes" label
                    notes.forEach((note) => {
                        bodyH += 5;
                        const nl = doc.splitTextToSize(
                            note.DESCRIPTION || "",
                            contentWidth - 30,
                        );
                        bodyH += nl.length * 4 + 4;
                    });
                }
                if (showStatus) bodyH += 6;
                bodyH += 4; // spacing between tasks
            });
        }
        bodyH += 4; // bottom padding

        // Footer row: fixed 12 pt
        const footerH = 12;

        const totalCardH = headerH + bodyH + footerH;

        checkPageBreak(totalCardH + 6);

        const cardX = margin;
        const cardW = contentWidth;
        const cardY = y;

        // ── Header row ────────────────────────────────────────────────────────
        // Light grey background for header
        fillRect(cardX, cardY, cardW, headerH, 240, 240, 240);

        // Column split: sim name col ~28%, time col ~42%, readiness col ~30%
        const col1W = cardW * 0.28;
        const col2W = cardW * 0.42;
        // Sim name
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`Sim: ${simName}`, cardX + 4, cardY + 9);

        // Vertical divider after col1
        vRule(cardX + col1W, cardY, headerH);

        // Training times (two rows)
        const timeX = cardX + col1W + 4;
        const endTime = sim.START_HOUR
            ? formatTime(sim.START_HOUR)
            : sim.END_HOUR
              ? formatTime(sim.END_HOUR)
              : "----";
        const startTime = sim.END_HOUR
            ? formatTime(sim.END_HOUR)
            : sim.START_HOUR
              ? formatTime(sim.START_HOUR)
              : "----";

        doc.setFontSize(8.5);
        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(`Training end time:`, timeX, cardY + 5.5);
        doc.setFont(undefined, "bold");
        doc.text(
            endTime,
            timeX + doc.getTextWidth("Training end time: ") - 2,
            cardY + 5.5,
        );

        doc.setFont(undefined, "normal");
        doc.text(`Training start time:`, timeX, cardY + 11);
        doc.setFont(undefined, "bold");
        doc.text(
            startTime,
            timeX + doc.getTextWidth("Training start time: ") - 2,
            cardY + 11,
        );

        // Vertical divider after col2
        vRule(cardX + col1W + col2W, cardY, headerH);

        // Morning readiness + Tech
        const readX = cardX + col1W + col2W + 4;

        // Morning readiness label
        doc.setFontSize(8.5);
        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);
        const phLabel = sim.PHASE
            ? `Morning Readiness (${sim.PHASE})`
            : "Morning Readiness";
        doc.text(phLabel, readX, cardY + 5.5);

        // Tech label + colored name
        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);
        doc.text("Tech:", readX, cardY + 11);
        if (sim.ASSIGNED_TO) {
            doc.setFont(undefined, "bold");
            doc.setTextColor(200, 0, 0); // red like in image
            doc.text(
                ` ${sim.ASSIGNED_TO}`,
                readX + doc.getTextWidth("Tech:"),
                cardY + 11,
            );
        }

        // Outer border for header
        strokeRect(cardX, cardY, cardW, headerH, 0.5);

        // ── Task body ─────────────────────────────────────────────────────────
        const bodyY = cardY + headerH;
        let by = bodyY + 5; // inner cursor

        if (simTasks.length === 0) {
            doc.setFontSize(9);
            doc.setFont(undefined, "italic");
            doc.setTextColor(130, 130, 130);
            doc.text("No tasks assigned", cardX + 8, by + 3);
            by += 8;
        } else {
            simTasks.forEach((task, idx) => {
                const isLogbook =
                    task.ISLOGBOOK === true || task.ISLOGBOOK === 1;
                const titleColor = isLogbook ? [200, 100, 0] : [0, 80, 180];

                // Bullet + title
                doc.setFontSize(9.5);
                doc.setFont(undefined, "bold");
                doc.setTextColor(...titleColor);
                const bullet = "-  ";
                doc.text(bullet, cardX + 6, by);

                const taskTitle = task.TITLE || "N/A";
                doc.text(taskTitle, cardX + 12, by);

                by += 5.5;

                // Assigned to on its own line below the title
                doc.setFontSize(8.5);
                doc.setFont(undefined, "normal");
                doc.setTextColor(180, 0, 0);
                doc.text(
                    `Assigned to: ${task.ASSIGNED_TO || "N/A"}`,
                    cardX + 14,
                    by,
                );
                doc.setTextColor(0, 0, 0);

                by += 6;

                // Description
                if (task.DESCRIPTION) {
                    const descLines = doc.splitTextToSize(
                        task.DESCRIPTION,
                        contentWidth - 22,
                    );
                    doc.setFontSize(8.5);
                    doc.setFont(undefined, "normal");
                    doc.setTextColor(50, 50, 50);
                    descLines.forEach((line) => {
                        doc.text(line, cardX + 14, by);
                        by += 4.5;
                    });
                    by += 1;
                }

                // Notes
                const taskNotes = (
                    notesMap[getNotesKeyForItem(task)] || []
                ).filter((n) => n.TYPE !== "automatico");
                if (taskNotes.length > 0) {
                    doc.setFontSize(8.5);
                    doc.setFont(undefined, "bold");
                    doc.setTextColor(0, 80, 180);
                    doc.text("Notes", cardX + 14, by);
                    by += 4.5;

                    taskNotes.forEach((note) => {
                        const authorName =
                            note.AUTHOR_OVERRIDE ||
                            getUsernameById(note.CREATEDBY, users);
                        doc.setFontSize(8);
                        doc.setFont(undefined, "bold");
                        doc.setTextColor(0, 80, 180);
                        doc.text(`${authorName}:`, cardX + 18, by);
                        by += 4;

                        const noteLines = doc.splitTextToSize(
                            note.DESCRIPTION || "",
                            contentWidth - 30,
                        );
                        doc.setFontSize(8);
                        doc.setFont(undefined, "normal");
                        doc.setTextColor(100, 100, 100);
                        noteLines.forEach((line) => {
                            doc.text(line, cardX + 18, by);
                            by += 4;
                        });
                        by += 2;
                    });
                }

                // Status
                if (showStatus) {
                    const status = task.STATUS || "N/A";
                    const translatedStatus =
                        statusTranslations[status] || status;
                    const isCompleted = status === "Completato";
                    doc.setFontSize(8.5);
                    doc.setFont(undefined, "bold");
                    doc.setTextColor(
                        isCompleted ? 0 : 200,
                        isCompleted ? 140 : 0,
                        0,
                    );
                    doc.text(`Status: ${translatedStatus}`, cardX + 14, by);
                    by += 5.5;
                }

                // Thin separator between tasks (not after last)
                if (idx < simTasks.length - 1) {
                    by += 1;
                    hRule(cardX + 8, by, contentWidth - 8, 0.2, 200, 200, 200);
                    by += 4;
                }
            });
        }

        by += 4; // bottom padding of body

        // Body border (left + right sides of body area)
        const bodyActualH = by - bodyY;
        strokeRect(cardX, bodyY, cardW, bodyActualH, 0.4);

        // ── Footer / config row ───────────────────────────────────────────────
        const fY = bodyY + bodyActualH;
        fillRect(cardX, fY, cardW, footerH, 248, 248, 248);

        const fc1W = cardW * 0.38;
        const fc2W = cardW * 0.32;
        // Master config
        doc.setFontSize(8);
        doc.setFont(undefined, "normal");
        doc.setTextColor(80, 80, 80);
        doc.text("Master configuration:", cardX + 4, fY + 4.5);
        doc.setFont(undefined, "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(
            configFromTrainingLoad.MASTER_CONFIG || sim.MASTER_CONFIG || "N/A",
            cardX + 4,
            fY + 9.5,
        );

        vRule(cardX + fc1W, fY, footerH, 0.3);

        // Debrief config
        doc.setFont(undefined, "normal");
        doc.setTextColor(80, 80, 80);
        doc.text("Debrief configuration:", cardX + fc1W + 4, fY + 4.5);
        doc.setFont(undefined, "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(
            configFromTrainingLoad.DEBRIEF_CONFIG ||
                sim.DEBRIEF_CONFIG ||
                "N/A",
            cardX + fc1W + 4,
            fY + 9.5,
        );

        vRule(cardX + fc1W + fc2W, fY, footerH, 0.3);

        // QTG version
        doc.setFont(undefined, "normal");
        doc.setTextColor(80, 80, 80);
        doc.text("QTG tool version:", cardX + fc1W + fc2W + 4, fY + 4.5);
        doc.setFont(undefined, "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(
            configFromTrainingLoad.QTG_VERSION || sim.QTG_VERSION || "N/A",
            cardX + fc1W + fc2W + 4,
            fY + 9.5,
        );

        // Footer border
        strokeRect(cardX, fY, cardW, footerH, 0.5);

        // Advance y past the full card + spacing
        y = fY + footerH + 8;
    };

    // ── Loop macro groups ─────────────────────────────────────────────────────

    if (macroSimulatorNames.length === 0) {
        doc.setFontSize(10);
        doc.text("No tasks found.", margin, y);
    } else {
        macroSimulatorNames.forEach((macroSimName, macroIdx) => {
            const simulatorsInMacro = tasksByMacroSimulator[macroSimName];
            const simNamesInMacro = Object.keys(simulatorsInMacro).sort();

            checkPageBreak(30);

            // Macro-group label
            doc.setFontSize(13);
            doc.setFont(undefined, "bold");
            doc.setTextColor(139, 0, 0);
            doc.text(macroSimName, margin, y);
            y += 7;

            if (macroSimName === "OTHERS") {
                // Gather all tasks across all OTHERS simulators
                const allOthersTasks = [];
                simNamesInMacro.forEach((sn) =>
                    allOthersTasks.push(...simulatorsInMacro[sn]),
                );

                // Use the first sim name as the "card" name, or "Others"
                const displayName =
                    simNamesInMacro.length > 0
                        ? simNamesInMacro.join(", ")
                        : "Others";
                drawSimulatorCard(displayName, allOthersTasks);
            } else {
                simNamesInMacro.forEach((simName) => {
                    drawSimulatorCard(simName, simulatorsInMacro[simName]);
                });
            }

            // Bold separator between macro groups
            if (macroIdx < macroSimulatorNames.length - 1) {
                checkPageBreak(12);
                y += 2;
                hRule(margin, y, contentWidth, 0.8, 100, 100, 100);
                y += 10;
            }
        });
    }

    // ── Footer (page numbers) ─────────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, {
            align: "center",
        });
    }

    // ── Save ──────────────────────────────────────────────────────────────────
    const fileName = date
        ? `Daily_Report_${formatDate(date).replace(/\//g, "-")}.pdf`
        : `Daily_Report_${new Date().getTime()}.pdf`;
    doc.save(fileName);

    return tasksForExport.length;
};
