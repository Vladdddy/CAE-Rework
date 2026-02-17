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
 */
export const exportTasksToPDF = (
    tasks,
    date = null,
    simulators = [],
    title = "Report Giornaliero",
    notesMap = {},
    users = [],
) => {
    // Use the tasks as-is (already filtered by the calling component)
    const tasksForExport = tasks;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const lineHeight = 10;
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
    doc.text(title, margin, yPosition);

    // Date
    yPosition += lineHeight;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    if (date) {
        doc.text(`Data: ${formatDate(date)}`, margin, yPosition);
    }

    // Line separator
    yPosition += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Group tasks by simulator
    const tasksBySimulator = {};
    tasksForExport.forEach((task) => {
        const simName = task.SIMULATOR || "Nessun Simulatore";
        if (!tasksBySimulator[simName]) {
            tasksBySimulator[simName] = [];
        }
        tasksBySimulator[simName].push(task);
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

    // Sort simulator names
    const simulatorNames = Object.keys(tasksBySimulator).sort();

    // If no tasks and no simulators
    if (simulatorNames.length === 0) {
        doc.setFontSize(10);
        doc.text("Nessuna task trovata.", margin, yPosition);
    } else {
        // Loop through each simulator
        simulatorNames.forEach((simName, simIndex) => {
            const simTasks = tasksBySimulator[simName];

            checkPageBreak(40);

            // Simulator header
            doc.setFontSize(12);
            doc.setFont(undefined, "bold");
            doc.setTextColor(0, 102, 204);
            doc.text(simName, margin, yPosition);

            // Simulator details inline (if available)
            const sim = simulatorMap[simName];
            if (sim) {
                doc.setFontSize(9);
                doc.setFont(undefined, "normal");
                doc.setTextColor(0, 102, 204);
                const simDetails = `  -  Orario fine: ${formatTime(sim.END_HOUR)}   Orario inizio: ${formatTime(sim.START_HOUR)}   Assegnato a: ${sim.ASSIGNED_TO || "N/A"}`;
                doc.text(
                    simDetails,
                    margin + doc.getTextWidth(simName) + 5,
                    yPosition,
                );
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
                doc.text("Nessuna task assegnata", margin + 10, yPosition);
                yPosition += 10;
            } else {
                simTasks.forEach((task, index) => {
                    checkPageBreak(30);

                    // Determine if this is a logbook or task
                    const isLogbook =
                        task.ISLOGBOOK === true || task.ISLOGBOOK === 1;
                    const typeLabel = isLogbook ? "Logbook" : "Task";

                    // Type and Name with Assigned To inline
                    doc.setFontSize(10);
                    doc.setFont(undefined, "bold");
                    if (isLogbook) {
                        doc.setTextColor(255, 140, 0); // Orange for logbooks
                    } else {
                        doc.setTextColor(0, 102, 204); // Blue for tasks
                    }
                    const taskTitle = `${typeLabel}: ${task.TITLE || "N/A"}`;
                    doc.text(taskTitle, margin + 10, yPosition);

                    // Assigned To inline
                    doc.setFontSize(9);
                    doc.setFont(undefined, "normal");
                    doc.setTextColor(0, 0, 0);
                    const assignedText = ` (Assegnato a: ${task.ASSIGNED_TO || "N/A"})`;
                    // Calculate width with the bold font size
                    doc.setFontSize(10);
                    doc.setFont(undefined, "bold");
                    const titleWidth = doc.getTextWidth(taskTitle);
                    doc.setFontSize(9);
                    doc.setFont(undefined, "normal");
                    doc.text(assignedText, margin + 10 + titleWidth, yPosition);

                    yPosition += 8;

                    // Status with color coding
                    doc.setFontSize(9);
                    doc.setFont(undefined, "bold");
                    const status = task.STATUS || "N/A";
                    const isCompleted = status === "Completato";
                    if (isCompleted) {
                        doc.setTextColor(0, 128, 0); // Green for "Completato"
                    } else {
                        doc.setTextColor(255, 0, 0); // Red for other statuses
                    }
                    doc.text(`Stato: ${status}`, margin + 15, yPosition);
                    yPosition += 6;

                    doc.setFontSize(10);
                    doc.setFont(undefined, "normal");
                    doc.setTextColor(0, 0, 0);

                    // Description
                    if (task.DESCRIPTION) {
                        const descLines = doc.splitTextToSize(
                            `${task.DESCRIPTION}`,
                            pageWidth - 2 * margin - 10,
                        );
                        checkPageBreak(descLines.length * 5);
                        doc.text(descLines, margin + 15, yPosition);
                        yPosition += descLines.length * 5;
                    }

                    // Notes (excluding system notes)
                    const taskNotes = (notesMap[task.ID] || []).filter(
                        (note) => note.TYPE !== "automatico",
                    );
                    if (taskNotes.length > 0) {
                        yPosition += 4;
                        checkPageBreak(10);

                        doc.setFontSize(9);
                        doc.setFont(undefined, "bold");
                        doc.setTextColor(0, 102, 204);
                        doc.text("Note", margin + 15, yPosition);
                        yPosition += 4;

                        taskNotes.forEach((note) => {
                            checkPageBreak(15);

                            // Note author and description
                            doc.setFontSize(8);
                            doc.setFont(undefined, "bold");
                            doc.setTextColor(0, 102, 204);
                            const authorName = getUsernameById(
                                note.CREATEDBY,
                                users,
                            );
                            doc.text(`${authorName}:`, margin + 20, yPosition);
                            yPosition += 4;

                            // Note description
                            doc.setFontSize(8);
                            doc.setFont(undefined, "normal");
                            doc.setTextColor(100, 100, 100);
                            const noteLines = doc.splitTextToSize(
                                note.DESCRIPTION || "",
                                pageWidth - 2 * margin - 15,
                            );
                            checkPageBreak(noteLines.length * 4);
                            doc.text(noteLines, margin + 20, yPosition);
                            yPosition += noteLines.length * 4 + 3;
                        });
                    }

                    // Light separator between tasks
                    if (index < simTasks.length - 1) {
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

            // Bold separator between simulators
            if (simIndex < simulatorNames.length - 1) {
                checkPageBreak(12);
                yPosition += 8;
                doc.setLineWidth(0.5);
                doc.setDrawColor(150, 150, 150);
                doc.line(margin, yPosition, pageWidth - margin, yPosition);
                yPosition += 12;
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
            `Pagina ${i} di ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" },
        );
    }

    // Save the PDF
    const fileName = date
        ? `Report_Giornaliero_${formatDate(date).replace(/\//g, "-")}.pdf`
        : `Report_Giornaliero_${new Date().getTime()}.pdf`;
    doc.save(fileName);

    return tasksForExport.length;
};
