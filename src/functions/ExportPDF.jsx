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
 * Exports tasks to a PDF file grouped by simulator
 * @param {Array} tasks - Array of task objects (can be pre-filtered)
 * @param {Date} date - The date for the report title (optional, null if using filters)
 * @param {Array} simulators - Array of simulator objects for today (optional)
 */
export const exportTasksToPDF = (tasks, date = null, simulators = []) => {
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
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("Report Giornaliero", margin, yPosition);

    // Date
    yPosition += lineHeight;
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    if (date) {
        doc.text(`Data: ${formatDate(date)}`, margin, yPosition);
    }

    // Line separator
    yPosition += 8;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

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
        });
    }

    // Sort simulator names
    const simulatorNames = Object.keys(tasksBySimulator).sort();

    // If no tasks
    if (simulatorNames.length === 0) {
        doc.setFontSize(12);
        doc.text("Nessuna task trovata.", margin, yPosition);
    } else {
        // Loop through each simulator
        simulatorNames.forEach((simName, simIndex) => {
            const simTasks = tasksBySimulator[simName];

            // Skip if no tasks for this simulator
            if (simTasks.length === 0) {
                return;
            }

            checkPageBreak(30);

            // Simulator header
            doc.setFontSize(14);
            doc.setFont(undefined, "bold");
            doc.setTextColor(0, 102, 204);
            doc.text(simName, margin, yPosition);
            doc.setTextColor(0, 0, 0);
            yPosition += 7;

            // Simulator details (if available)
            doc.setFontSize(12);
            doc.setFont(undefined, "normal");

            const sim = simulatorMap[simName];
            if (sim) {
                checkPageBreak(15);
                doc.text(
                    `Orario fine: ${formatTime(sim.START_HOUR)}`,
                    margin + 5,
                    yPosition,
                );
                yPosition += 5;

                checkPageBreak(5);
                doc.text(
                    `Orario inizio: ${formatTime(sim.END_HOUR)}`,
                    margin + 5,
                    yPosition,
                );
                yPosition += 5;

                checkPageBreak(5);
                doc.text(
                    `Assegnato a: ${sim.ASSIGNED_TO || "N/A"}`,
                    margin + 5,
                    yPosition,
                );
                yPosition += 5;
            }

            yPosition += 3;

            // Tasks for this simulator
            simTasks.forEach((task, index) => {
                checkPageBreak(30);

                // Determine if this is a logbook or task
                const isLogbook =
                    task.ISLOGBOOK === true || task.ISLOGBOOK === 1;
                const typeLabel = isLogbook ? "Logbook" : "Task";

                // Type and Name
                doc.setFontSize(12);
                doc.setFont(undefined, "bold");
                if (isLogbook) {
                    doc.setTextColor(255, 140, 0); // Orange for logbooks
                } else {
                    doc.setTextColor(0, 102, 204); // Blue for tasks
                }
                doc.text(
                    `${typeLabel}: ${task.TITLE || "N/A"}`,
                    margin + 10,
                    yPosition,
                );
                doc.setTextColor(0, 0, 0);
                yPosition += 6;

                doc.setFontSize(12);
                doc.setFont(undefined, "normal");

                // Description
                if (task.DESCRIPTION) {
                    const descLines = doc.splitTextToSize(
                        `Descrizione: ${task.DESCRIPTION}`,
                        pageWidth - 2 * margin - 10,
                    );
                    checkPageBreak(descLines.length * 4);
                    doc.text(descLines, margin + 15, yPosition);
                    yPosition += descLines.length * 4;
                }

                // Assigned To
                checkPageBreak(4);
                doc.text(
                    `Assegnato a: ${task.ASSIGNED_TO || "N/A"}`,
                    margin + 15,
                    yPosition,
                );
                yPosition += 4;

                // Status
                checkPageBreak(4);
                doc.text(
                    `Stato: ${task.STATUS || "N/A"}`,
                    margin + 15,
                    yPosition,
                );
                yPosition += 4;

                // Date
                checkPageBreak(4);
                doc.text(
                    `Data: ${formatDate(task.DATE)}`,
                    margin + 15,
                    yPosition,
                );
                yPosition += 4;

                // Light separator between tasks
                if (index < simTasks.length - 1) {
                    checkPageBreak(6);
                    yPosition += 2;
                    doc.setLineWidth(0.1);
                    doc.setDrawColor(220, 220, 220);
                    doc.line(
                        margin + 10,
                        yPosition,
                        pageWidth - margin,
                        yPosition,
                    );
                    yPosition += 4;
                }
            });

            // Bold separator between simulators
            if (simIndex < simulatorNames.length - 1) {
                checkPageBreak(10);
                yPosition += 5;
                doc.setLineWidth(0.5);
                doc.setDrawColor(150, 150, 150);
                doc.line(margin, yPosition, pageWidth - margin, yPosition);
                yPosition += 10;
            }
        });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(12);
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
