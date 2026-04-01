import React, { useState, useMemo, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.tsx";
import TaskIcon from "../../assets/icons/tasks.tsx";
import { GetSimulatorsList } from "../../functions/Simulators.jsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import DayIcon from "../../assets/icons/day.tsx";
import NightIcon from "../../assets/icons/night.tsx";
import UserIcon from "../../assets/icons/user.tsx";
import { useTasks } from "../data/provider/taskAPI/useTasks.js";
import { useLogbooks } from "../data/provider/logbookAPI/useLogbooks.js";
import { useUsers } from "../data/provider/userAPI/useUsers.js";
import { useEmployeeShifts } from "../data/provider/employeeShiftsAPI/useEmployeeShifts.js";
import { useNotes } from "../data/provider/noteAPI/useNotes.js";
import { useNoteLogbooks } from "../data/provider/noteLogbookAPI/useNoteLogbooks.js";
import { useImageTasks } from "../data/provider/imageTaskAPI/useImageTasks.js";
import { useImageLogbooks } from "../data/provider/imageLogbookAPI/useImageLogbooks.js";
import { useUnavailableTasks } from "../data/provider/unavailableTaskAPI/useUnavailableTasks.js";
import { useUnavailableLogbooks } from "../data/provider/unavailableLogbookAPI/useUnavailableLogbooks.js";

function ModifyModal({
    onClose,
    onSuccess,
    task,
    isConverting = false,
    isDuplicating = false,
    isRescheduling = false,
}) {
    const [selectedCategory, setSelectedCategory] = useState(
        task.CATEGORY || "Routine Task",
    );
    const [selectedStatus, setSelectedStatus] = useState(
        task.STATUS || "Da definire",
    );
    const [selectedRadio, setSelectedRadio] = useState(task.TIME || "Diurno");
    const [selectedAssignees, setSelectedAssignees] = useState(
        isDuplicating
            ? []
            : task.ASSIGNED_TO
              ? typeof task.ASSIGNED_TO === "string"
                  ? task.ASSIGNED_TO.split(", ").filter((name) => name.trim())
                  : task.ASSIGNED_TO
              : [],
    );
    const [title, setTitle] = useState(task.TITLE || "");
    const [description, setDescription] = useState(task.DESCRIPTION || "");
    const [selectedSubCategory, setSelectedSubCategory] = useState(
        task.SUBCATEGORY || "PM",
    );
    const [selectedDetail, setSelectedDetail] = useState(
        task.EXTRADETAIL || "VISUAL",
    );
    const [selectedDate, setSelectedDate] = useState(
        task.DATE
            ? task.DATE.split("T")[0]
            : new Date().toISOString().split("T")[0],
    );
    const [titleError, setTitleError] = useState(false);
    const [importNotes, setImportNotes] = useState("No");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [attachmentError, setAttachmentError] = useState("");
    const { createNote, fetchNotes, notes } = useNotes();
    const { createNoteLogbook, fetchNoteLogbooks, noteLogbooks } =
        useNoteLogbooks();
    // eslint-disable-next-line no-unused-vars
    const [noteDescription, setNoteDescription] = useState("");
    const simulators = GetSimulatorsList();
    const [selectedSimulator, setSelectedSimulator] = useState(
        task.SIMULATOR || simulators[0],
    );
    const { updateTask, addTask } = useTasks();
    const { addTask: addUnavailableTask, fetchTasks: fetchUnavailableTasks } =
        useUnavailableTasks();
    const {
        addLogbook: addUnavailableLogbook,
        fetchLogbooks: fetchUnavailableLogbooks,
    } = useUnavailableLogbooks();
    const { updateLogbook, addLogbook } = useLogbooks();
    const { uploadTaskImages } = useImageTasks();
    const { uploadLogbookImages } = useImageLogbooks();
    const { users, currentUserId } = useUsers();
    const { employeeShifts } = useEmployeeShifts();

    const isAttachmentUploadEnabled = true;
    const { currentUserRole } = useUsers();

    // Filter users based on selected date and shift.
    const filteredUsers = useMemo(() => {
        const dayShifts = ["O", "OP", "D"];
        const nightShifts = ["ON", "N", "OP"];

        return users.filter((user) => {
            const userShift = employeeShifts.find(
                (shift) =>
                    shift.EMPLOYEE_ID === user.ID &&
                    shift.SELECTED_DATE &&
                    shift.SELECTED_DATE.split("T")[0] === selectedDate,
            );

            if (!userShift) {
                return false;
            }

            const shiftType = userShift.SHIFT_TYPE;

            if (selectedRadio === "Diurno") {
                return dayShifts.includes(shiftType);
            }

            if (selectedRadio === "Notturno") {
                return nightShifts.includes(shiftType);
            }

            return true;
        });
    }, [users, employeeShifts, selectedDate, selectedRadio]);

    // Fetch notes when duplicating
    useEffect(() => {
        if (isDuplicating && task.ID) {
            if (task.ISLOGBOOK) {
                fetchNoteLogbooks(task.ID);
            } else {
                fetchNotes(task.ID);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDuplicating, task.ID, task.ISLOGBOOK]);

    useEffect(() => {
        if (isRescheduling) {
            setSelectedStatus(task.STATUS || "Da definire");
        }
    }, [isRescheduling, task.STATUS]);

    useEffect(() => {
        if (isConverting && task.ISLOGBOOK) {
            setSelectedStatus("Convertito in task");
        }
    }, [isConverting, task.ISLOGBOOK]);

    // Check if any changes have been made
    const hasChanges = useMemo(() => {
        const originalAssignees = task.ASSIGNED_TO
            ? typeof task.ASSIGNED_TO === "string"
                ? task.ASSIGNED_TO.split(", ").filter((name) => name.trim())
                : task.ASSIGNED_TO
            : [];

        const originalDate = task.DATE ? task.DATE.split("T")[0] : "";

        return (
            selectedCategory !== (task.CATEGORY || "Routine Task") ||
            selectedStatus !== (task.STATUS || "Da definire") ||
            selectedRadio !== (task.TIME || "Diurno") ||
            JSON.stringify(selectedAssignees.sort()) !==
                JSON.stringify(originalAssignees.sort()) ||
            title !== (task.TITLE || "") ||
            description !== (task.DESCRIPTION || "") ||
            selectedSubCategory !== (task.SUBCATEGORY || "PM") ||
            selectedDetail !== (task.EXTRADETAIL || "VISUAL") ||
            selectedDate !== originalDate ||
            selectedSimulator !== (task.SIMULATOR || simulators[0]) ||
            selectedFiles.length > 0
        );
    }, [
        selectedCategory,
        selectedStatus,
        selectedRadio,
        selectedAssignees,
        title,
        description,
        selectedSubCategory,
        selectedDetail,
        selectedDate,
        selectedSimulator,
        selectedFiles.length,
        task,
        simulators,
    ]);

    const handleRadioChange = (event) => {
        setSelectedRadio(event.target.value);
    };

    const handleCheckboxChange = (name) => {
        setSelectedAssignees((prev) =>
            prev.includes(name)
                ? prev.filter((item) => item !== name)
                : [...prev, name],
        );
    };

    const handleFilesChange = (event) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);
        setAttachmentError("");
    };

    const uploadAttachments = async (entityId, isLogbookTarget) => {
        if (!selectedFiles.length) {
            return { success: true };
        }

        const result = isLogbookTarget
            ? await uploadLogbookImages(entityId, selectedFiles)
            : await uploadTaskImages(entityId, selectedFiles);

        if (!result.success) {
            setAttachmentError(
                isLogbookTarget
                    ? "L'entry e' stata salvata, ma il caricamento degli allegati non e' riuscito."
                    : "La task e' stata salvata, ma il caricamento degli allegati non e' riuscito.",
            );
        }

        return result;
    };

    const generateChangeMessage = () => {
        const changes = [];
        const taskType = task.ISLOGBOOK ? "entry" : "task";

        // Check assigned users change
        const originalAssignees = task.ASSIGNED_TO
            ? typeof task.ASSIGNED_TO === "string"
                ? task.ASSIGNED_TO.split(", ").filter((name) => name.trim())
                : task.ASSIGNED_TO
            : [];
        const newAssignees = selectedAssignees;

        if (
            JSON.stringify(originalAssignees.sort()) !==
            JSON.stringify(newAssignees.sort())
        ) {
            const fromUsers =
                originalAssignees.length > 0
                    ? `"${originalAssignees.join('", "')}"`
                    : "nessuno";
            const toUsers =
                newAssignees.length > 0
                    ? `"${newAssignees.join('", "')}"`
                    : "nessuno";
            changes.push(
                `riassegnato la ${taskType} da ${fromUsers} a ${toUsers}`,
            );
        }

        // Check date change
        const originalDate = task.DATE ? task.DATE.split("T")[0] : "";
        if (originalDate !== selectedDate) {
            const formatDate = (dateStr) => {
                const [year, month, day] = dateStr.split("-");
                return `${year}/${month}/${day}`;
            };
            changes.push(
                `cambiato la data da ${formatDate(originalDate)} a ${formatDate(selectedDate)}`,
            );
        }

        // Check time/shift change
        if (task.TIME !== selectedRadio) {
            changes.push(
                `cambiato il turno da "${task.TIME}" a "${selectedRadio}"`,
            );
        }

        // Check status change
        if (task.STATUS !== selectedStatus) {
            changes.push(
                `cambiato lo stato da "${task.STATUS}" a "${selectedStatus}"`,
            );
        }

        // Check title change
        if (task.TITLE !== title) {
            changes.push(`cambiato il titolo da "${task.TITLE}" a "${title}"`);
        }

        // Check description change
        if (task.DESCRIPTION !== description) {
            changes.push(`modificato la descrizione`);
        }

        // Check category change
        if (task.CATEGORY !== selectedCategory) {
            changes.push(
                `cambiato la categoria da "${task.CATEGORY}" a "${selectedCategory}"`,
            );
        }

        // Check subcategory change
        if (task.SUBCATEGORY !== selectedSubCategory) {
            changes.push(
                `cambiato la sotto-categoria da "${task.SUBCATEGORY}" a "${selectedSubCategory}"`,
            );
        }

        // Check extradetail change
        if (task.EXTRADETAIL !== selectedDetail) {
            changes.push(
                `cambiato il dettaglio extra da "${task.EXTRADETAIL}" a "${selectedDetail}"`,
            );
        }

        // Check simulator change
        if (task.SIMULATOR !== selectedSimulator) {
            changes.push(
                `cambiato il simulatore da "${task.SIMULATOR}" a "${selectedSimulator}"`,
            );
        }

        if (changes.length === 0) {
            return `Ha modificato la ${taskType}`;
        } else if (changes.length === 1) {
            return `Ha ${changes[0]}`;
        } else {
            // Capitalize first letter
            const firstChange =
                changes[0].charAt(0).toUpperCase() + changes[0].slice(1);
            return `Ha ${firstChange}, ${changes.slice(1).join(", ")}`;
        }
    };

    const handleModify = async () => {
        console.log(`Modifying task with ID: ${task.ID}`);
        setAttachmentError("");

        const isLogbook = task.ISLOGBOOK;

        if (!title.trim()) {
            setTitleError(true);
            return;
        }

        setTitleError(false);
        const todayDate = new Date().toISOString().split("T")[0];
        const originalTaskDate = task.DATE ? task.DATE.split("T")[0] : "";
        const now = new Date();
        const passedCompletedCutoff =
            now.getHours() > 8 || now.getHours() === 8;
        const shouldMoveCompletedTaskToToday =
            !task.ISLOGBOOK &&
            selectedStatus === "Completato" &&
            originalTaskDate &&
            originalTaskDate !== todayDate &&
            passedCompletedCutoff;

        const shouldMoveCompletedLogbookToToday =
            task.ISLOGBOOK &&
            selectedStatus === "Completato" &&
            originalTaskDate &&
            originalTaskDate !== todayDate;

        const modifiedTask = {
            title: title,
            description: description,
            category: selectedCategory,
            subcategory: selectedSubCategory,
            extradetail: selectedDetail,
            simulator: selectedSimulator,
            date:
                shouldMoveCompletedTaskToToday ||
                shouldMoveCompletedLogbookToToday
                    ? todayDate
                    : selectedDate,
            time: selectedRadio,
            assigned_to: selectedAssignees.join(", ") || null,
            status:
                isConverting && isLogbook
                    ? "Convertito in task"
                    : selectedStatus,
        };

        // Handle task duplication or rescheduling
        if (isDuplicating) {
            const isLogbook = task.ISLOGBOOK;

            // If rescheduling, update original task instead of creating a new one
            if (isRescheduling && !isLogbook) {
                const updateResult = await updateTask(task.ID, modifiedTask);

                if (updateResult.success) {
                    // Create unavailable task on original date
                    const originalTaskDate = task.DATE
                        ? task.DATE.split("T")[0]
                        : "";
                    const unavailableTaskPayload = {
                        title: task.TITLE,
                        description: task.DESCRIPTION,
                        category: task.CATEGORY,
                        subcategory: task.SUBCATEGORY,
                        extradetail: task.EXTRADETAIL,
                        simulator: task.SIMULATOR,
                        date: originalTaskDate,
                        time: task.TIME,
                        assigned_to: task.ASSIGNED_TO,
                        status: "Rischedulato",
                        type: "Unavailable",
                        isFlagged: 0,
                        original_task_id: task.ID,
                    };

                    const unavailableResult = await addUnavailableTask(
                        unavailableTaskPayload,
                    );

                    if (!unavailableResult.success) {
                        onClose();
                        if (onSuccess) {
                            onSuccess(
                                false,
                                `Task "${title}" rischedulata ma creazione unavailable non riuscita`,
                            );
                        }
                        return;
                    }

                    const automaticNoteResult = await createNote(
                        task.ID,
                        currentUserId,
                        "Ha rischedulato la task",
                        "automatico",
                    );

                    await fetchUnavailableTasks();

                    onClose();
                    if (onSuccess) {
                        onSuccess(
                            true,
                            automaticNoteResult.success
                                ? `${isLogbook ? "Entry" : "Task"} "${title}" rischedulata con successo`
                                : `${isLogbook ? "Entry" : "Task"} "${title}" rischedulata, ma la nota automatica non e' stata salvata`,
                        );
                    }
                    return;
                } else {
                    onClose();
                    if (onSuccess) {
                        onSuccess(
                            false,
                            `Errore nella rischedulazione ${isLogbook ? "dell'entry" : "della task"}`,
                        );
                    }
                    return;
                }
            }

            // Normal duplication flow (non-rescheduling)
            const createResult = isLogbook
                ? await addLogbook(modifiedTask)
                : await addTask(modifiedTask);

            if (createResult.success) {
                const createdEntityId =
                    createResult.data?.id ??
                    createResult.data?.ID ??
                    createResult.data?.insertId;
                let attachmentsUploadedSuccessfully = true;

                if (createdEntityId && selectedFiles.length > 0) {
                    const uploadResult = await uploadAttachments(
                        createdEntityId,
                        isLogbook,
                    );
                    attachmentsUploadedSuccessfully = uploadResult.success;
                }

                // Copy notes if user selected "Si"
                if (importNotes === "Si") {
                    const newTaskId = createdEntityId;

                    if (newTaskId) {
                        // Get the appropriate notes array based on task type
                        const notesToCopy = isLogbook ? noteLogbooks : notes;

                        // Filter only "creato" type notes
                        const creatoNotes =
                            notesToCopy?.filter(
                                (note) => note.TYPE === "creato",
                            ) || [];

                        // Copy each "creato" note to the new task
                        for (const note of creatoNotes) {
                            if (isLogbook) {
                                await createNoteLogbook(
                                    newTaskId,
                                    note.CREATEDBY,
                                    note.DESCRIPTION,
                                    "creato",
                                );
                            } else {
                                await createNote(
                                    newTaskId,
                                    note.CREATEDBY,
                                    note.DESCRIPTION,
                                    "creato",
                                );
                            }
                        }
                    }
                }

                onClose();

                if (onSuccess) {
                    onSuccess(
                        createResult.success,
                        createResult.success
                            ? selectedFiles.length > 0 &&
                              !attachmentsUploadedSuccessfully
                                ? `${isLogbook ? "Entry" : "Task"} "${title}" duplicata, ma uno o piu' allegati non sono stati caricati`
                                : `${isLogbook ? "Entry" : "Task"} "${title}" duplicata con successo`
                            : `Errore nella duplicazione ${isLogbook ? "dell'entry" : "della task"}`,
                    );
                }
                return;
            } else {
                onClose();
                if (onSuccess) {
                    onSuccess(
                        false,
                        `Errore nella duplicazione ${isLogbook ? "dell'entry" : "della task"}`,
                    );
                }
                return;
            }
        }

        // Handle conversion from logbook to task
        if (isConverting && isLogbook) {
            // Create a new task with the logbook data
            const createResult = await addTask(modifiedTask);

            if (createResult.success) {
                const createdTaskId =
                    createResult.data?.id ??
                    createResult.data?.ID ??
                    createResult.data?.insertId;
                let attachmentsUploadedSuccessfully = true;

                if (createdTaskId && selectedFiles.length > 0) {
                    const uploadResult = await uploadAttachments(
                        createdTaskId,
                        false,
                    );
                    attachmentsUploadedSuccessfully = uploadResult.success;
                }

                // Delete the original logbook
                //const deleteResult = await deleteLogbook(task.ID);

                onClose();

                if (onSuccess) {
                    onSuccess(
                        createResult.success,
                        createResult.success
                            ? selectedFiles.length > 0 &&
                              !attachmentsUploadedSuccessfully
                                ? `Entry "${title}" convertita in Task, ma uno o piu' allegati non sono stati caricati`
                                : `Entry "${title}" convertita in Task con successo`
                            : "Errore durante la conversione in Task",
                    );
                }
                return;
            } else {
                onClose();
                if (onSuccess) {
                    onSuccess(false, "Errore durante la creazione della Task");
                }
                return;
            }
        }

        // Normal modification flow
        const result = isLogbook
            ? await updateLogbook(task.ID, modifiedTask)
            : await updateTask(task.ID, modifiedTask);

        let attachmentsUploadedSuccessfully = true;

        if (result.success) {
            if (shouldMoveCompletedTaskToToday) {
                const unavailableTaskPayload = {
                    title: task.TITLE,
                    description: task.DESCRIPTION,
                    category: task.CATEGORY,
                    subcategory: task.SUBCATEGORY,
                    extradetail: task.EXTRADETAIL,
                    simulator: task.SIMULATOR,
                    date: originalTaskDate,
                    time: task.TIME,
                    assigned_to: task.ASSIGNED_TO,
                    status: "Rischedulato",
                    type: "Unavailable",
                    isFlagged: 0,
                    original_task_id: task.ID,
                };

                const unavailableResult = await addUnavailableTask(
                    unavailableTaskPayload,
                );

                if (!unavailableResult.success) {
                    onClose();
                    if (onSuccess) {
                        onSuccess(
                            false,
                            "Task completata ma creazione unavailable non riuscita",
                        );
                    }
                    return;
                }

                await fetchUnavailableTasks();
            }

            if (shouldMoveCompletedLogbookToToday) {
                const unavailableLogbookPayload = {
                    title: task.TITLE,
                    description: task.DESCRIPTION,
                    category: task.CATEGORY,
                    subcategory: task.SUBCATEGORY,
                    extradetail: task.EXTRADETAIL,
                    simulator: task.SIMULATOR,
                    date: originalTaskDate,
                    time: task.TIME,
                    assigned_to: task.ASSIGNED_TO,
                    status: "Rischedulato",
                    type: "Unavailable",
                    isLogbook: true,
                    original_logbook_id: task.ID,
                };

                const unavailableResult = await addUnavailableLogbook(
                    unavailableLogbookPayload,
                );

                if (!unavailableResult.success) {
                    onClose();
                    if (onSuccess) {
                        onSuccess(
                            false,
                            "Entry completata ma creazione unavailable non riuscita",
                        );
                    }
                    return;
                }

                await fetchUnavailableLogbooks();
            }

            const changeMessage = generateChangeMessage();
            const changedTaskNote = isLogbook
                ? await createNoteLogbook(
                      task.ID,
                      currentUserId,
                      changeMessage,
                      "automatico",
                  )
                : await createNote(
                      task.ID,
                      currentUserId,
                      changeMessage,
                      "automatico",
                  );

            if (changedTaskNote.success) {
                setNoteDescription("");
            }

            if (selectedFiles.length > 0) {
                const uploadResult = await uploadAttachments(
                    task.ID,
                    isLogbook,
                );
                attachmentsUploadedSuccessfully = uploadResult.success;
            }
        }

        console.log("Passing modified task:", modifiedTask);

        onClose();

        if (onSuccess) {
            onSuccess(
                result.success,
                result.success
                    ? selectedFiles.length > 0 &&
                      !attachmentsUploadedSuccessfully
                        ? `Hai modificato la ${isLogbook ? "entry" : "task"}, ma uno o piu' allegati non sono stati caricati`
                        : `Hai modificato la ${isLogbook ? "entry" : "task"} con successo`
                    : "Errore durante la modifica della task",
            );
        }
    };

    const categories = {
        "Routine Task": [
            "PM",
            "MR",
            "MDR",
            "Backup",
            "QTG",
            "FMS & Parsing",
            "First AID check",
            "Refill DPI",
            "Toolbox check",
            "STG",
            "RoRo",
            "Load EVAL",
            "Pre-Cert",
        ],
        Comment: [],
        "Recurrent Issues": ["HW", "SW"],
        Troubleshooting: ["HW", "SW"],
        Others: [
            "Part test",
            "Remote connection with support",
            "Remote connection without support",
            "On-Site Connection",
            "Part Repaired",
            "Extra Task",
        ],
    };

    /* const troubleshootingDetails = [
        "VISUAL",
        "COMPUTER",
        "AVIONIC",
        "ENV",
        "BUILDING",
        "POWER LOSS",
        "MOTION",
        "INTERFACE",
        "CONTROLS",
        "VIBRATION",
        "SOUND",
        "COMMS",
        "IOS",
        "OTHERS",
    ]; */

    const troubleshootingDetails = [
        "Visual",
        "Computer",
        "Building",
        "Power Loss",
        "Motion",
        "Interface",
        "Controls",
        "Vibration",
        "Sound",
        "Comms",
        "IOS",
        "Cockpit Panels",
        "Cockpit Structure",
        "NSA Area",
        "Others",
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full mx-4 shadow-xl border border-[var(--light-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-[var(--light-primary)] pb-4 mb-4">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)]">
                        <TaskIcon
                            className={`w-6 ${task.ISLOGBOOK ? "text-[var(--orange)]" : "text-[var(--primary)]"}`}
                        />
                        <h1
                            className={`text-xl ${task.ISLOGBOOK ? "text-[var(--orange)]" : "text-[var(--primary)]"}`}
                        >
                            Modifica {task.ISLOGBOOK ? "Entry" : "Task"} #
                            {task.ID}
                        </h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--gray)] hover:text-[var(--black)] text-2xl font-bold"
                    >
                        <CloseIcon className="w-6" />
                    </button>
                </div>

                <div className="flex flex-col gap-8 max-h-[calc(60vh-1rem)] overflow-y-auto pr-1">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Titolo*</h3>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (titleError && e.target.value.trim()) {
                                    setTitleError(false);
                                }
                            }}
                            className={`error-display w-full text-[var(--black)] p-2 rounded-md bg-[var(--white)] focus:outline-[var(--gray)] transition-all duration-200 ${
                                titleError
                                    ? "border border-[var(--red)] focus:border-[var(--red)]"
                                    : "border border-[var(--light-primary)] focus:border-[var(--separator)]"
                            }`}
                            placeholder="Inserisci il titolo del task"
                            maxLength={200}
                            required
                        />
                        {titleError && (
                            <p className="text-[var(--red)] text-sm mt-1">
                                Il titolo è obbligatorio
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">
                            Descrizione
                        </h3>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full min-h-[100px] p-3 border border-[var(--light-primary)] rounded-md bg-[var(--white)] text-[var(--black)] resize-y focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                            placeholder="Inserisci note aggiuntive qui..."
                            required
                        ></textarea>
                    </div>

                    {/* <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Allegati</h3>

                        <input
                            type="file"
                            name="attachments"
                            id="attachments"
                            multiple
                            onChange={handleFilesChange}
                            disabled={!isAttachmentUploadEnabled}
                            className="border border-[var(--light-primary)] rounded-md p-2 text-[var(--black)] cursor-pointer hover:text-[var(--gray)] hover:border-[var(--separator)] transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-md file:bg-[var(--primary)] file:text-[#ffffff] file:cursor-pointer hover:file:bg-[var(--primary-hover)]"
                        />

                        {!isAttachmentUploadEnabled && (
                            <p className="text-sm text-[var(--gray)] italic">
                                Gli allegati sono disponibili solo per task
                                ordinarie.
                            </p>
                        )}

                        {selectedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedFiles.map((file) => (
                                    <div
                                        key={`${file.name}-${file.lastModified}`}
                                        className="px-3 py-2 bg-[var(--white)] border border-[var(--light-primary)] rounded-md text-sm text-[var(--black)]"
                                    >
                                        {file.name}
                                    </div>
                                ))}
                            </div>
                        )}

                        {attachmentError && (
                            <p className="text-[var(--red)] text-sm mt-1">
                                {attachmentError}
                            </p>
                        )}
                    </div> */}

                    <div className="flex flex-col gap-1 w-1/2">
                        <h3 className="text-sm text-[var(--gray)]">Stato</h3>
                        <div className="relative ">
                            <select
                                name=""
                                id=""
                                value={selectedStatus}
                                onChange={(e) =>
                                    setSelectedStatus(e.target.value)
                                }
                                className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                disabled={isRescheduling}
                            >
                                <option value="Rischedulato" disabled>
                                    Rischedulato
                                </option>
                                <option value="Convertito in task" disabled>
                                    Convertito in task
                                </option>
                                <option value="Da definire">Da definire</option>
                                <option value="In corso">In corso</option>
                                <option value="Completato">Completato</option>
                                <option value="Non completato">
                                    Non completato
                                </option>
                                <option value="Convertito in task">
                                    Convertito in task
                                </option>
                                {(currentUserRole === "Admin" ||
                                    currentUserRole === "Shift Leader") && (
                                    <option value="Completato da SL">
                                        Completato da SL
                                    </option>
                                )}
                            </select>
                            <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex flex-row gap-4 justify-between items-center">
                        <div className="flex flex-col gap-1 flex-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Categoria
                            </h3>
                            <div className="relative ">
                                <select
                                    name=""
                                    id=""
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                    className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                >
                                    {Object.keys(categories).map(
                                        (category, index) => (
                                            <option
                                                key={index}
                                                value={category}
                                            >
                                                {category}
                                            </option>
                                        ),
                                    )}
                                </select>
                                <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                            </div>
                        </div>

                        {selectedCategory !== "COMMENT" &&
                            selectedCategory !== "REPAIR" && (
                                <div className="flex flex-col gap-1 flex-1">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Sotto-Categoria
                                    </h3>
                                    <div className="relative">
                                        <select
                                            name=""
                                            id=""
                                            value={selectedSubCategory}
                                            onChange={(e) =>
                                                setSelectedSubCategory(
                                                    e.target.value,
                                                )
                                            }
                                            className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                        >
                                            {categories[selectedCategory]?.map(
                                                (subCategory, index) => (
                                                    <option
                                                        key={index}
                                                        value={subCategory}
                                                    >
                                                        {subCategory}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                    </div>
                                </div>
                            )}

                        {(selectedCategory === "Investigation" ||
                            selectedCategory === "Troubleshooting" ||
                            selectedCategory === "Recurrent Issues") && (
                            <div className="flex flex-col gap-1 flex-1">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Dettaglio Extra
                                </h3>
                                <div className="relative">
                                    <select
                                        name=""
                                        id=""
                                        value={selectedDetail}
                                        onChange={(e) =>
                                            setSelectedDetail(e.target.value)
                                        }
                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                    >
                                        {troubleshootingDetails.map(
                                            (detail, index) => (
                                                <option
                                                    key={index}
                                                    value={detail}
                                                >
                                                    {detail}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">
                            Simulatore
                        </h3>
                        <div className="relative">
                            <select
                                name=""
                                id=""
                                value={selectedSimulator}
                                onChange={(e) =>
                                    setSelectedSimulator(e.target.value)
                                }
                                className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                            >
                                {simulators.map((simulator, index) => (
                                    <option key={index} value={simulator}>
                                        {simulator}
                                    </option>
                                ))}
                            </select>
                            <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Data</h3>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full text-[var(--black)] p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">Turno</h3>
                        <div className="flex flex-row items-center gap-1 gap-2 border border-[var(--light-primary)] rounded-md p-2">
                            <div
                                onClick={() => setSelectedRadio("Diurno")}
                                className={`flex items-center p-2 gap-2 rounded-md cursor-pointer border border-transparent text-[var(--black)] hover:bg-[var(--light-primary)] flex-1 ${
                                    selectedRadio === "Diurno"
                                        ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                        : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="turno"
                                    id="Diurno"
                                    value="Diurno"
                                    checked={selectedRadio === "Diurno"}
                                    onChange={handleRadioChange}
                                    className="hidden"
                                />
                                <DayIcon className="w-6" />
                                <label
                                    className="cursor-pointer"
                                    htmlFor="Diurno"
                                >
                                    Diurno
                                </label>
                            </div>
                            <div
                                onClick={() => setSelectedRadio("Notturno")}
                                className={`flex items-center p-2 gap-2 rounded-md cursor-pointer border border-transparent text-[var(--black)] hover:bg-[var(--light-primary)] flex-1 ${
                                    selectedRadio === "Notturno"
                                        ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                        : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="turno"
                                    id="Notturno"
                                    value="Notturno"
                                    checked={selectedRadio === "Notturno"}
                                    onChange={handleRadioChange}
                                    className="hidden"
                                />
                                <NightIcon className="w-6" />
                                <label
                                    className="cursor-pointer"
                                    htmlFor="Notturno"
                                >
                                    Notturno
                                </label>
                            </div>
                        </div>
                    </div>

                    {isDuplicating && (
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm text-[var(--gray)]">
                                Importare note
                            </h3>
                            <div className="flex flex-row items-center gap-1 gap-2 border border-[var(--light-primary)] rounded-md p-2">
                                <div
                                    onClick={() => setImportNotes("No")}
                                    className={`flex items-center justify-center p-2 gap-2 rounded-md cursor-pointer border border-transparent text-[var(--black)] hover:bg-[var(--light-primary)] flex-1 ${
                                        importNotes === "No"
                                            ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="importNotes"
                                        id="importNotesNo"
                                        value="No"
                                        checked={importNotes === "No"}
                                        onChange={(e) =>
                                            setImportNotes(e.target.value)
                                        }
                                        className="hidden"
                                    />
                                    <label
                                        className="cursor-pointer"
                                        htmlFor="importNotesNo"
                                    >
                                        No
                                    </label>
                                </div>
                                <div
                                    onClick={() => setImportNotes("Si")}
                                    className={`flex items-center justify-center p-2 gap-2 rounded-md cursor-pointer border border-transparent text-[var(--black)] hover:bg-[var(--light-primary)] flex-1 ${
                                        importNotes === "Si"
                                            ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="importNotes"
                                        id="importNotesSi"
                                        value="Si"
                                        checked={importNotes === "Si"}
                                        onChange={(e) =>
                                            setImportNotes(e.target.value)
                                        }
                                        className="hidden"
                                    />
                                    <label
                                        className="cursor-pointer"
                                        htmlFor="importNotesSi"
                                    >
                                        Si
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm text-[var(--gray)]">
                            Assegnatario/i
                        </h3>
                        <div className="grid grid-cols-3 gap-2 border border-[var(--light-primary)] rounded-md p-2">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.Username}
                                    onClick={() =>
                                        handleCheckboxChange(user.Username)
                                    }
                                    className={`flex items-center cursor-pointer gap-2 rounded-md p-2 flex-1 border border-transparent hover:bg-[var(--light-primary)] ${
                                        selectedAssignees.includes(
                                            user.Username,
                                        )
                                            ? "border-[var(--light-primary)] bg-[var(--light-primary)] text-[var(--primary)]"
                                            : "text-[var(--black)]"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        name=""
                                        id={user.Username}
                                        checked={selectedAssignees.includes(
                                            user.Username,
                                        )}
                                        onChange={() =>
                                            handleCheckboxChange(user.Username)
                                        }
                                        className="hidden"
                                    />
                                    <UserIcon className="w-6 shrink-0" />
                                    <label
                                        className="cursor-pointer truncate"
                                        htmlFor={user.Username}
                                    >
                                        {user.Username.split(".")[0]
                                            .charAt(0)
                                            .toUpperCase() +
                                            user.Username.split(".")[0].slice(
                                                1,
                                            )}
                                        {user.Username.split(".")[1] && (
                                            <>
                                                {" "}
                                                {user.Username.split(".")[1]
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    user.Username.split(
                                                        ".",
                                                    )[1].slice(1)}
                                            </>
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-1 border-t border-[var(--light-primary)] pt-4 mt-4">
                    <button className="btn gray-btn" onClick={onClose}>
                        Chiudi
                    </button>

                    <button
                        className="btn"
                        onClick={handleModify}
                        disabled={
                            !isConverting && !isDuplicating && !hasChanges
                        }
                    >
                        <p>Salva modifiche</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModifyModal;
