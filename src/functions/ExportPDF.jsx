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
 * Exports tasks for a specific date to a PDF file
 * @param {Array} tasks - Array of task objects
 * @param {Date} date - The date to filter tasks by
 */
export const exportTasksToPDF = (tasks, date) => {
    // Filter tasks for the specific date
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const tasksForDay = tasks.filter((task) => {
        if (!task.DATE) return false;
        const taskDate = new Date(task.DATE);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === selectedDate.getTime();
    });

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

    // Date
    yPosition += lineHeight;
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text(`Data: ${formatDate(selectedDate)}`, margin, yPosition);

    yPosition += lineHeight;
    doc.setFontSize(10);
    doc.text(`Totale tasks: ${tasksForDay.length}`, margin, yPosition);

    // Line separator
    yPosition += 5;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // If no tasks
    if (tasksForDay.length === 0) {
        doc.setFontSize(11);
        doc.text("Nessuna task trovata per questa data.", margin, yPosition);
    } else {
        // Task list
        tasksForDay.forEach((task, index) => {
            // Check if we need a new page
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

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
                    pageWidth - 2 * margin
                );
                doc.text(descLines, margin + 5, yPosition);
                yPosition += descLines.length * 5;
            }

            // Assigned To
            if (task.ASSIGNED_TO) {
                doc.text(
                    `Assegnato a: ${task.ASSIGNED_TO}`,
                    margin + 5,
                    yPosition
                );
                yPosition += 5;
            }

            // Status
            if (task.STATUS) {
                doc.text(`Stato: ${task.STATUS}`, margin + 5, yPosition);
                yPosition += 5;
            }

            // Priority
            if (task.PRIORITY) {
                doc.text(`Priorità: ${task.PRIORITY}`, margin + 5, yPosition);
                yPosition += 5;
            }

            // Time
            if (task.START_TIME || task.END_TIME) {
                const timeStr = `Orario: ${task.START_TIME || "N/A"} - ${
                    task.END_TIME || "N/A"
                }`;
                doc.text(timeStr, margin + 5, yPosition);
                yPosition += 5;
            }

            // Simulator
            if (task.SIMULATOR) {
                doc.text(
                    `Simulatore: ${task.SIMULATOR}`,
                    margin + 5,
                    yPosition
                );
                yPosition += 5;
            }

            // Separator between tasks
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
            { align: "center" }
        );
    }

    // Save the PDF
    const fileName = `Tasks_${formatDate(selectedDate).replace(
        /\//g,
        "-"
    )}.pdf`;
    doc.save(fileName);

    return tasksForDay.length;
};
