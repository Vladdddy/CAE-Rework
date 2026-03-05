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
    if (!time) return "N/A";
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

/**
 * Exports tasks to a PDF file grouped by simulator
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
    title = "Report Giornaliero",
    notesMap = {},
    users = [],
    showStatus = true,
) => {
    // Use the tasks as-is (already filtered by the calling component)
    const tasksForExport = tasks;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 20;

    // Helper function to check and add new page if needed
    const checkPageBreak = (requiredSpace = 10) => {
        if (yPosition + requiredSpace > 270) {
            doc.addPage();
            yPosition = 20;
        }
    };

    // Title
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`${title} - ${formatDate(date)}`, margin, yPosition);

    // Line separator
    yPosition += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Define macro-simulator groupings
    const getMacroSimulator = (simName) => {
        const simxxi = ["FTD", "109FFS", "139#1"];
        const s3000 = ["139#3", "169", "189"];

        if (simxxi.includes(simName)) return "SIMXXI";
        if (s3000.includes(simName)) return "S3000";
        return "OTHERS";
    };

    // Ensure all predefined simulators are included
    const predefinedSimulators = [
        "FTD",
        "109FFS",
        "139#1",
        "139#3",
        "169",
        "189",
    ];

    // Group tasks by simulator
    const tasksBySimulator = {};
    tasksForExport.forEach((task) => {
        const simName = task.SIMULATOR || "No Simulator";
        if (!tasksBySimulator[simName]) {
            tasksBySimulator[simName] = [];
        }
        tasksBySimulator[simName].push(task);
    });

    // Sort tasks within each simulator by status priority
    const statusPriority = {
        Completato: 1,
        "In corso": 2,
        "Non completato": 3,
    };

    Object.keys(tasksBySimulator).forEach((simName) => {
        tasksBySimulator[simName].sort((a, b) => {
            const priorityA = statusPriority[a.STATUS] || 999;
            const priorityB = statusPriority[b.STATUS] || 999;
            return priorityA - priorityB;
        });
    });

    // Create a map of simulators for quick lookup
    const simulatorMap = {};
    if (simulators && simulators.length > 0) {
        simulators.forEach((sim) => {
            simulatorMap[sim.NAME] = sim;
            // Add simulator to tasksBySimulator even if it has no tasks
            if (!tasksBySimulator[sim.NAME]) {
                tasksBySimulator[sim.NAME] = [];
            }
        });
    }

    // Always include predefined simulators even if they have no tasks
    predefinedSimulators.forEach((simName) => {
        if (!tasksBySimulator[simName]) {
            tasksBySimulator[simName] = [];
        }
    });

    // Sort simulator names
    const simulatorNames = Object.keys(tasksBySimulator).sort();

    // Group simulators by macro-simulator
    const tasksByMacroSimulator = {};
    simulatorNames.forEach((simName) => {
        const macroSim = getMacroSimulator(simName);
        if (!tasksByMacroSimulator[macroSim]) {
            tasksByMacroSimulator[macroSim] = {};
        }
        tasksByMacroSimulator[macroSim][simName] = tasksBySimulator[simName];
    });

    // Always ensure OTHERS exists, even if empty
    if (!tasksByMacroSimulator["OTHERS"]) {
        tasksByMacroSimulator["OTHERS"] = {};
    }

    // Sort macro-simulators (SIMXXI, S3000, OTHERS)
    const macroSimOrder = ["SIMXXI", "S3000", "OTHERS"];
    const macroSimulatorNames = macroSimOrder.filter(
        (macro) => tasksByMacroSimulator[macro],
    );

    // If no tasks and no simulators
    if (macroSimulatorNames.length === 0) {
        doc.setFontSize(10);
        doc.text("No tasks found.", margin, yPosition);
    } else {
        // Loop through each macro-simulator
        macroSimulatorNames.forEach((macroSimName, macroIndex) => {
            const simulatorsInMacro = tasksByMacroSimulator[macroSimName];
            const simulatorNamesInMacro = Object.keys(simulatorsInMacro).sort();

            checkPageBreak(40);

            // Macro-simulator header in dark red
            doc.setFontSize(14);
            doc.setFont(undefined, "bold");
            doc.setTextColor(139, 0, 0); // Dark red
            doc.text(macroSimName, margin, yPosition);

            // For OTHERS, show simulator details next to header if available
            if (
                macroSimName === "OTHERS" &&
                !showStatus &&
                simulatorNamesInMacro.length > 0
            ) {
                const firstSimInOthers = simulatorNamesInMacro[0];
                const sim = simulatorMap[firstSimInOthers];
                if (sim) {
                    doc.setFontSize(12);
                    doc.setFont(undefined, "normal");
                    const simDetailsPrefix = `  -  End time: ${formatTime(sim.START_HOUR)}   Start time: ${formatTime(sim.END_TIME)}   `;
                    const simDetailsAssigned = `Assigned to: ${sim.ASSIGNED_TO || "N/A"}`;
                    doc.setTextColor(139, 0, 0);
                    doc.text(
                        simDetailsPrefix,
                        margin + doc.getTextWidth(macroSimName) + 5,
                        yPosition,
                    );
                    doc.setTextColor(139, 0, 0);
                    doc.text(
                        simDetailsAssigned,
                        margin +
                            doc.getTextWidth(macroSimName) +
                            5 +
                            doc.getTextWidth(simDetailsPrefix),
                        yPosition,
                    );
                }
            }

            yPosition += 12;

            // For OTHERS macro-simulator, display tasks directly without individual simulator names
            if (macroSimName === "OTHERS") {
                // Collect all tasks from all simulators in OTHERS
                const allTasksInOthers = [];
                simulatorNamesInMacro.forEach((simName) => {
                    allTasksInOthers.push(...simulatorsInMacro[simName]);
                });

                if (allTasksInOthers.length === 0) {
                    doc.setFontSize(9);
                    doc.setFont(undefined, "italic");
                    doc.setTextColor(128, 128, 128);
                    doc.text("No tasks assigned", margin + 10, yPosition);
                    yPosition += 10;
                } else {
                    allTasksInOthers.forEach((task, index) => {
                        checkPageBreak(15);

                        // Determine if this is a logbook or task
                        const isLogbook =
                            task.ISLOGBOOK === true || task.ISLOGBOOK === 1;

                        // Type and Name with Assigned To inline
                        doc.setFontSize(10);
                        doc.setFont(undefined, "bold");
                        if (isLogbook) {
                            doc.setTextColor(255, 140, 0); // Orange for logbooks
                        } else {
                            doc.setTextColor(0, 102, 204); // Blue for tasks
                        }
                        const taskTitle = `${task.TITLE || "N/A"}`;
                        doc.text(taskTitle, margin + 10, yPosition);

                        // Assigned To inline
                        doc.setFontSize(9);
                        doc.setFont(undefined, "normal");
                        doc.setTextColor(139, 0, 0);
                        const assignedText = ` (Assigned to: ${task.ASSIGNED_TO || "N/A"})`;
                        // Calculate width with the bold font size
                        doc.setFontSize(10);
                        doc.setFont(undefined, "bold");
                        const titleWidth = doc.getTextWidth(taskTitle);
                        doc.setFontSize(9);
                        doc.setFont(undefined, "normal");
                        doc.text(
                            assignedText,
                            margin + 10 + titleWidth,
                            yPosition,
                        );

                        // Reset color to black for subsequent text
                        doc.setTextColor(0, 0, 0);

                        yPosition += 8;

                        // Description
                        if (task.DESCRIPTION) {
                            const descLines = doc.splitTextToSize(
                                `${task.DESCRIPTION}`,
                                pageWidth - 2 * margin - 10,
                            );
                            checkPageBreak(6);
                            doc.text(descLines, margin + 15, yPosition);
                            yPosition += descLines.length * 5;
                        }

                        // Notes (excluding system notes)
                        const taskNotes = (notesMap[task.ID] || []).filter(
                            (note) => note.TYPE !== "automatico",
                        );
                        if (taskNotes.length > 0) {
                            yPosition += 4;
                            checkPageBreak(5);

                            doc.setFontSize(9);
                            doc.setFont(undefined, "bold");
                            doc.setTextColor(0, 102, 204);
                            doc.text("Notes", margin + 15, yPosition);
                            yPosition += 4;

                            taskNotes.forEach((note) => {
                                checkPageBreak(6);

                                // Note author and description
                                doc.setFontSize(8);
                                doc.setFont(undefined, "bold");
                                doc.setTextColor(0, 102, 204);
                                const authorName = getUsernameById(
                                    note.CREATEDBY,
                                    users,
                                );
                                doc.text(
                                    `${authorName}:`,
                                    margin + 20,
                                    yPosition,
                                );
                                yPosition += 4;

                                // Note description
                                doc.setFontSize(8);
                                doc.setFont(undefined, "normal");
                                doc.setTextColor(100, 100, 100);
                                const noteLines = doc.splitTextToSize(
                                    note.DESCRIPTION || "",
                                    pageWidth - 2 * margin - 15,
                                );
                                checkPageBreak(5);
                                doc.text(noteLines, margin + 20, yPosition);
                                yPosition += noteLines.length * 4 + 3;
                            });
                        }

                        // Status with color coding (only if showStatus is true)
                        if (showStatus) {
                            doc.setFontSize(9);
                            doc.setFont(undefined, "bold");
                            const status = task.STATUS || "N/A";

                            // Translate status from Italian to English
                            const statusTranslations = {
                                Completato: "Completed",
                                "In corso": "In progress",
                                "Non completato": "Not completed",
                                "Da definire": "To be defined",
                                "Non iniziato": "Not started",
                            };
                            const translatedStatus =
                                statusTranslations[status] || status;

                            const isCompleted = status === "Completato";
                            if (isCompleted) {
                                doc.setTextColor(0, 128, 0); // Green for "Completato"
                            } else {
                                doc.setTextColor(255, 0, 0); // Red for other statuses
                            }
                            doc.text(
                                `Status: ${translatedStatus}`,
                                margin + 15,
                                yPosition,
                            );
                            yPosition += 6;
                        }

                        doc.setFontSize(10);
                        doc.setFont(undefined, "normal");
                        doc.setTextColor(0, 0, 0);

                        // Light separator between tasks
                        if (index < allTasksInOthers.length - 1) {
                            checkPageBreak(8);
                            yPosition += 4;
                            doc.setLineWidth(0.1);
                            doc.setDrawColor(220, 220, 220);
                            doc.line(
                                margin + 10,
                                yPosition,
                                pageWidth - margin,
                                yPosition,
                            );
                            yPosition += 6;
                        }
                    });
                }
            } else {
                // For SIMXXI and S3000, show individual simulators
                simulatorNamesInMacro.forEach((simName, simIndex) => {
                    const simTasks = simulatorsInMacro[simName];

                    checkPageBreak(40);

                    // Simulator header in blue
                    doc.setFontSize(12);
                    doc.setFont(undefined, "bold");
                    doc.setTextColor(0, 102, 204); // Blue
                    doc.text(simName, margin + 10, yPosition);

                    // Simulator details inline (if available) - only show for activities, not reports
                    if (!showStatus) {
                        const sim = simulatorMap[simName];
                        if (sim) {
                            doc.setFontSize(12);
                            doc.setFont(undefined, "normal");
                            const simDetailsPrefix = `  -  End time: ${formatTime(sim.START_HOUR)}   Start time: ${formatTime(sim.END_HOUR)}   `;
                            const simDetailsAssigned = `Assigned to: ${sim.ASSIGNED_TO || "N/A"}`;
                            doc.setTextColor(0, 102, 204);
                            doc.text(
                                simDetailsPrefix,
                                margin + 10 + doc.getTextWidth(simName) + 5,
                                yPosition,
                            );
                            doc.setTextColor(139, 0, 0);
                            doc.text(
                                simDetailsAssigned,
                                margin +
                                    10 +
                                    doc.getTextWidth(simName) +
                                    5 +
                                    doc.getTextWidth(simDetailsPrefix),
                                yPosition,
                            );
                        } else {
                            doc.setTextColor(0, 0, 0);
                        }
                    } else {
                        doc.setTextColor(0, 0, 0);
                    }

                    yPosition += 10;

                    // Tasks for this simulator
                    if (simTasks.length === 0) {
                        // No tasks for this simulator
                        doc.setFontSize(9);
                        doc.setFont(undefined, "italic");
                        doc.setTextColor(128, 128, 128);
                        doc.text("No tasks assigned", margin + 15, yPosition);
                        yPosition += 10;
                    } else {
                        simTasks.forEach((task, index) => {
                            checkPageBreak(15);

                            // Determine if this is a logbook or task
                            const isLogbook =
                                task.ISLOGBOOK === true || task.ISLOGBOOK === 1;

                            // Type and Name with Assigned To inline
                            doc.setFontSize(10);
                            doc.setFont(undefined, "bold");
                            if (isLogbook) {
                                doc.setTextColor(255, 140, 0); // Orange for logbooks
                            } else {
                                doc.setTextColor(0, 102, 204); // Blue for tasks
                            }
                            const taskTitle = `${task.TITLE || "N/A"}`;
                            doc.text(taskTitle, margin + 15, yPosition);

                            // Assigned To inline
                            doc.setFontSize(9);
                            doc.setFont(undefined, "normal");
                            doc.setTextColor(139, 0, 0);
                            const assignedText = ` (Assigned to: ${task.ASSIGNED_TO || "N/A"})`;
                            // Calculate width with the bold font size
                            doc.setFontSize(10);
                            doc.setFont(undefined, "bold");
                            const titleWidth = doc.getTextWidth(taskTitle);
                            doc.setFontSize(9);
                            doc.setFont(undefined, "normal");
                            doc.text(
                                assignedText,
                                margin + 15 + titleWidth,
                                yPosition,
                            );

                            // Reset color to black for subsequent text
                            doc.setTextColor(0, 0, 0);

                            yPosition += 8;

                            // Description
                            if (task.DESCRIPTION) {
                                const descLines = doc.splitTextToSize(
                                    `${task.DESCRIPTION}`,
                                    pageWidth - 2 * margin - 15,
                                );
                                checkPageBreak(5);
                                doc.text(descLines, margin + 20, yPosition);
                                yPosition += descLines.length * 5;
                            }

                            // Notes (excluding system notes)
                            const taskNotes = (notesMap[task.ID] || []).filter(
                                (note) => note.TYPE !== "automatico",
                            );
                            if (taskNotes.length > 0) {
                                yPosition += 4;
                                checkPageBreak(5);

                                doc.setFontSize(9);
                                doc.setFont(undefined, "bold");
                                doc.setTextColor(0, 102, 204);
                                doc.text("Notes", margin + 20, yPosition);
                                yPosition += 4;

                                taskNotes.forEach((note) => {
                                    checkPageBreak(5);

                                    // Note author and description
                                    doc.setFontSize(8);
                                    doc.setFont(undefined, "bold");
                                    doc.setTextColor(0, 102, 204);
                                    const authorName = getUsernameById(
                                        note.CREATEDBY,
                                        users,
                                    );
                                    doc.text(
                                        `${authorName}:`,
                                        margin + 25,
                                        yPosition,
                                    );
                                    yPosition += 4;

                                    // Note description
                                    doc.setFontSize(8);
                                    doc.setFont(undefined, "normal");
                                    doc.setTextColor(100, 100, 100);
                                    const noteLines = doc.splitTextToSize(
                                        note.DESCRIPTION || "",
                                        pageWidth - 2 * margin - 20,
                                    );
                                    checkPageBreak(6);
                                    doc.text(noteLines, margin + 25, yPosition);
                                    yPosition += noteLines.length * 4 + 3;
                                });
                            }

                            // Status with color coding (only if showStatus is true)
                            if (showStatus) {
                                doc.setFontSize(9);
                                doc.setFont(undefined, "bold");
                                const status = task.STATUS || "N/A";

                                // Translate status from Italian to English
                                const statusTranslations = {
                                    Completato: "Completed",
                                    "In corso": "In progress",
                                    "Non completato": "Not completed",
                                    "Da definire": "To be defined",
                                    "Non iniziato": "Not started",
                                };
                                const translatedStatus =
                                    statusTranslations[status] || status;

                                const isCompleted = status === "Completato";
                                if (isCompleted) {
                                    doc.setTextColor(0, 128, 0); // Green for "Completato"
                                } else {
                                    doc.setTextColor(255, 0, 0); // Red for other statuses
                                }
                                doc.text(
                                    `Status: ${translatedStatus}`,
                                    margin + 20,
                                    yPosition,
                                );
                                yPosition += 6;
                            }

                            doc.setFontSize(10);
                            doc.setFont(undefined, "normal");
                            doc.setTextColor(0, 0, 0);

                            // Light separator between tasks
                            if (index < simTasks.length - 1) {
                                checkPageBreak(8);
                                yPosition += 4;
                                doc.setLineWidth(0.1);
                                doc.setDrawColor(220, 220, 220);
                                doc.line(
                                    margin + 15,
                                    yPosition,
                                    pageWidth - margin,
                                    yPosition,
                                );
                                yPosition += 6;
                            }
                        });
                    }

                    // Separator between simulators within the same macro
                    if (simIndex < simulatorNamesInMacro.length - 1) {
                        checkPageBreak(12);
                        yPosition += 8;
                        doc.setLineWidth(0.3);
                        doc.setDrawColor(180, 180, 180);
                        doc.line(
                            margin + 10,
                            yPosition,
                            pageWidth - margin,
                            yPosition,
                        );
                        yPosition += 12;
                    }
                });
            } // Close else block for SIMXXI and S3000

            // Bold separator between macro-simulators
            if (macroIndex < macroSimulatorNames.length - 1) {
                checkPageBreak(15);
                yPosition += 10;
                doc.setLineWidth(0.8);
                doc.setDrawColor(100, 100, 100);
                doc.line(margin, yPosition, pageWidth - margin, yPosition);
                yPosition += 15;
            }
        });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" },
        );
    }

    // Save the PDF
    const fileName = date
        ? `Daily_Report_${formatDate(date).replace(/\//g, "-")}.pdf`
        : `Daily_Report_${new Date().getTime()}.pdf`;
    doc.save(fileName);

    return tasksForExport.length;
};
