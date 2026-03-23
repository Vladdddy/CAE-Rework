import { useEffect, useState } from "react";
import CloseIcon from "../../assets/icons/close.tsx";
import TaskIcon from "../../assets/icons/tasks.tsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import UserIcon from "../../assets/icons/user.tsx";
import { useTasks } from "../data/provider/taskAPI/useTasks.js";
import { useLogbooks } from "../data/provider/logbookAPI/useLogbooks.js";
import { useNotes } from "../data/provider/noteAPI/useNotes.js";
import { useNoteLogbooks } from "../data/provider/noteLogbookAPI/useNoteLogbooks.js";
import { useUsers } from "../data/provider/userAPI/useUsers.js";
import { useImageTasks } from "../data/provider/imageTaskAPI/useImageTasks.js";
import { useImageLogbooks } from "../data/provider/imageLogbookAPI/useImageLogbooks.js";
import ModifyModal from "./ModifyModal.jsx";
import Splitter from "../../functions/SplitAssignedTo.jsx";
import ConvertIcon from "../../assets/icons/convert.tsx";
import DuplicateIcon from "../../assets/icons/duplicate.tsx";
import FlagIcon from "../../assets/icons/flag.tsx";
import UnflagIcon from "../../assets/icons/unflag.tsx";
import EditIcon from "../../assets/icons/edit.tsx";
import DeleteIcon from "../../assets/icons/delete.tsx";

