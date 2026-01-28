import { useState } from "react";
import CloseIcon from "../../assets/icons/close.tsx";
import TaskIcon from "../../assets/icons/tasks.tsx";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import UserIcon from "../../assets/icons/user.tsx";
import { useTasks } from "../data/provider/taskAPI/useTasks.js";
import { useNotes } from "../data/provider/noteAPI/useNotes.js";
import { useUsers } from "../data/provider/userAPI/useUsers.js";
import ModifyModal from "./ModifyModal.jsx";
import Splitter from "../../functions/SplitAssignedTo.jsx";

function DisplayModal({ taskInfo, onClose, onSuccess }) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isModifyOpen, setIsModifyOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("dettagli");
    const [noteDescription, setNoteDescription] = useState("");
    const { deleteTask, fetchTasks, updateTask } = useTasks();
    const { notes, fetchNotes, createNote } = useNotes();
    const { users, currentUserId } = useUsers();
    const { currentUserRole } = useUsers();

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

        const date = new Date(dateTimeString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} • ${hours}:${minutes}`;
    };

    const handleDelete = async () => {
        console.log(`Deleting task with ID: ${taskInfo.ID}`);

        const result = await deleteTask(taskInfo.ID);
        onClose();

        if (onSuccess) {
            await fetchTasks();

            onSuccess(
                result.success,
                `Task "${taskInfo.TITLE}" eliminata con successo`,
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

    const handleModify = () => {
        setIsModifyOpen(true);
    };

    const handleCloseModify = () => {
        setIsModifyOpen(false);
    };

    const handleModifyPopup = async () => {
        if (onSuccess) {
            await fetchTasks();
            const result = { success: true };
            onSuccess(
                result.success,
                `Task "${taskInfo.TITLE}" modificata con successo`,
            );
        }
    };

    const handleStatusChange = async (e) => {
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

        const result = await updateTask(taskInfo.ID, updatedTaskData);

        if (result.success) {
            await fetchTasks();

            const changeStatusNote = await createNote(
                taskInfo.ID,
                currentUserId,
                "Stato modificato da " +
                    `"${taskInfo.STATUS}" a "${newStatus}"`,
            );

            if (changeStatusNote.success) {
                setNoteDescription("");
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

        const result = await createNote(
            taskInfo.ID,
            currentUserId,
            noteDescription,
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
                        <TaskIcon className="w-6" />
                        <h1 className="text-xl">
                            Dettagli Task #{taskInfo.ID}
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
                                fetchNotes(taskInfo.ID);
                            }}
                        >
                            <p className="text-sm">Note aggiunte</p>
                        </div>
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
                                        {taskInfo.DESCRIPTION || "N/A"}
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
                                            <option value="Non iniziato">
                                                Non iniziato
                                            </option>
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

                                    <h4 className="text-sm text-center text-[var(--gray)] italic">
                                        Gli allegati sono in fase di sviluppo!
                                    </h4>

                                    {/*<div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 flex-wrap text-[var(--black)]">
                                            <div className="flex gap-2 bg-[var(--white)] border border-[var(--light-primary)] rounded-md p-2 hover:text-[var(--gray)] cursor-pointer transition-text duration-200">
                                                <div className="w-6 h-6 bg-[var(--light-primary)] rounded-md"></div>
                                                <p>2025-01-23.jpg</p>
                                            </div>
                                        </div>
                                    </div>*/}
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-[var(--light-primary)] pt-4 mt-4">
                                {(currentUserRole === "Admin" ||
                                    currentUserRole === "Shift Leader") && (
                                    <button
                                        className="btn delete"
                                        onClick={() => handleDelete()}
                                    >
                                        Elimina
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
                                        currentUserRole === "Shift Leader") && (
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
                                {notes && notes.length > 0 ? (
                                    [...notes].reverse().map((note) => (
                                        <div
                                            key={note.ID}
                                            className="flex justify-between gap-4"
                                        >
                                            <h3 className="text-sm text-[var(--gray)] truncate w-20">
                                                {getUsernameById(
                                                    note.CREATEDBY,
                                                )}
                                                :
                                            </h3>
                                            <div className="flex-1 task-description text-sm text-[var(--gray)] bg-[var(--white)] p-2 border border-[var(--light-primary)] rounded-md overflow-hidden">
                                                <p className="break-words whitespace-pre-wrap">
                                                    {note.DESCRIPTION}
                                                </p>
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
                                        Nessuna nota disponibile per questa task
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 border-t border-[var(--light-primary)] pt-4">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Aggiungi Nota
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
                                <button
                                    className="btn gray-btn"
                                    onClick={onClose}
                                >
                                    Chiudi
                                </button>

                                <button
                                    className="btn"
                                    onClick={handleSaveNote}
                                    disabled={!noteDescription.trim()}
                                >
                                    <p>Salva nota</p>
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
                />
            )}
        </div>
    );
}

export default DisplayModal;
