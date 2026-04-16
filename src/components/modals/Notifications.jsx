import { useState, useEffect, useRef } from "react";
import BellIcon from "../../assets/icons/chat.tsx";
import CloseIcon from "../../assets/icons/close.tsx";
import LongArrowIcon from "../../assets/icons/long-arrow.tsx";
import SendIcon from "../../assets/icons/send.tsx";
import { GetColorForShift } from "../../functions/GetColorPerShift.jsx";
import { useUsers } from "../data/provider/userAPI/useUsers";
import { useEmployeeMessages } from "../data/provider/employeeMessageAPI/useEmployeeMessages";
import { useGroupChat } from "../data/provider/groupChatAPI/useGroupChat";
import ArrowLeftIcon from "../../assets/icons/arrow-left.tsx";
import DeleteIcon from "../../assets/icons/delete.tsx";

// view: "list" | "create-group" | "chat" | "group-chat" | "manage-members"

function Notifications({ onClose }) {
    const [view, setView] = useState("list");

    // 1-on-1 chat
    const [selectedReceiver, setSelectedReceiver] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [usersWithUnreadMessages, setUsersWithUnreadMessages] = useState([]);

    // Group chat
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupMessages, setGroupMessages] = useState([]);
    const [groupsWithUnread, setGroupsWithUnread] = useState([]);
    const [groupLatestUnread, setGroupLatestUnread] = useState({});

    // Create group
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);

    // Shared
    const [emptyText, setEmptyText] = useState("");
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
    const messagesEndRef = useRef(null);
    const previousReceiverRef = useRef(null);
    const previousGroupRef = useRef(null);

    const { users, currentUserId, currentUserRole } = useUsers();
    const { fetchUserMessages, sendMessage, markAsRead, fetchUnreadCount } =
        useEmployeeMessages();
    const {
        createGroup,
        fetchUserGroups,
        fetchGroupMessages,
        sendGroupMessage,
        markGroupAsRead,
        fetchGroupUnreadCount,
        deleteGroup,
        addGroupMember,
        removeGroupMember,
        fetchGroupUnreadTotal,
    } = useGroupChat();

    const canCreateGroup =
        currentUserRole === "Admin" || currentUserRole === "Shift Leader";

    const otherUsers = users.filter((u) => u.ID !== currentUserId);

    // ─── Scroll ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (shouldScrollToBottom && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
            });
            setTimeout(() => setShouldScrollToBottom(false), 100);
        }
    }, [shouldScrollToBottom]);

    // ─── Helpers ───────────────────────────────────────────────────────────────
    const refreshUnreadSenders = async () => {
        if (!currentUserId) return;
        const result = await fetchUserMessages(currentUserId);
        if (result.success) {
            const unreadSenderIds = result.data
                .filter(
                    (msg) => msg.RECEIVER_ID === currentUserId && !msg.IS_READ,
                )
                .map((msg) => msg.SENDER_ID);
            setUsersWithUnreadMessages([...new Set(unreadSenderIds)]);
        }
    };

    const refreshGroupUnreads = async (groupList) => {
        if (!currentUserId || !groupList?.length) return;
        const unreadGroupIds = [];
        const latestMap = {};
        for (const g of groupList) {
            const res = await fetchGroupUnreadCount(g.ID, currentUserId);
            if (res.success && res.count > 0) {
                unreadGroupIds.push(g.ID);
                if (res.latestMessage) latestMap[g.ID] = res.latestMessage;
            }
        }
        setGroupsWithUnread(unreadGroupIds);
        setGroupLatestUnread(latestMap);
    };

    const loadGroups = async () => {
        if (!currentUserId) return;
        const res = await fetchUserGroups(currentUserId);
        if (res.success) {
            setGroups(res.data);
            await refreshGroupUnreads(res.data);
        }
    };

    // ─── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        refreshUnreadSenders();
        loadGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId]);

    // ─── Load 1-on-1 messages when receiver changes ────────────────────────────
    useEffect(() => {
        if (view !== "chat" || !selectedReceiver || !currentUserId) return;

        const load = async () => {
            const isNew =
                previousReceiverRef.current?.ID !== selectedReceiver.ID;
            const result = await fetchUserMessages(currentUserId);
            if (!result.success) return;

            const filtered = result.data
                .filter(
                    (msg) =>
                        (msg.SENDER_ID === currentUserId &&
                            msg.RECEIVER_ID === selectedReceiver.ID) ||
                        (msg.RECEIVER_ID === currentUserId &&
                            msg.SENDER_ID === selectedReceiver.ID),
                )
                .sort((a, b) => new Date(a.DATE_SENT) - new Date(b.DATE_SENT));

            setChatMessages(filtered);
            if (isNew) {
                setShouldScrollToBottom(true);
                previousReceiverRef.current = selectedReceiver;
            }

            const unread = filtered.filter(
                (msg) => msg.RECEIVER_ID === currentUserId && !msg.IS_READ,
            );
            for (const msg of unread) await markAsRead(msg.ID);
            if (unread.length > 0) {
                await fetchUnreadCount(currentUserId);
                await refreshUnreadSenders();
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedReceiver, currentUserId, view]);

    // ─── Load group messages when group changes ────────────────────────────────
    useEffect(() => {
        if (view !== "group-chat" || !selectedGroup || !currentUserId) return;

        const load = async () => {
            const isNew = previousGroupRef.current?.ID !== selectedGroup.ID;
            const result = await fetchGroupMessages(selectedGroup.ID);
            if (!result.success) return;

            setGroupMessages(result.data);
            if (isNew) {
                setShouldScrollToBottom(true);
                previousGroupRef.current = selectedGroup;
            }

            await markGroupAsRead(selectedGroup.ID, currentUserId);
            await refreshGroupUnreads(groups);
            await fetchGroupUnreadTotal(currentUserId);
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGroup, currentUserId, view]);

    // ─── Polling ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (view !== "chat" || !selectedReceiver || !currentUserId) return;

        const poll = async () => {
            const result = await fetchUserMessages(currentUserId);
            if (!result.success) return;
            const filtered = result.data
                .filter(
                    (msg) =>
                        (msg.SENDER_ID === currentUserId &&
                            msg.RECEIVER_ID === selectedReceiver.ID) ||
                        (msg.RECEIVER_ID === currentUserId &&
                            msg.SENDER_ID === selectedReceiver.ID),
                )
                .sort((a, b) => new Date(a.DATE_SENT) - new Date(b.DATE_SENT));

            if (JSON.stringify(filtered) !== JSON.stringify(chatMessages)) {
                setChatMessages(filtered);
                const unread = filtered.filter(
                    (msg) => msg.RECEIVER_ID === currentUserId && !msg.IS_READ,
                );
                if (unread.length > 0) {
                    for (const msg of unread) await markAsRead(msg.ID);
                    await fetchUnreadCount(currentUserId);
                    await refreshUnreadSenders();
                }
            }
        };

        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedReceiver, currentUserId, chatMessages, view]);

    useEffect(() => {
        if (view !== "group-chat" || !selectedGroup || !currentUserId) return;

        const poll = async () => {
            const result = await fetchGroupMessages(selectedGroup.ID);
            if (!result.success) return;
            if (JSON.stringify(result.data) !== JSON.stringify(groupMessages)) {
                setGroupMessages(result.data);
                await markGroupAsRead(selectedGroup.ID, currentUserId);
                await refreshGroupUnreads(groups);
                await fetchGroupUnreadTotal(currentUserId);
            }
        };

        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGroup, currentUserId, groupMessages, view]);

    // ─── Formatters ────────────────────────────────────────────────────────────
    const formatUsername = (username) => {
        if (!username) return "";
        const parts = username.split(".");
        let formatted = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        if (parts[1])
            formatted +=
                " " + parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        return formatted;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const value = String(dateString).trim();
        const match = value.match(
            /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?$/,
        );
        if (match) {
            const [, year, month, day, hour, minute] = match;
            const weekday = new Date(
                Number(year),
                Number(month) - 1,
                Number(day),
            ).toLocaleDateString("it-IT", { weekday: "long" });
            return `${weekday} ${day}/${month}/${year}, ${hour}:${minute}`;
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString("it-IT", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    const renderMessageContent = (messageContent) => {
        if (typeof messageContent !== "string") return <p>{messageContent}</p>;

        const shiftChangeMatch = messageContent.match(
            /^(.*?)(Turno precedente:\s*([A-Z]{1,3}|--)\s*->\s*Turno nuovo:\s*([A-Z]{1,3}|--))(.*)$/i,
        );

        if (!shiftChangeMatch) {
            return (
                <p className="whitespace-pre-wrap break-words">
                    {messageContent}
                </p>
            );
        }

        const [, beforeText, , previousShiftRaw, newShiftRaw, afterText] =
            shiftChangeMatch;
        const previousShift = previousShiftRaw.toUpperCase();
        const newShift = newShiftRaw.toUpperCase();
        const before = beforeText.replace(/\s*\|\s*$/, "").trim();
        const after = afterText.trim();

        const shiftBadge = (shift) => {
            let shiftColors = GetColorForShift(shift);
            if (shift === "R" || shift === "FND")
                shiftColors = shiftColors.replace(/text-[^\s]+/g, "text-black");
            return (
                <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold ${shiftColors}`}
                >
                    {shift}
                </span>
            );
        };

        return (
            <div className="flex flex-col gap-2">
                {before && (
                    <p className="whitespace-pre-wrap break-words text-sm">
                        {before}
                    </p>
                )}
                <div className="flex flex-wrap items-center gap-2 rounded-md bg-[var(--light-primary)] p-2">
                    <span className="text-sm text-[var(--gray)]">
                        Turno precedente:
                    </span>
                    {shiftBadge(previousShift)}
                    <LongArrowIcon className="w-6 text-[var(--gray)]" />
                    <span className="text-sm text-[var(--gray)]">
                        Turno nuovo:
                    </span>
                    {shiftBadge(newShift)}
                </div>
                {after && (
                    <p className="whitespace-pre-wrap break-words text-sm">
                        {after}
                    </p>
                )}
            </div>
        );
    };

    // ─── Handlers ──────────────────────────────────────────────────────────────
    const handleBack = () => {
        if (view === "manage-members") {
            setView("group-chat");
            return;
        }
        setSelectedReceiver(null);
        setSelectedGroup(null);
        setChatMessages([]);
        setGroupMessages([]);
        setEmptyText("");
        previousReceiverRef.current = null;
        previousGroupRef.current = null;
        setView("list");
    };

    const handleSendMessage = async () => {
        if (!emptyText.trim()) return;

        if (view === "chat" && selectedReceiver) {
            const result = await sendMessage(
                currentUserId,
                selectedReceiver.ID,
                emptyText,
            );
            if (result.success) {
                setEmptyText("");
                const res = await fetchUserMessages(currentUserId);
                if (res.success) {
                    const filtered = res.data
                        .filter(
                            (msg) =>
                                (msg.SENDER_ID === currentUserId &&
                                    msg.RECEIVER_ID === selectedReceiver.ID) ||
                                (msg.RECEIVER_ID === currentUserId &&
                                    msg.SENDER_ID === selectedReceiver.ID),
                        )
                        .sort(
                            (a, b) =>
                                new Date(a.DATE_SENT) - new Date(b.DATE_SENT),
                        );
                    setChatMessages(filtered);
                    setShouldScrollToBottom(true);
                    const unread = filtered.filter(
                        (msg) =>
                            msg.RECEIVER_ID === currentUserId && !msg.IS_READ,
                    );
                    for (const msg of unread) await markAsRead(msg.ID);
                    if (unread.length > 0) {
                        await fetchUnreadCount(currentUserId);
                        await refreshUnreadSenders();
                    }
                }
            }
        } else if (view === "group-chat" && selectedGroup) {
            const result = await sendGroupMessage(
                selectedGroup.ID,
                currentUserId,
                emptyText,
            );
            if (result.success) {
                setEmptyText("");
                const res = await fetchGroupMessages(selectedGroup.ID);
                if (res.success) {
                    setGroupMessages(res.data);
                    setShouldScrollToBottom(true);
                }
            }
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || selectedMemberIds.length === 0) return;
        const result = await createGroup(
            newGroupName.trim(),
            currentUserId,
            selectedMemberIds,
        );
        if (result.success) {
            setNewGroupName("");
            setSelectedMemberIds([]);
            setView("list");
            await loadGroups();
        }
    };

    const reloadGroupsAndSync = async () => {
        if (!currentUserId) return;
        const res = await fetchUserGroups(currentUserId);
        if (res.success) {
            setGroups(res.data);
            await refreshGroupUnreads(res.data);
            if (selectedGroup) {
                const updated = res.data.find((g) => g.ID === selectedGroup.ID);
                if (updated) setSelectedGroup(updated);
            }
        }
    };

    const handleAddMember = async (userId) => {
        if (!selectedGroup) return;
        await addGroupMember(selectedGroup.ID, userId);
        await reloadGroupsAndSync();
    };

    const handleRemoveMember = async (userId) => {
        if (!selectedGroup) return;
        await removeGroupMember(selectedGroup.ID, userId);
        await reloadGroupsAndSync();
    };

    const toggleMember = (userId) => {
        setSelectedMemberIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId],
        );
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    const chatTitle =
        view === "chat"
            ? formatUsername(selectedReceiver?.Username ?? "")
            : view === "group-chat"
              ? (selectedGroup?.NAME ?? "")
              : "";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm cursor-default flex items-center justify-center z-50">
            <div
                className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full mx-4 shadow-xl border border-[var(--light-primary)] flex flex-col"
                style={{ maxHeight: "80vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-[var(--light-primary)] pb-4 mb-4 flex-shrink-0">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)]">
                        <BellIcon className="w-6" />
                        <h1 className="text-xl">Chat</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--gray)] hover:text-[var(--black)] text-2xl font-bold"
                    >
                        <CloseIcon className="w-6" />
                    </button>
                </div>

                {/* ── LIST VIEW ─────────────────────────────────────────────── */}
                {view === "list" && (
                    <>
                        {canCreateGroup && (
                            <div className="flex justify-end mb-4 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setView("create-group")}
                                    className="btn flex items-center gap-2 text-sm"
                                >
                                    Crea gruppo
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 min-h-0">
                            {/* Groups section */}
                            {groups.length > 0 && (
                                <>
                                    <p className="text-xs text-[var(--gray)] uppercase tracking-wide mb-1">
                                        Gruppi
                                    </p>
                                    {groups.map((group) => {
                                        const hasUnread =
                                            groupsWithUnread.includes(group.ID);
                                        return (
                                            <div
                                                key={group.ID}
                                                className="group/row flex items-center gap-2 w-full p-3 rounded-md border border-[var(--light-primary)] bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--primary)] transition-all duration-200 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedGroup(group);
                                                    setView("group-chat");
                                                }}
                                            >
                                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                                    <span className="text-[var(--black)] text-sm font-medium">
                                                        {group.NAME}
                                                    </span>
                                                    {hasUnread && groupLatestUnread[group.ID] ? (
                                                        <span className="text-xs text-[var(--black)] truncate font-medium">
                                                            {formatUsername(groupLatestUnread[group.ID].senderUsername)}:{" "}
                                                            {groupLatestUnread[group.ID].content}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-[var(--gray)] truncate">
                                                            {group.MEMBERS?.map(
                                                                (m) =>
                                                                    formatUsername(
                                                                        m.Username,
                                                                    ),
                                                            ).join(", ")}
                                                        </span>
                                                    )}
                                                </div>

                                                {hasUnread && (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--red)] flex-shrink-0" />
                                                )}

                                                {canCreateGroup && (
                                                    <button
                                                        type="button"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            await deleteGroup(
                                                                group.ID,
                                                            );
                                                            await loadGroups();
                                                        }}
                                                        className="opacity-0 group-hover/row:opacity-100 flex-shrink-0 p-1 rounded text-[var(--red)] transition-all duration-150"
                                                    >
                                                        <DeleteIcon className="w-6" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <div className="border-t border-[var(--light-primary)] my-2" />
                                    <p className="text-xs text-[var(--gray)] uppercase tracking-wide mb-1">
                                        Chat dirette
                                    </p>
                                </>
                            )}

                            {/* Individual users */}
                            {otherUsers.length === 0 && (
                                <p className="text-[var(--gray)] text-sm text-center py-4">
                                    Nessun utente disponibile
                                </p>
                            )}
                            {otherUsers.map((user) => {
                                const hasUnread =
                                    usersWithUnreadMessages.includes(user.ID);
                                return (
                                    <button
                                        key={user.ID}
                                        type="button"
                                        onClick={() => {
                                            setSelectedReceiver(user);
                                            setView("chat");
                                        }}
                                        className="flex items-center justify-between w-full p-3 rounded-md border border-[var(--light-primary)] bg-[var(--white)] hover:bg-[var(--light-primary)] hover:border-[var(--primary)] transition-all duration-200 cursor-pointer text-left"
                                    >
                                        <span className="text-[var(--black)] text-sm font-medium">
                                            {formatUsername(user.Username)}
                                        </span>
                                        {hasUnread && (
                                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--red)] flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* ── CREATE GROUP VIEW ─────────────────────────────────────── */}
                {view === "create-group" && (
                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 min-h-0">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[var(--gray)]">
                                    Nome del gruppo
                                </label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) =>
                                        setNewGroupName(e.target.value)
                                    }
                                    placeholder="Es. Team Mattina"
                                    className="p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] text-[var(--black)] focus:outline-[var(--gray)] transition-all duration-200"
                                />
                            </div>

                            <p className="text-xs text-[var(--gray)] uppercase tracking-wide">
                                Seleziona membri
                            </p>

                            {otherUsers.map((user) => {
                                const checked = selectedMemberIds.includes(
                                    user.ID,
                                );
                                return (
                                    <button
                                        key={user.ID}
                                        type="button"
                                        onClick={() => toggleMember(user.ID)}
                                        className={`flex items-center justify-between w-full p-3 rounded-md border transition-all duration-200 cursor-pointer text-left ${
                                            checked
                                                ? "border-[var(--primary)] bg-[var(--light-primary)]"
                                                : "border-[var(--light-primary)] bg-[var(--white)] hover:bg-[var(--light-primary)]"
                                        }`}
                                    >
                                        <span className="text-[var(--black)] text-sm font-medium">
                                            {formatUsername(user.Username)}
                                        </span>
                                        <span
                                            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                                checked
                                                    ? "border-[var(--primary)] bg-[var(--primary)]"
                                                    : "border-[var(--gray)]"
                                            }`}
                                        >
                                            {checked && (
                                                <svg
                                                    className="w-2.5 h-2.5 text-white"
                                                    fill="none"
                                                    viewBox="0 0 10 8"
                                                >
                                                    <path
                                                        d="M1 4l3 3 5-6"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Fixed bottom actions */}
                        <div className="flex gap-2 pt-4 mt-4 border-t border-[var(--light-primary)] flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    setNewGroupName("");
                                    setSelectedMemberIds([]);
                                    setView("list");
                                }}
                                className="flex-1 p-2 border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:bg-[var(--light-primary)] text-[var(--black)] text-sm transition-all duration-200"
                            >
                                Annulla
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateGroup}
                                disabled={
                                    !newGroupName.trim() ||
                                    selectedMemberIds.length === 0
                                }
                                className={`flex-1 btn text-sm ${
                                    !newGroupName.trim() ||
                                    selectedMemberIds.length === 0
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                Crea
                            </button>
                        </div>
                    </div>
                )}

                {/* ── CHAT VIEW (1-on-1 & group) ────────────────────────────── */}
                {(view === "chat" || view === "group-chat") && (
                    <>
                        <div className="flex flex-col gap-8 overflow-y-auto pr-1 flex-1 min-h-0">
                            {(view === "chat"
                                ? chatMessages
                                : groupMessages
                            ).map((msg, index) => {
                                const isMine = msg.SENDER_ID === currentUserId;
                                const senderName =
                                    view === "group-chat"
                                        ? formatUsername(
                                              msg.SenderUsername ?? "",
                                          )
                                        : isMine
                                          ? "Tu"
                                          : formatUsername(
                                                selectedReceiver?.Username ??
                                                    "",
                                            );

                                return (
                                    <div
                                        key={index}
                                        className={`flex flex-col gap-2 w-3/4 ${isMine ? "self-end items-end" : ""}`}
                                    >
                                        <h1 className="text-md text-[var(--gray)]">
                                            {isMine ? "Tu:" : `${senderName}:`}
                                        </h1>
                                        <div className="text-md text-[var(--black)] w-full border border-[var(--light-primary)] rounded-md p-2">
                                            {renderMessageContent(
                                                msg.MESSAGE_CONTENT,
                                            )}
                                            <p
                                                className={`text-xs text-[var(--gray)] mt-1 ${isMine ? "text-right" : "text-left"}`}
                                            >
                                                {formatDate(msg.DATE_SENT)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            {view === "chat" && chatMessages.length === 0 && (
                                <div className="flex items-center justify-center py-8">
                                    <p className="text-[var(--gray)]">
                                        Nessun messaggio in questa chat
                                    </p>
                                </div>
                            )}
                            {view === "group-chat" &&
                                groupMessages.length === 0 && (
                                    <div className="flex items-center justify-center py-8">
                                        <p className="text-[var(--gray)]">
                                            Nessun messaggio in questo gruppo
                                        </p>
                                    </div>
                                )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Send input */}
                        <div className="flex gap-2 pt-4 mt-4 flex-shrink-0">
                            <input
                                type="text"
                                className="w-full h-[44px] p-3 border border-[var(--light-primary)] rounded-md bg-[var(--white)] text-[var(--black)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                placeholder="Scrivi qui..."
                                value={emptyText}
                                onChange={(e) => setEmptyText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && emptyText)
                                        handleSendMessage();
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                className={`btn flex gap-2 items-center h-[44px] ${emptyText ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                                disabled={!emptyText}
                            >
                                <SendIcon className="w-6" />
                                Invia
                            </button>
                        </div>

                        {/* Back + title */}
                        <div className="flex items-center gap-4 pt-4 mt-4 border-t border-[var(--light-primary)] flex-shrink-0">
                            <div
                                onClick={handleBack}
                                className="flex gap-2 items-center border border-[var(--light-primary)] bg-[var(--white)] hover:bg-[var(--light-primary)] hover:text-[var(--primary)] transition rounded-md p-2 cursor-pointer"
                            >
                                <ArrowLeftIcon className="w-6" />
                            </div>
                            <h1 className="text-lg text-[var(--black)] flex-1">
                                {chatTitle}
                            </h1>
                            {view === "group-chat" && canCreateGroup && (
                                <button
                                    type="button"
                                    onClick={() => setView("manage-members")}
                                    className="text-xs border border-[var(--light-primary)] bg-[var(--white)] hover:bg-[var(--light-primary)] hover:text-[var(--primary)] transition rounded-md px-3 py-2 flex-shrink-0"
                                >
                                    Gestisci membri
                                </button>
                            )}
                        </div>
                    </>
                )}
                {/* ── MANAGE MEMBERS VIEW ──────────────────────────────────── */}
                {view === "manage-members" && selectedGroup && (
                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1 min-h-0">
                            {/* Current members */}
                            <div>
                                <p className="text-xs text-[var(--gray)] uppercase tracking-wide mb-2">
                                    Membri attuali
                                </p>
                                <div className="flex flex-col gap-2">
                                    {(selectedGroup.MEMBERS ?? []).map((member) => (
                                        <div
                                            key={member.ID}
                                            className="flex items-center justify-between w-full p-3 rounded-md border border-[var(--light-primary)] bg-[var(--white)]"
                                        >
                                            <span className="text-[var(--black)] text-sm font-medium">
                                                {formatUsername(member.Username)}
                                            </span>
                                            {member.ID !== currentUserId && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(member.ID)}
                                                    className="text-xs text-[var(--red)] border border-[var(--red)] rounded-md px-2 py-1 hover:bg-[var(--red)] hover:text-white transition-all duration-150"
                                                >
                                                    Rimuovi
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Users not in group */}
                            {(() => {
                                const memberIds = new Set((selectedGroup.MEMBERS ?? []).map((m) => m.ID));
                                const nonMembers = users.filter((u) => !memberIds.has(u.ID));
                                if (nonMembers.length === 0) return null;
                                return (
                                    <div>
                                        <p className="text-xs text-[var(--gray)] uppercase tracking-wide mb-2">
                                            Aggiungi utenti
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            {nonMembers.map((user) => (
                                                <div
                                                    key={user.ID}
                                                    className="flex items-center justify-between w-full p-3 rounded-md border border-[var(--light-primary)] bg-[var(--white)]"
                                                >
                                                    <span className="text-[var(--black)] text-sm font-medium">
                                                        {formatUsername(user.Username)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddMember(user.ID)}
                                                        className="text-xs text-[var(--primary)] border border-[var(--primary)] rounded-md px-2 py-1 hover:bg-[var(--primary)] hover:text-white transition-all duration-150"
                                                    >
                                                        Aggiungi
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Back */}
                        <div className="flex items-center gap-4 pt-4 mt-4 border-t border-[var(--light-primary)] flex-shrink-0">
                            <div
                                onClick={handleBack}
                                className="flex gap-2 items-center border border-[var(--light-primary)] bg-[var(--white)] hover:bg-[var(--light-primary)] hover:text-[var(--primary)] transition rounded-md p-2 cursor-pointer"
                            >
                                <ArrowLeftIcon className="w-6" />
                            </div>
                            <h1 className="text-lg text-[var(--black)]">
                                {selectedGroup.NAME}
                            </h1>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notifications;