function DisplayModal({ taskInfo, onClose, onSuccess }) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isModifyOpen, setIsModifyOpen] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [activeTab, setActiveTab] = useState("dettagli");
    const [noteDescription, setNoteDescription] = useState("");
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
    const [thumbSourceIndexByImageId, setThumbSourceIndexByImageId] = useState(
        {},
    );
    const { deleteTask, fetchTasks, updateTask, addTask, tasks } = useTasks();
    const { deleteLogbook, updateLogbook, fetchLogbooks } = useLogbooks();
    const { notes, fetchNotes, createNote, editNote, deleteNote } = useNotes();
    const {
        fetchTaskImages,
        getTaskImages,
        deleteTaskImage,
        getAttachmentLabel,
        getAttachmentPreviewUrl,
        getAttachmentPreviewSources,
        isImageFile,
    } = useImageTasks();
    const {
        fetchLogbookImages,
        getLogbookImages,
        deleteLogbookImage,
        getAttachmentLabel: getLogbookAttachmentLabel,
        getAttachmentPreviewUrl: getLogbookAttachmentPreviewUrl,
        getAttachmentPreviewSources: getLogbookAttachmentPreviewSources,
        isImageFile: isLogbookImageFile,
    } = useImageLogbooks();
    const {
        noteLogbooks,
        fetchNoteLogbooks,
        createNoteLogbook,
        editNoteLogbook,
        deleteNoteLogbook,
    } = useNoteLogbooks();
    const { users, currentUserId } = useUsers();
    const { currentUserRole } = useUsers();
    const attachmentImages = taskInfo.ISLOGBOOK
        ? getLogbookImages(taskInfo.ID)
        : getTaskImages(taskInfo.ID);

    const getAttachmentLabelByType = (image) =>
        taskInfo.ISLOGBOOK
            ? getLogbookAttachmentLabel(image)
            : getAttachmentLabel(image);

    const getAttachmentPreviewUrlByType = (image) =>
        taskInfo.ISLOGBOOK
            ? getLogbookAttachmentPreviewUrl(image)
            : getAttachmentPreviewUrl(image);

    const getAttachmentPreviewSourcesByType = (image) =>
        taskInfo.ISLOGBOOK
            ? getLogbookAttachmentPreviewSources(image)
            : getAttachmentPreviewSources(image);

    const isImageFileByType = (image) =>
        taskInfo.ISLOGBOOK ? isLogbookImageFile(image) : isImageFile(image);

    const canManageAttachments =
        currentUserRole === "Admin" || currentUserRole === "Shift Leader";

    useEffect(() => {
        if (taskInfo.ISLOGBOOK) {
            fetchLogbookImages(taskInfo.ID);
            return;
        }

        fetchTaskImages(taskInfo.ID);
    }, [fetchLogbookImages, fetchTaskImages, taskInfo.ID, taskInfo.ISLOGBOOK]);

    const getUsernameById = (userId) => {
        const user = users.find((u) => u.ID === userId);
        if (!user || !user.Username) return "N/A";

        const parts = user.Username.split(".");
        const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const lastNameInitial = parts[1]
            ? parts[1].charAt(0).toUpperCase()
            : "";

        return lastNameInitial ? `${firstName} ${lastNameInitial}` : firstName;
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "N/A";

        const dateOfWeek = new Date(dateTimeString);
        const days = [
            "Domenica",
            "Lunedì",
            "Martedì",
            "Mercoledì",
            "Giovedì",
            "Venerdì",
            "Sabato",
        ];

        const date = new Date(dateTimeString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${days[dateOfWeek.getDay()]} • ${day}/${month}/${year} • ${hours}:${minutes}`;
    };

    const handleDelete = async () => {
        const isLogbook = taskInfo.ISLOGBOOK;

        const result = isLogbook
            ? await deleteLogbook(taskInfo.ID)
            : await deleteTask(taskInfo.ID);
        onClose();

        if (onSuccess) {
            if (isLogbook) {
                await fetchLogbooks();
            } else {
                await fetchTasks();
            }

            onSuccess(
                result.success,
                isLogbook
                    ? `Entry "${taskInfo.TITLE}" eliminata con successo`
                    : `Task "${taskInfo.TITLE}" eliminata con successo`,
            );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getDayOfWeek = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        const days = [
            "Domenica",
            "Lunedì",
            "Martedì",
            "Mercoledì",
            "Giovedì",
            "Venerdì",
            "Sabato",
        ];
        return days[date.getDay()];
    };

    const handleModify = () => {
        setIsModifyOpen(true);
    };

    const handleConvertToTask = () => {
        setIsConverting(true);
        setIsModifyOpen(true);
    };

    const handleDuplicateTask = () => {
        setIsDuplicating(true);
        setIsModifyOpen(true);
    };

    const handleFlagTask = async () => {
        try {
            // Update the current task to set isFlagged to 1
            const updatedCurrentTask = {
                title: taskInfo.TITLE,
                description: taskInfo.DESCRIPTION,
                category: taskInfo.CATEGORY,
                subcategory: taskInfo.SUBCATEGORY,
                extradetail: taskInfo.EXTRADETAIL,
                simulator: taskInfo.SIMULATOR,
                date: taskInfo.DATE,
                time: taskInfo.TIME,
                assigned_to: taskInfo.ASSIGNED_TO,
                status: taskInfo.STATUS,
                type: taskInfo.TYPE,
                isFlagged: 1,
            };

            const updateResult = await updateTask(
                taskInfo.ID,
                updatedCurrentTask,
            );

            if (!updateResult.success) {
                if (onSuccess) {
                    onSuccess(false, "Errore nell'aggiornamento della task");
                }
                return;
            }

            // Parse the current task date
            const currentDate = new Date(taskInfo.DATE);

            // Create 5 tasks for the following 5 days
            const createPromises = [];
            for (let i = 1; i <= 5; i++) {
                const nextDate = new Date(currentDate);
                nextDate.setDate(currentDate.getDate() + i);

                // Format date as YYYY-MM-DD
                const formattedDate = nextDate.toISOString().split("T")[0];

                const newTask = {
                    title: taskInfo.TITLE,
                    description: taskInfo.DESCRIPTION,
                    category: taskInfo.CATEGORY,
                    subcategory: taskInfo.SUBCATEGORY,
                    extradetail: taskInfo.EXTRADETAIL,
                    simulator: taskInfo.SIMULATOR,
                    date: formattedDate,
                    time: taskInfo.TIME,
                    assigned_to: taskInfo.ASSIGNED_TO,
                    status: taskInfo.STATUS,
                    isFlagged: 1,
                    type: taskInfo.TYPE,
                };

                createPromises.push(addTask(newTask));
            }

            const results = await Promise.all(createPromises);
            const allSuccessful = results.every((r) => r.success);

            if (allSuccessful) {
                await fetchTasks();
                if (onSuccess) {
                    onSuccess(
                        true,
                        `Task "${taskInfo.TITLE}" contrassegnata e duplicata per i prossimi 5 giorni`,
                    );
                }
                onClose();
            } else {
                if (onSuccess) {
                    onSuccess(false, "Errore nella creazione di alcune task");
                }
            }
        } catch {
            if (onSuccess) {
                onSuccess(false, "Errore nel contrassegnare la task");
            }
        }
    };

    const handleRemoveFlag = async () => {
        try {
            console.log("Removing flag from task with ID:", taskInfo.ID);

            // Filter tasks with matching criteria
            const matchingTasks = tasks.filter(
                (task) =>
                    task.TITLE === taskInfo.TITLE &&
                    task.DESCRIPTION === taskInfo.DESCRIPTION &&
                    task.ASSIGNED_TO === taskInfo.ASSIGNED_TO &&
                    task.TIME === taskInfo.TIME &&
                    task.IS_FLAGGED === true,
            );

            console.log("Matching flagged tasks found:", matchingTasks.length);

            // Sort by date to maintain chronological order
            const sortedTasks = matchingTasks.sort(
                (a, b) => new Date(a.DATE) - new Date(b.DATE),
            );

            // Find the index of the current task
            const currentTaskIndex = sortedTasks.findIndex(
                (task) => task.ID === taskInfo.ID,
            );

            if (currentTaskIndex === -1) {
                console.error("Current task not found in matching tasks");
                if (onSuccess) {
                    onSuccess(false, "Errore: task non trovata");
                }
                return;
            }

            // Tasks to delete (all tasks AFTER the current one)
            const tasksToDelete = sortedTasks.slice(currentTaskIndex + 1);

            // Tasks to unflag (all tasks BEFORE and INCLUDING the current one)
            const tasksToUnflag = sortedTasks.slice(0, currentTaskIndex + 1);

            console.log(`Deleting ${tasksToDelete.length} tasks after current`);
            console.log(
                `Unflagging ${tasksToUnflag.length} tasks up to current`,
            );

            // Delete tasks after the current one
            const deletePromises = tasksToDelete.map((task) =>
                deleteTask(task.ID),
            );
            const deleteResults = await Promise.all(deletePromises);
            const allDeletesSuccessful = deleteResults.every((r) => r.success);

            if (!allDeletesSuccessful) {
                if (onSuccess) {
                    onSuccess(false, "Errore nell'eliminazione di alcune task");
                }
                return;
            }

            // Update tasks before and including current to set IS_FLAGGED to 0
            const updatePromises = tasksToUnflag.map((task) => {
                const updatedTask = {
                    title: task.TITLE,
                    description: task.DESCRIPTION,
                    category: task.CATEGORY,
                    subcategory: task.SUBCATEGORY,
                    extradetail: task.EXTRADETAIL,
                    simulator: task.SIMULATOR,
                    date: task.DATE,
                    time: task.TIME,
                    assigned_to: task.ASSIGNED_TO,
                    status: task.STATUS,
                    type: task.TYPE,
                    isFlagged: 0,
                };
                return updateTask(task.ID, updatedTask);
            });

            const updateResults = await Promise.all(updatePromises);
            const allUpdatesSuccessful = updateResults.every((r) => r.success);

            if (allUpdatesSuccessful) {
                await fetchTasks();
                onClose();
                if (onSuccess) {
                    onSuccess(
                        true,
                        `Task "${taskInfo.TITLE}" non più contrassegnata.`,
                    );
                }
            } else {
                if (onSuccess) {
                    onSuccess(
                        false,
                        "Errore nell'aggiornamento di alcune task",
                    );
                }
            }
        } catch (error) {
            console.error("Error in handleRemoveFlag:", error);
            if (onSuccess) {
                onSuccess(false, "Errore nella rimozione del flag");
            }
        }
    };

    const handleCloseModify = () => {
        setIsModifyOpen(false);
        setIsConverting(false);
        setIsDuplicating(false);
    };

    const handleModifyPopup = async () => {
        if (onSuccess) {
            await fetchLogbooks();
            await fetchTasks();

            const result = { success: true };
            onSuccess(
                result.success,
                `Task "${taskInfo.TITLE}" modificata con successo`,
            );
        }
    };

    const handleStatusChange = async (e) => {
        const isLogbook = taskInfo.ISLOGBOOK;

        const newStatus = e.target.value;

        const updatedTaskData = {
            title: taskInfo.TITLE,
            description: taskInfo.DESCRIPTION,
            category: taskInfo.CATEGORY,
            subcategory: taskInfo.SUBCATEGORY,
            extradetail: taskInfo.EXTRADETAIL,
            simulator: taskInfo.SIMULATOR,
            date: taskInfo.DATE,
            time: taskInfo.TIME,
            assigned_to: taskInfo.ASSIGNED_TO,
            status: newStatus,
        };

        const result = isLogbook
            ? await updateLogbook(taskInfo.ID, updatedTaskData)
            : await updateTask(taskInfo.ID, updatedTaskData);

        if (result.success) {
            if (isLogbook) {
                await fetchLogbooks();

                const changeStatusNote = await createNoteLogbook(
                    taskInfo.ID,
                    currentUserId,
                    "Stato modificato da " +
                        `"${taskInfo.STATUS}" a "${newStatus}"`,
                    "automatico",
                );

                if (changeStatusNote.success) {
                    setNoteDescription("");
                }
            } else {
                await fetchTasks();

                const changeStatusNote = await createNote(
                    taskInfo.ID,
                    currentUserId,
                    "Stato modificato da " +
                        `"${taskInfo.STATUS}" a "${newStatus}"`,
                    "automatico",
                );

                if (changeStatusNote.success) {
                    setNoteDescription("");
                }
            }

            if (onSuccess) {
                onSuccess(true, `Stato aggiornato a "${newStatus}"`);
            }
        }
    };

    const handleSaveNote = async () => {
        if (!noteDescription.trim()) {
            return;
        }

        const isLogbook = taskInfo.ISLOGBOOK;

        // If editing, update the existing note
        if (editingNoteId) {
            const result = isLogbook
                ? await editNoteLogbook(editingNoteId, noteDescription)
                : await editNote(editingNoteId, noteDescription);

            if (result.success) {
                setNoteDescription("");
                setEditingNoteId(null);
                if (isLogbook) {
                    await fetchNoteLogbooks(taskInfo.ID);
                } else {
                    await fetchNotes(taskInfo.ID);
                }
                if (onSuccess) {
                    onSuccess(true, "Nota modificata con successo");
                }
            } else {
                if (onSuccess) {
                    onSuccess(false, "Errore nella modifica della nota");
                }
            }
            return;
        }

        // Otherwise, create a new note
        const result = isLogbook
            ? await createNoteLogbook(
                  taskInfo.ID,
                  currentUserId,
                  noteDescription,
                  "creato",
              )
            : await createNote(
                  taskInfo.ID,
                  currentUserId,
                  noteDescription,
                  "creato",
              );

        if (result.success) {
            setNoteDescription("");
            if (onSuccess) {
                onSuccess(true, "Nota salvata con successo");
            }
        } else {
            if (onSuccess) {
                onSuccess(false, "Errore nel salvataggio della nota");
            }
        }
    };

    const handleEditNote = (note) => {
        setNoteDescription(note.DESCRIPTION);
        setEditingNoteId(note.ID);
    };

    const handleCancelEdit = () => {
        setNoteDescription("");
        setEditingNoteId(null);
    };

    const handleDeleteNote = async (note) => {
        const isLogbook = taskInfo.ISLOGBOOK;

        const result = isLogbook
            ? await deleteNoteLogbook(note.ID)
            : await deleteNote(note.ID);

        if (result.success) {
            if (editingNoteId === note.ID) {
                setNoteDescription("");
                setEditingNoteId(null);
            }

            if (isLogbook) {
                await fetchNoteLogbooks(taskInfo.ID);
            } else {
                await fetchNotes(taskInfo.ID);
            }

            if (onSuccess) {
                onSuccess(true, "Nota eliminata con successo");
            }
        } else if (onSuccess) {
            onSuccess(false, "Errore nell'eliminazione della nota");
        }
    };

    const handleDeleteAttachment = async (imageId) => {
        const result = taskInfo.ISLOGBOOK
            ? await deleteLogbookImage(imageId, taskInfo.ID)
            : await deleteTaskImage(imageId, taskInfo.ID);

        if (result.success) {
            if (onSuccess) {
                onSuccess(true, "Allegato eliminato con successo");
            }
            return;
        }

        if (onSuccess) {
            onSuccess(false, "Errore nell'eliminazione dell'allegato");
        }
    };

    const isPdfFile = (image) => {
        const label =
            getAttachmentLabelByType(image) ||
            image?.FILE_NAME ||
            image?.fileName ||
            image?.PATH ||
            image?.path;
        return /\.pdf$/i.test(label || "");
    };

    const isDocumentFile = (image) => {
        const label =
            getAttachmentLabelByType(image) ||
            image?.FILE_NAME ||
            image?.fileName ||
            image?.PATH ||
            image?.path;
        return /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(label || "");
    };

    const isOpenableAttachmentSource = (src) => {
        if (!src || typeof src !== "string") {
            return false;
        }

        // Skip raw local file-system paths like /mnt/c/... or C:\\...
        if (/^\/?mnt\//i.test(src) || /^[a-z]:[\\/]/i.test(src)) {
            return false;
        }

        // Allow generated blob URLs and standard web URLs/paths.
        return (
            src.startsWith("blob:") ||
            src.startsWith("http://") ||
            src.startsWith("https://") ||
            src.startsWith("/")
        );
    };

    const openDocumentInNewTab = (image) => {
        const sources = getAttachmentPreviewSourcesByType(image);

        // Try to find the API endpoint URL (not the file system path)
        const apiUrl = sources.find(
            (src) =>
                src.includes("/imageLogbook/") || src.includes("/imageTask/"),
        );

        if (apiUrl) {
            window.open(apiUrl, "_blank");
        } else {
            const safeFallback = sources.find(isOpenableAttachmentSource);
            if (safeFallback) {
                window.open(safeFallback, "_blank");
            }
        }
    };

    const openPdfInNewTab = (image) => {
        const sources = getAttachmentPreviewSourcesByType(image);

        // Try to find the API endpoint URL (not the file system path)
        const apiUrl = sources.find(
            (src) =>
                src.includes("/imageLogbook/") || src.includes("/imageTask/"),
        );

        if (apiUrl) {
            window.open(apiUrl, "_blank");
        } else {
            const safeFallback = sources.find(isOpenableAttachmentSource);
            if (safeFallback) {
                window.open(safeFallback, "_blank");
            }
        }
    };

    const openImagePreview = (image, imageId) => {
        if (!isImageFileByType(image)) {
            return;
        }

        const sources = getAttachmentPreviewSourcesByType(image);
        const initialIndex = thumbSourceIndexByImageId[imageId] ?? 0;
        const src = sources[initialIndex] || sources[0];

        if (!src) {
            return;
        }

        setSelectedPreviewImage({
            sources,
            index: src === sources[initialIndex] ? initialIndex : 0,
            label: getAttachmentLabelByType(image),
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm cursor-default flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full mx-4 shadow-xl border border-[var(--light-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-[var(--light-primary)] pb-4 mb-4">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)]">
                        <TaskIcon
                            className={`w-6 ${taskInfo.ISLOGBOOK ? "text-[var(--orange)]" : "text-[var(--primary)]"}`}
                        />
                        <h1
                            className={`text-xl ${taskInfo.ISLOGBOOK ? "text-[var(--orange)]" : "text-[var(--primary)]"}`}
                        >
                            Dettagli{taskInfo.ISLOGBOOK ? " Entry" : " Task"} #
                            {taskInfo.ID}
                        </h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--gray)] hover:text-[var(--black)] text-2xl font-bold"
                    >
                        <CloseIcon className="w-6" />
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center justify-start border border-[var(--light-primary)] rounded-md w-fit p-1">
                            <div
                                className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer transition-all duration-200 ${
                                    activeTab === "dettagli"
                                        ? "bg-[var(--light-primary)] text-[var(--primary)]"
                                        : "text-[var(--black)] hover:bg-[var(--light-primary)]"
                                }`}
                                onClick={() => setActiveTab("dettagli")}
                            >
                                <p className="text-sm">Dettagli Task</p>
                            </div>

                            <div
                                className={`flex items-center gap-2 p-2 px-4 rounded-md cursor-pointer transition-all duration-200 ${
                                    activeTab === "note"
                                        ? "bg-[var(--light-primary)] text-[var(--primary)]"
                                        : "text-[var(--black)] hover:bg-[var(--light-primary)]"
                                }`}
                                onClick={() => {
                                    setActiveTab("note");
                                    if (taskInfo.ISLOGBOOK) {
                                        fetchNoteLogbooks(taskInfo.ID);
                                    } else {
                                        fetchNotes(taskInfo.ID);
                                    }
                                }}
                            >
                                <p className="text-sm">Note aggiunte</p>
                            </div>
                        </div>

                        {(currentUserRole === "Admin" ||
                            currentUserRole === "Shift Leader") &&
                            taskInfo.ISLOGBOOK && (
                                <div
                                    className="flex items-center gap-1 text-[var(--primary)] cursor-pointer hover:text-[var(--primary-hover)]"
                                    onClick={handleConvertToTask}
                                >
                                    <ConvertIcon className="w-4" />

                                    <p className="text-sm transition-all duration-200">
                                        Converti in Task
                                    </p>
                                </div>
                            )}

                        {(currentUserRole === "Admin" ||
                            currentUserRole === "Shift Leader") &&
                            !taskInfo.ISLOGBOOK && (
                                <div
                                    className="flex items-center gap-1 text-[var(--primary)] cursor-pointer hover:text-[var(--primary-hover)]"
                                    onClick={handleDuplicateTask}
                                >
                                    <DuplicateIcon className="w-4" />

                                    <p className="text-sm transition-all duration-200">
                                        Duplica Task
                                    </p>
                                </div>
                            )}
                    </div>

                    {activeTab === "dettagli" && (
                        <>
                            <div className="flex flex-col gap-8 max-h-[calc(50vh-1rem)] overflow-y-auto pr-1">
                                <div className="flex flex-col gap-2">
                                    <p className="text-xl text-[var(--black)] font-semibold">
                                        {taskInfo.TITLE || "N/A"}
                                    </p>

                                    <div className="task-description text-sm text-[var(--gray)] bg-[var(--white)] p-2 border border-[var(--light-primary)] rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm text-[var(--primary)]">
                                                    {taskInfo.SIMULATOR ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="whitespace-pre-wrap break-words">
                                            {taskInfo.DESCRIPTION || "N/A"}
                                        </span>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center gap-1 max-w-xs flex-wrap">
                                                <UserIcon className="w-4 text-[var(--black)]" />
                                                <Splitter
                                                    taskInfo={taskInfo}
                                                    style="text-xs text-[var(--black)]"
                                                    div="flex items-center gap-1 max-w-xs flex-wrap"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <p className="text-sm text-[var(--black)]">
                                                        {getDayOfWeek(
                                                            taskInfo?.DATE,
                                                        )}
                                                    </p>

                                                    <p className="text-sm text-[var(--black)]">
                                                        •
                                                    </p>

                                                    <p className="text-sm text-[var(--black)]">
                                                        {formatDate(
                                                            taskInfo?.DATE,
                                                        ) || "N/A"}
                                                    </p>

                                                    <p className="text-sm text-[var(--black)]">
                                                        •
                                                    </p>

                                                    <p className="text-sm text-[var(--black)]">
                                                        {taskInfo.TIME || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 w-1/2">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Stato
                                    </h3>

                                    <div className="relative">
                                        <select
                                            defaultValue={
                                                taskInfo?.STATUS ||
                                                "Da definire"
                                            }
                                            onChange={handleStatusChange}
                                            name=""
                                            id=""
                                            className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                        >
                                            <option value="In corso">
                                                In corso
                                            </option>
                                            <option value="Completato">
                                                Completato
                                            </option>
                                            <option value="Non completato">
                                                Non completato
                                            </option>
                                            <option value="Da definire">
                                                Da definire
                                            </option>
                                            {(currentUserRole === "Admin" ||
                                                currentUserRole ===
                                                    "Shift Leader") && (
                                                <option value="Completato da SL">
                                                    Completato da SL
                                                </option>
                                            )}
                                        </select>
                                        <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                    </div>
                                </div>

                                <div className="flex flex-col justify-start items-start gap-2 border-b border-[var(--light-primary)] pb-4">
                                    <div
                                        className="flex items-center gap-1 text-[var(--black)] hover:text-[var(--primary)] cursor-pointer transition-all duration-200 ease-in-out"
                                        onClick={() =>
                                            setIsDetailsOpen(!isDetailsOpen)
                                        }
                                    >
                                        <h3 className="text-sm">
                                            Mostra Dettagli
                                        </h3>
                                        <ArrowRightIcon
                                            className={`w-4 transition-transform duration-200 ${
                                                isDetailsOpen
                                                    ? "rotate-[-90deg]"
                                                    : "rotate-90"
                                            }`}
                                        />
                                    </div>

                                    <div
                                        className={`${
                                            isDetailsOpen ? "block" : "hidden"
                                        } w-full`}
                                    >
                                        <div className="flex justify-between items-center flex-wrap gap-2">
                                            <div className="flex flex-col gap-1 mt-4">
                                                <h3 className="text-sm text-[var(--gray)]">
                                                    Categoria
                                                </h3>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-sm text-[var(--black)] truncate">
                                                            {taskInfo?.CATEGORY ||
                                                                "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 mt-4">
                                                <h3 className="text-sm text-[var(--gray)]">
                                                    Sotto-Categoria
                                                </h3>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-sm text-[var(--black)] truncate">
                                                            {taskInfo?.SUBCATEGORY ||
                                                                "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 mt-4">
                                                <h3 className="text-sm text-[var(--gray)]">
                                                    Dettaglio Extra
                                                </h3>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-sm text-[var(--black)] truncate">
                                                            {taskInfo?.EXTRADETAIL ||
                                                                "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm text-[var(--gray)]">
                                        Allegati
                                    </h3>

                                    {attachmentImages.length === 0 ? (
                                        <h4 className="text-sm text-center text-[var(--gray)] italic">
                                            Nessun allegato disponibile.
                                        </h4>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {attachmentImages.map((image) => {
                                                const imageId =
                                                    image.ID ?? image.id;
                                                const previewSources =
                                                    getAttachmentPreviewSourcesByType(
                                                        image,
                                                    );
                                                const thumbState =
                                                    thumbSourceIndexByImageId[
                                                        imageId
                                                    ];
                                                const hasNoPreview =
                                                    thumbState === -1;
                                                const currentThumbIndex =
                                                    thumbState ?? 0;
                                                const previewUrl = hasNoPreview
                                                    ? ""
                                                    : previewSources[
                                                          currentThumbIndex
                                                      ] ||
                                                      getAttachmentPreviewUrlByType(
                                                          image,
                                                      );
                                                const isImage =
                                                    isImageFileByType(image);

                                                return (
                                                    <div
                                                        key={imageId}
                                                        className="flex items-center justify-between gap-2 bg-[var(--white)] border border-[var(--light-primary)] rounded-md p-2"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (
                                                                    isPdfFile(
                                                                        image,
                                                                    )
                                                                ) {
                                                                    openPdfInNewTab(
                                                                        image,
                                                                    );
                                                                } else if (
                                                                    isDocumentFile(
                                                                        image,
                                                                    )
                                                                ) {
                                                                    openDocumentInNewTab(
                                                                        image,
                                                                    );
                                                                } else {
                                                                    openImagePreview(
                                                                        image,
                                                                        imageId,
                                                                    );
                                                                }
                                                            }}
                                                            className={`min-w-0 flex items-center gap-3 text-left ${
                                                                (isImage ||
                                                                    isPdfFile(
                                                                        image,
                                                                    ) ||
                                                                    isDocumentFile(
                                                                        image,
                                                                    )) &&
                                                                previewUrl
                                                                    ? "cursor-pointer"
                                                                    : "cursor-default"
                                                            }`}
                                                        >
                                                            {isImage &&
                                                            previewUrl ? (
                                                                <img
                                                                    src={
                                                                        previewUrl
                                                                    }
                                                                    onError={() => {
                                                                        if (
                                                                            currentThumbIndex <
                                                                            previewSources.length -
                                                                                1
                                                                        ) {
                                                                            setThumbSourceIndexByImageId(
                                                                                (
                                                                                    prev,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    [imageId]:
                                                                                        currentThumbIndex +
                                                                                        1,
                                                                                }),
                                                                            );
                                                                            return;
                                                                        }

                                                                        setThumbSourceIndexByImageId(
                                                                            (
                                                                                prev,
                                                                            ) => ({
                                                                                ...prev,
                                                                                [imageId]:
                                                                                    -1,
                                                                            }),
                                                                        );
                                                                    }}
                                                                    alt={getAttachmentLabelByType(
                                                                        image,
                                                                    )}
                                                                    className="w-14 h-14 rounded-md object-cover border border-[var(--light-primary)] bg-[var(--light-primary)]"
                                                                />
                                                            ) : (
                                                                <div className="w-14 h-14 rounded-md border border-[var(--light-primary)] bg-[var(--light-primary)] flex items-center justify-center text-xs text-[var(--gray)]">
                                                                    File
                                                                </div>
                                                            )}

                                                            <div className="min-w-0 hover:text-[var(--primary)] transition-all duration-200">
                                                                <p className="text-sm text-[var(--black)] truncate">
                                                                    {getAttachmentLabelByType(
                                                                        image,
                                                                    )}
                                                                </p>
                                                                {(isImage ||
                                                                    isPdfFile(
                                                                        image,
                                                                    ) ||
                                                                    isDocumentFile(
                                                                        image,
                                                                    )) &&
                                                                    previewUrl && (
                                                                        <p className="text-xs text-[var(--primary)] truncate">
                                                                            {isPdfFile(
                                                                                image,
                                                                            )
                                                                                ? "Clicca per aprire PDF"
                                                                                : isDocumentFile(
                                                                                        image,
                                                                                    )
                                                                                  ? "Clicca per aprire documento"
                                                                                  : "Clicca per aprire anteprima"}
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        </button>

                                                        {canManageAttachments && (
                                                            <button
                                                                className="btn delete !px-3 !py-2"
                                                                onClick={() =>
                                                                    handleDeleteAttachment(
                                                                        imageId,
                                                                    )
                                                                }
                                                            >
                                                                Elimina
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-[var(--light-primary)] pt-4 mt-4 gap-1">
                                {/*(currentUserRole === "Admin" ||
                                    currentUserRole === "Shift Leader") && (
                                    <>
                                        <button
                                            className="btn delete"
                                            onClick={() => handleDelete()}
                                        >
                                            Elimina
                                        </button>
                                    </>
                                )*/}

                                {(currentUserRole === "Admin" ||
                                    currentUserRole === "Shift Leader" ||
                                    (taskInfo.ASSIGNED_TO &&
                                        taskInfo.ISLOGBOOK &&
                                        users.find(
                                            (u) => u.ID === currentUserId,
                                        )?.Username &&
                                        taskInfo.ASSIGNED_TO.includes(
                                            users.find(
                                                (u) => u.ID === currentUserId,
                                            ).Username,
                                        ))) && (
                                    <button
                                        className="btn delete"
                                        onClick={() => handleDelete()}
                                    >
                                        Elimina
                                    </button>
                                )}

                                {!taskInfo?.IS_FLAGGED
                                    ? (currentUserRole === "Admin" ||
                                          currentUserRole ===
                                              "Shift Leader") && (
                                          <button
                                              className="btn secondary flex items-center gap-1"
                                              onClick={handleFlagTask}
                                          >
                                              <FlagIcon className="w-6" />
                                              <p>Flag task</p>
                                          </button>
                                      )
                                    : (currentUserRole === "Admin" ||
                                          currentUserRole ===
                                              "Shift Leader") && (
                                          <button
                                              className="btn secondary flex items-center gap-1"
                                              onClick={handleRemoveFlag}
                                          >
                                              <UnflagIcon className="w-6" />
                                              <p>Remove flag</p>
                                          </button>
                                      )}

                                <div className="flex gap-1 ml-auto">
                                    <button
                                        className="btn gray-btn"
                                        onClick={onClose}
                                    >
                                        Chiudi
                                    </button>
                                    {(currentUserRole === "Admin" ||
                                        currentUserRole === "Shift Leader" ||
                                        (taskInfo.ASSIGNED_TO &&
                                            taskInfo.ISLOGBOOK &&
                                            users.find(
                                                (u) => u.ID === currentUserId,
                                            )?.Username &&
                                            taskInfo.ASSIGNED_TO.includes(
                                                users.find(
                                                    (u) =>
                                                        u.ID === currentUserId,
                                                ).Username,
                                            ))) && (
                                        <button
                                            className="btn flex items-center gap-1"
                                            onClick={handleModify}
                                        >
                                            <p>Modifica</p>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "note" && (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-8 max-h-[calc(40vh-4rem)] overflow-y-auto pr-1">
                                {notes &&
                                !taskInfo.ISLOGBOOK &&
                                notes.length > 0 ? (
                                    [...notes].reverse().map((note) => (
                                        <div
                                            key={note.ID}
                                            className={`flex justify-between gap-4`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {note.CREATEDBY ===
                                                    currentUserId &&
                                                    note.TYPE !==
                                                        "automatico" && (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <EditIcon
                                                                className="w-6 text-[var(--black)] hover:text-[var(--primary)] cursor-pointer transition-all duration-200"
                                                                onClick={() =>
                                                                    handleEditNote(
                                                                        note,
                                                                    )
                                                                }
                                                            />
                                                            <DeleteIcon
                                                                className="w-6 text-[var(--red)] hover:text-[var(--gray)] cursor-pointer transition-all duration-200"
                                                                onClick={() =>
                                                                    handleDeleteNote(
                                                                        note,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    )}

                                                <h3 className="text-sm text-[var(--gray)] truncate w-20">
                                                    {getUsernameById(
                                                        note.CREATEDBY,
                                                    )}
                                                    :
                                                </h3>
                                            </div>
                                            <div
                                                className={`flex-1 task-description text-sm text-[var(--gray)] bg-[var(--white)] p-2 border border-[var(--light-primary)] rounded-md overflow-hidden}`}
                                            >
                                                <div
                                                    className={`break-words whitespace-pre-wrap ${note.TYPE === "automatico" && "text-[var(--black)]"}`}
                                                >
                                                    {note.TYPE ===
                                                        "automatico" && (
                                                        <p className="text-[var(--primary)] italic mb-1">
                                                            [Sistema]
                                                        </p>
                                                    )}
                                                    {note.DESCRIPTION}
                                                </div>
                                                <span className="flex justify-end text-xs text-[var(--black)] mt-2">
                                                    {formatDateTime(
                                                        note.CREATEDDATE,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : noteLogbooks &&
                                  taskInfo.ISLOGBOOK &&
                                  noteLogbooks.length > 0 ? (
                                    [...noteLogbooks].reverse().map((note) => (
                                        <div
                                            key={note.ID}
                                            className="flex justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-2">
                                                {note.CREATEDBY ===
                                                    currentUserId &&
                                                    note.TYPE !==
                                                        "automatico" && (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <EditIcon
                                                                className="w-6 text-[var(--black)] hover:text-[var(--primary)] cursor-pointer transition-all duration-200"
                                                                onClick={() =>
                                                                    handleEditNote(
                                                                        note,
                                                                    )
                                                                }
                                                            />
                                                            <DeleteIcon
                                                                className="w-6 text-[var(--red)] hover:text-[var(--gray)] cursor-pointer transition-all duration-200"
                                                                onClick={() =>
                                                                    handleDeleteNote(
                                                                        note,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    )}

                                                <h3 className="text-sm text-[var(--gray)] truncate w-20">
                                                    {getUsernameById(
                                                        note.CREATEDBY,
                                                    )}
                                                    :
                                                </h3>
                                            </div>
                                            <div className="flex-1 task-description text-sm text-[var(--gray)] bg-[var(--white)] p-2 border border-[var(--light-primary)] rounded-md overflow-hidden">
                                                <div
                                                    className={`break-words whitespace-pre-wrap ${note.TYPE === "automatico" && "text-[var(--black)]"}`}
                                                >
                                                    {note.TYPE ===
                                                        "automatico" && (
                                                        <p className="text-[var(--primary)] italic mb-1">
                                                            [Sistema]
                                                        </p>
                                                    )}
                                                    {note.DESCRIPTION}
                                                </div>
                                                <span className="flex justify-end text-xs text-[var(--black)] mt-2">
                                                    {formatDateTime(
                                                        note.CREATEDDATE,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-[var(--gray)] italic">
                                        Nessuna nota disponibile
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 border-t border-[var(--light-primary)] pt-4">
                                <h3 className="text-sm text-[var(--gray)]">
                                    {editingNoteId
                                        ? "Modifica Nota"
                                        : "Aggiungi Nota"}
                                </h3>
                                <textarea
                                    className="w-full min-h-[100px] p-3 border border-[var(--light-primary)] rounded-md bg-[var(--white)] text-[var(--black)] resize-y focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                    placeholder="Inserisci il testo della nota qui..."
                                    value={noteDescription}
                                    onChange={(e) =>
                                        setNoteDescription(e.target.value)
                                    }
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-1 border-t border-[var(--light-primary)] pt-4 mt-4">
                                {editingNoteId ? (
                                    <button
                                        className="btn gray-btn"
                                        onClick={handleCancelEdit}
                                    >
                                        Annulla
                                    </button>
                                ) : (
                                    <button
                                        className="btn gray-btn"
                                        onClick={onClose}
                                    >
                                        Chiudi
                                    </button>
                                )}

                                <button
                                    className="btn"
                                    onClick={handleSaveNote}
                                    disabled={!noteDescription.trim()}
                                >
                                    <p>
                                        {editingNoteId
                                            ? "Modifica nota"
                                            : "Salva nota"}
                                    </p>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isModifyOpen && (
                <ModifyModal
                    onClose={handleCloseModify}
                    onSuccess={handleModifyPopup}
                    task={taskInfo}
                    isConverting={isConverting}
                    isDuplicating={isDuplicating}
                />
            )}

            {selectedPreviewImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setSelectedPreviewImage(null)}
                >
                    <div
                        className="max-w-4xl w-full max-h-[90vh] bg-[var(--bento-bg)] rounded-xl border border-[var(--light-primary)] p-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <p className="text-md text-[var(--black)] truncate">
                                {selectedPreviewImage.label}
                            </p>
                            <button
                                className="text-[var(--gray)] hover:text-[var(--black)]"
                                onClick={() => setSelectedPreviewImage(null)}
                            >
                                <CloseIcon className="w-6" />
                            </button>
                        </div>

                        <img
                            src={
                                selectedPreviewImage.sources[
                                    selectedPreviewImage.index
                                ]
                            }
                            onError={() => {
                                setSelectedPreviewImage((prev) => {
                                    if (!prev) {
                                        return prev;
                                    }

                                    if (prev.index >= prev.sources.length - 1) {
                                        return prev;
                                    }

                                    return {
                                        ...prev,
                                        index: prev.index + 1,
                                    };
                                });
                            }}
                            alt={selectedPreviewImage.label}
                            className="w-full max-h-[80vh] object-contain rounded-md bg-[var(--white)]"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DisplayModal;
