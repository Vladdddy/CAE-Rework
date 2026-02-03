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
 * Exports tasks to a PDF file
 * @param {Array} tasks - Array of task objects (can be pre-filtered)
 * @param {Date} date - The date for the report title (optional, null if using filters)
 */
export const exportTasksToPDF = (tasks, date = null) => {
    // Use the tasks as-is (already filtered by the calling component)
    const tasksForExport = tasks;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const lineHeight = 10;
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("Task Report", margin, yPosition);

    // Date or Filter info
    yPosition += lineHeight;
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    if (date) {
        doc.text(`Data: ${formatDate(date)}`, margin, yPosition);
    } else {
        doc.text("Report Filtrato", margin, yPosition);
    }

    yPosition += lineHeight;
    doc.setFontSize(10);
    doc.text(`Totale tasks: ${tasksForExport.length}`, margin, yPosition);

    // Line separator
    yPosition += 5;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // If no tasks
    if (tasksForExport.length === 0) {
        doc.setFontSize(11);
        doc.text("Nessuna task trovata.", margin, yPosition);
    } else {
        // Task list
        tasksForExport.forEach((task, index) => {
            // Helper function to check and add new page if needed
            const checkPageBreak = (requiredSpace = 10) => {
                if (yPosition + requiredSpace > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
            };

            // Check if we need a new page for task header
            checkPageBreak(20);

            doc.setFontSize(12);
            doc.setFont(undefined, "bold");
            doc.text(`${index + 1}. ${task.TITLE || "N/A"}`, margin, yPosition);

            yPosition += lineHeight - 2;
            doc.setFontSize(10);
            doc.setFont(undefined, "normal");

            // Description
            if (task.DESCRIPTION) {
                const descLines = doc.splitTextToSize(
                    `Descrizione: ${task.DESCRIPTION}`,
                    pageWidth - 2 * margin,
                );
                checkPageBreak(descLines.length * 5);
                doc.text(descLines, margin + 5, yPosition);
                yPosition += descLines.length * 5;
            }

            // Assigned To
            if (task.ASSIGNED_TO) {
                checkPageBreak(5);
                doc.text(
                    `Assegnato a: ${task.ASSIGNED_TO}`,
                    margin + 5,
                    yPosition,
                );
                yPosition += 5;
            }

            // Status
            if (task.STATUS) {
                checkPageBreak(5);
                doc.text(`Stato: ${task.STATUS}`, margin + 5, yPosition);
                yPosition += 5;
            }

            // Priority
            if (task.PRIORITY) {
                checkPageBreak(5);
                doc.text(`Priorità: ${task.PRIORITY}`, margin + 5, yPosition);
                yPosition += 5;
            }

            // Time
            if (task.START_TIME || task.END_TIME) {
                checkPageBreak(5);
                const timeStr = `Orario: ${task.START_TIME || "N/A"} - ${
                    task.END_TIME || "N/A"
                }`;
                doc.text(timeStr, margin + 5, yPosition);
                yPosition += 5;
            }

            // Simulator
            if (task.SIMULATOR) {
                checkPageBreak(5);
                doc.text(
                    `Simulatore: ${task.SIMULATOR}`,
                    margin + 5,
                    yPosition,
                );
                yPosition += 5;
            }

            // Date
            if (task.DATE) {
                checkPageBreak(5);
                doc.text(
                    `Data: ${formatDate(task.DATE)}`,
                    margin + 5,
                    yPosition,
                );
                yPosition += 5;
            }

            // Separator between tasks
            checkPageBreak(10);
            yPosition += 5;
            doc.setLineWidth(0.2);
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
        });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, "normal");
        doc.text(
            `Pagina ${i} di ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" },
        );
    }

    // Save the PDF
    const fileName = date
        ? `Tasks_${formatDate(date).replace(/\//g, "-")}.pdf`
        : `Tasks_Filtered_${new Date().getTime()}.pdf`;
    doc.save(fileName);

    return tasksForExport.length;
};
