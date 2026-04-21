import { useEffect, useRef, useState } from "react";
import { PendingDeletionContext } from "./pendingDeletionContext";
import { useTasks } from "../taskAPI/useTasks";
import { useLogbooks } from "../logbookAPI/useLogbooks";
import { useUnavailableTasks } from "../unavailableTaskAPI/useUnavailableTasks";
import { useUnavailableLogbooks } from "../unavailableLogbookAPI/useUnavailableLogbooks";

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = "cae_pendingDeletions";
const DELAY_MS = 10 * 60 * 1000;

export const PendingDeletionProvider = ({ children }) => {
    const { fetchTasks } = useTasks();
    const { fetchLogbooks } = useLogbooks();
    const { fetchTasks: fetchUnavailableTasks } = useUnavailableTasks();
    const { fetchLogbooks: fetchUnavailableLogbooks } =
        useUnavailableLogbooks();

    const fetchTasksRef = useRef(fetchTasks);
    const fetchLogbooksRef = useRef(fetchLogbooks);
    const fetchUnavailableTasksRef = useRef(fetchUnavailableTasks);
    const fetchUnavailableLogbooksRef = useRef(fetchUnavailableLogbooks);

    useEffect(() => {
        fetchTasksRef.current = fetchTasks;
    }, [fetchTasks]);
    useEffect(() => {
        fetchLogbooksRef.current = fetchLogbooks;
    }, [fetchLogbooks]);
    useEffect(() => {
        fetchUnavailableTasksRef.current = fetchUnavailableTasks;
    }, [fetchUnavailableTasks]);
    useEffect(() => {
        fetchUnavailableLogbooksRef.current = fetchUnavailableLogbooks;
    }, [fetchUnavailableLogbooks]);

    const [pendingDeletions, setPendingDeletions] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });

    const timersRef = useRef({});

    const executeDeletion = async (id, isLogbook) => {
        try {
            if (!isLogbook) {
                const uvRes = await fetch(`${API_URL}/unavailableTask`);
                if (uvRes.ok) {
                    const uvTasks = await uvRes.json();
                    const related = uvTasks.filter(
                        (t) => Number(t.ORIGINAL_TASK_ID) === Number(id),
                    );
                    await Promise.all(
                        related.map((t) =>
                            fetch(
                                `${API_URL}/unavailableTask/${t.ID ?? t.id}`,
                                {
                                    method: "DELETE",
                                },
                            ),
                        ),
                    );
                }
                await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
            } else {
                const uvRes = await fetch(`${API_URL}/unavailableLogbook`);
                if (uvRes.ok) {
                    const uvLogbooks = await uvRes.json();
                    const related = uvLogbooks.filter(
                        (l) => Number(l.ORIGINAL_LOGBOOK_ID) === Number(id),
                    );
                    await Promise.all(
                        related.map((l) =>
                            fetch(
                                `${API_URL}/unavailableLogbook/${l.ID ?? l.id}`,
                                { method: "DELETE" },
                            ),
                        ),
                    );
                }
                await fetch(`${API_URL}/logbooks/${id}`, { method: "DELETE" });
            }
        } catch (err) {
            console.error("Error executing pending deletion:", err);
        }

        fetchTasksRef.current(true);
        fetchLogbooksRef.current(true);
        fetchUnavailableTasksRef.current(true);
        fetchUnavailableLogbooksRef.current(true);

        setPendingDeletions((prev) => {
            const next = { ...prev };
            delete next[String(id)];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
        });
    };

    // Restore timers on mount for any pending deletions saved in localStorage
    useEffect(() => {
        const now = Date.now();
        Object.entries(pendingDeletions).forEach(
            ([idStr, { isLogbook, scheduledAt }]) => {
                const remaining = scheduledAt + DELAY_MS - now;
                if (remaining <= 0) {
                    executeDeletion(Number(idStr), isLogbook);
                } else {
                    timersRef.current[idStr] = setTimeout(() => {
                        executeDeletion(Number(idStr), isLogbook);
                    }, remaining);
                }
            },
        );

        return () => {
            Object.values(timersRef.current).forEach(clearTimeout);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const scheduleDelete = (id, isLogbook) => {
        const idStr = String(id);
        const scheduledAt = Date.now();

        if (timersRef.current[idStr]) clearTimeout(timersRef.current[idStr]);

        setPendingDeletions((prev) => {
            const next = { ...prev, [idStr]: { isLogbook, scheduledAt } };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
        });

        timersRef.current[idStr] = setTimeout(() => {
            executeDeletion(Number(id), isLogbook);
        }, DELAY_MS);
    };

    const cancelDelete = (id) => {
        const idStr = String(id);
        clearTimeout(timersRef.current[idStr]);
        delete timersRef.current[idStr];

        setPendingDeletions((prev) => {
            const next = { ...prev };
            delete next[idStr];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
        });
    };

    const isPendingDeletion = (id) => String(id) in pendingDeletions;

    const getDeleteTime = (id) => {
        const entry = pendingDeletions[String(id)];
        return entry ? entry.scheduledAt + DELAY_MS : null;
    };

    return (
        <PendingDeletionContext.Provider
            value={{
                scheduleDelete,
                cancelDelete,
                isPendingDeletion,
                getDeleteTime,
            }}
        >
            {children}
        </PendingDeletionContext.Provider>
    );
};
