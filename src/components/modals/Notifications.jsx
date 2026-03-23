import { useState, useEffect, useRef } from "react";
import BellIcon from "../../assets/icons/bell.tsx";
import CloseIcon from "../../assets/icons/close.tsx";
import LongArrowIcon from "../../assets/icons/long-arrow.tsx";
import SendIcon from "../../assets/icons/send.tsx";
import { GetColorForShift } from "../../functions/GetColorPerShift.jsx";
import { useUsers } from "../data/provider/userAPI/useUsers";
import { useEmployeeMessages } from "../data/provider/employeeMessageAPI/useEmployeeMessages";
import ArrowRightIcon from "../../assets/icons/arrow-right.tsx";
import ArrowLeftIcon from "../../assets/icons/arrow-left.tsx";

function Notifications({ onClose }) {
    const [emptyText, setEmptyText] = useState("");
    const [selectedReceiver, setSelectedReceiver] = useState("");
    const [selectedSender, setSelectedSender] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [usersWithUnreadMessages, setUsersWithUnreadMessages] = useState([]);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
    const messagesEndRef = useRef(null);
    const previousSelectionRef = useRef({ receiver: "", sender: "" });
    const { currentUserRole, users, currentUserId, currentUsername } =
        useUsers();
    const { fetchUserMessages, sendMessage, markAsRead, fetchUnreadCount } =
        useEmployeeMessages();

    const isAdmin = currentUserRole === "Admin";
    const isEmployee =
        currentUserRole === "Employee" || currentUserRole === "Shift Leader";

    // Scroll to bottom when shouldScrollToBottom flag is set
    useEffect(() => {
        if (shouldScrollToBottom && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
            });
            // Reset the flag after a small delay to avoid cascading renders
            setTimeout(() => setShouldScrollToBottom(false), 100);
        }
    }, [shouldScrollToBottom]);

    // Fetch unread messages to highlight users in dropdowns
    useEffect(() => {
        const fetchUnreadSenders = async () => {
            if (isEmployee && currentUserId) {
                // For Employee/Shift Leader: get users who sent unread messages to current user
                const result = await fetchUserMessages(currentUserId);
                if (result.success) {
                    const unreadSenderIds = result.data
                        .filter(
                            (msg) =>
                                msg.RECEIVER_ID === currentUserId &&
                                !msg.IS_READ,
                        )
                        .map((msg) => msg.SENDER_ID);
                    const uniqueSenderIds = [...new Set(unreadSenderIds)];
                    const unreadUsernames = users
                        .filter((u) => uniqueSenderIds.includes(u.ID))
                        .map((u) => u.Username);
                    setUsersWithUnreadMessages(unreadUsernames);
                }
            } else if (isAdmin && selectedReceiver) {
                // For Admin: get users who sent unread messages to selected receiver
                const receiverUser = users.find(
                    (u) => u.Username === selectedReceiver,
                );
                if (!receiverUser) return;

                const result = await fetchUserMessages(receiverUser.ID);
                if (result.success) {
                    const unreadSenderIds = result.data
                        .filter(
                            (msg) =>
                                msg.RECEIVER_ID === receiverUser.ID &&
                                !msg.IS_READ,
                        )
                        .map((msg) => msg.SENDER_ID);
                    const uniqueSenderIds = [...new Set(unreadSenderIds)];
                    const unreadUsernames = users
                        .filter((u) => uniqueSenderIds.includes(u.ID))
                        .map((u) => u.Username);
                    setUsersWithUnreadMessages(unreadUsernames);
                }
            }
        };

        fetchUnreadSenders();
    }, [
        currentUserId,
        isEmployee,
        isAdmin,
        selectedReceiver,
        users,
        fetchUserMessages,
    ]);

    // Fetch messages when users are selected
    useEffect(() => {
        const loadMessages = async () => {
            // Check if selection has changed
            const selectionChanged =
                previousSelectionRef.current.receiver !== selectedReceiver ||
                previousSelectionRef.current.sender !== selectedSender;

            if (isEmployee && selectedReceiver) {
                // For Employee/Shift Leader: fetch chat between current user and selected user
                const receiverUser = users.find(
                    (u) => u.Username === selectedReceiver,
                );
                if (!receiverUser || !currentUserId) return;

                const result = await fetchUserMessages(currentUserId);
                if (result.success) {
                    // Filter messages to only show between current user and selected user
                    const filtered = result.data
                        .filter(
                            (msg) =>
                                (msg.SENDER_ID === currentUserId &&
                                    msg.RECEIVER_ID === receiverUser.ID) ||
                                (msg.RECEIVER_ID === currentUserId &&
                                    msg.SENDER_ID === receiverUser.ID),
                        )
                        .sort(
                            (a, b) =>
                                new Date(a.DATE_SENT) - new Date(b.DATE_SENT),
                        );
                    setChatMessages(filtered);

                    // Only scroll to bottom if this is a new chat selection
                    if (selectionChanged) {
                        setShouldScrollToBottom(true);
                        previousSelectionRef.current = {
                            receiver: selectedReceiver,
                            sender: "",
                        };
                    }

                    // Mark unread messages as read (where current user is receiver)
                    const unreadMessages = filtered.filter(
                        (msg) =>
                            msg.RECEIVER_ID === currentUserId && !msg.IS_READ,
                    );
                    for (const msg of unreadMessages) {
                        await markAsRead(msg.ID);
                    }

                    // Refresh unread count and update dropdown indicators
                    if (unreadMessages.length > 0) {
                        await fetchUnreadCount(currentUserId);

                        // Refresh unread senders list
                        const result = await fetchUserMessages(currentUserId);
                        if (result.success) {
                            const unreadSenderIds = result.data
                                .filter(
                                    (msg) =>
                                        msg.RECEIVER_ID === currentUserId &&
                                        !msg.IS_READ,
                                )
                                .map((msg) => msg.SENDER_ID);
                            const uniqueSenderIds = [
                                ...new Set(unreadSenderIds),
                            ];
                            const unreadUsernames = users
                                .filter((u) => uniqueSenderIds.includes(u.ID))
                                .map((u) => u.Username);
                            setUsersWithUnreadMessages(unreadUsernames);
                        }
                    }
                }
            } else if (isAdmin && selectedReceiver && selectedSender) {
                // For Admin: fetch chat between selected sender and receiver
                const receiverUser = users.find(
                    (u) => u.Username === selectedReceiver,
                );
                const senderUser = users.find(
                    (u) => u.Username === selectedSender,
                );
                if (!receiverUser || !senderUser) return;

                const result = await fetchUserMessages(receiverUser.ID);
                if (result.success) {
                    // Filter messages to only show between selected sender and receiver
                    const filtered = result.data
                        .filter(
                            (msg) =>
                                (msg.SENDER_ID === senderUser.ID &&
                                    msg.RECEIVER_ID === receiverUser.ID) ||
                                (msg.RECEIVER_ID === senderUser.ID &&
                                    msg.SENDER_ID === receiverUser.ID),
                        )
                        .sort(
                            (a, b) =>
                                new Date(a.DATE_SENT) - new Date(b.DATE_SENT),
                        );
                    setChatMessages(filtered);

                    // Only scroll to bottom if this is a new chat selection
                    if (selectionChanged) {
                        setShouldScrollToBottom(true);
                        previousSelectionRef.current = {
                            receiver: selectedReceiver,
                            sender: selectedSender,
                        };
                    }
                }
            }
        };

        loadMessages();
    }, [
        selectedReceiver,
        selectedSender,
        currentUserId,
        isAdmin,
        isEmployee,
        fetchUserMessages,
        users,
        markAsRead,
        fetchUnreadCount,
    ]);

    // Auto-refresh messages when chat is open (every 5 seconds)
    useEffect(() => {
        const showChat = isEmployee
            ? selectedReceiver
            : selectedReceiver && selectedSender;

        if (!showChat) return;

        const pollMessages = async () => {
            if (isEmployee && selectedReceiver) {
                const receiverUser = users.find(
                    (u) => u.Username === selectedReceiver,
                );
                if (!receiverUser || !currentUserId) return;

                const result = await fetchUserMessages(currentUserId);
                if (result.success) {
                    const filtered = result.data
                        .filter(
                            (msg) =>
                                (msg.SENDER_ID === currentUserId &&
                                    msg.RECEIVER_ID === receiverUser.ID) ||
                                (msg.RECEIVER_ID === currentUserId &&
                                    msg.SENDER_ID === receiverUser.ID),
                        )
                        .sort(
                            (a, b) =>
                                new Date(a.DATE_SENT) - new Date(b.DATE_SENT),
                        );

                    // Only update if messages have changed
                    if (
                        JSON.stringify(filtered) !==
                        JSON.stringify(chatMessages)
                    ) {
                        setChatMessages(filtered);

                        // Mark any new unread messages as read
                        const unreadMessages = filtered.filter(
                            (msg) =>
                                msg.RECEIVER_ID === currentUserId &&
                                !msg.IS_READ,
                        );
                        if (unreadMessages.length > 0) {
                            for (const msg of unreadMessages) {
                                await markAsRead(msg.ID);
                            }
                            await fetchUnreadCount(currentUserId);

                            // Refresh unread senders list
                            const result =
                                await fetchUserMessages(currentUserId);
                            if (result.success) {
                                const unreadSenderIds = result.data
                                    .filter(
                                        (msg) =>
                                            msg.RECEIVER_ID === currentUserId &&
                                            !msg.IS_READ,
                                    )
                                    .map((msg) => msg.SENDER_ID);
                                const uniqueSenderIds = [
                                    ...new Set(unreadSenderIds),
                                ];
                                const unreadUsernames = users
                                    .filter((u) =>
                                        uniqueSenderIds.includes(u.ID),
                                    )
                                    .map((u) => u.Username);
                                setUsersWithUnreadMessages(unreadUsernames);
                            }
                        }
                    }
                }
            } else if (isAdmin && selectedReceiver && selectedSender) {
                const receiverUser = users.find(
                    (u) => u.Username === selectedReceiver,
                );
                const senderUser = users.find(
                    (u) => u.Username === selectedSender,
                );
                if (!receiverUser || !senderUser) return;

                const result = await fetchUserMessages(receiverUser.ID);
                if (result.success) {
                    const filtered = result.data
                        .filter(
                            (msg) =>
                                (msg.SENDER_ID === senderUser.ID &&
                                    msg.RECEIVER_ID === receiverUser.ID) ||
                                (msg.RECEIVER_ID === senderUser.ID &&
                                    msg.SENDER_ID === receiverUser.ID),
                        )
                        .sort(
                            (a, b) =>
                                new Date(a.DATE_SENT) - new Date(b.DATE_SENT),
                        );

                    // Only update if messages have changed
                    if (
                        JSON.stringify(filtered) !==
                        JSON.stringify(chatMessages)
                    ) {
                        setChatMessages(filtered);
                    }
                }
            }
        };

        // Poll immediately, then every 5 seconds
        const interval = setInterval(pollMessages, 5000);

        return () => clearInterval(interval);
    }, [
        selectedReceiver,
        selectedSender,
        currentUserId,
        isEmployee,
        isAdmin,
        users,
        chatMessages,
        fetchUserMessages,
        markAsRead,
        fetchUnreadCount,
    ]);

    const formatUsername = (username) => {
        const parts = username.split(".");
        let formatted = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        if (parts[1]) {
            formatted +=
                " " + parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        }
        return formatted;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";

        const value = String(dateString).trim();
        const timestampMatch = value.match(
            /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?$/,
        );

        // Always use literal timestamp components so displayed time matches DB hour exactly.
        if (timestampMatch) {
            const [, year, month, day, hour, minute] = timestampMatch;
            const weekday = new Date(
                Number(year),
                Number(month) - 1,
                Number(day),
            ).toLocaleDateString("it-IT", { weekday: "long" });

            return `${weekday} ${day}/${month}/${year}, ${hour}:${minute}`;
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

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
        if (typeof messageContent !== "string") {
            return <p>{messageContent}</p>;
        }

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

            if (shift === "R" || shift === "ND") {
                shiftColors = shiftColors.replace(/text-[^\s]+/g, "text-black");
            }

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

    const handleBack = () => {
        setSelectedReceiver("");
        setSelectedSender("");
        setChatMessages([]);
        setEmptyText("");
        previousSelectionRef.current = { receiver: "", sender: "" };
    };

    const handleSendMessage = async () => {
        if (!emptyText.trim()) return;

        let senderId, receiverId;

        if (isEmployee) {
            // Employee/Shift Leader sends to selected user
            senderId = currentUserId;
            const receiver = users.find((u) => u.Username === selectedReceiver);
            receiverId = receiver?.ID;
        } else if (isAdmin && currentUsername === selectedReceiver) {
            // Admin sending as themselves (selected in "Visualizza la chat di")
            senderId = currentUserId;
            const receiver = users.find((u) => u.Username === selectedSender);
            receiverId = receiver?.ID;
        }

        if (!senderId || !receiverId) return;

        const result = await sendMessage(senderId, receiverId, emptyText);
        if (result.success) {
            setEmptyText("");
            // Reload messages
            if (isEmployee && selectedReceiver) {
                const receiverUser = users.find(
                    (u) => u.Username === selectedReceiver,
                );
                const res = await fetchUserMessages(currentUserId);
                if (res.success) {
                    const filtered = res.data
                        .filter(
                            (msg) =>
                                (msg.SENDER_ID === currentUserId &&
                                    msg.RECEIVER_ID === receiverUser.ID) ||
                                (msg.RECEIVER_ID === currentUserId &&
                                    msg.SENDER_ID === receiverUser.ID),
                        )
                        .sort(
                            (a, b) =>
                                new Date(a.DATE_SENT) - new Date(b.DATE_SENT),
                        );
                    setChatMessages(filtered);
                    setShouldScrollToBottom(true);

                    // Mark unread messages as read
                    const unreadMessages = filtered.filter(
                        (msg) =>
                            msg.RECEIVER_ID === currentUserId && !msg.IS_READ,
                    );
                    for (const msg of unreadMessages) {
                        await markAsRead(msg.ID);
                    }

                    // Refresh unread count
                    if (unreadMessages.length > 0) {
                        await fetchUnreadCount(currentUserId);
                    }
                }
            } else if (
                isAdmin &&
                currentUsername === selectedReceiver &&
                selectedSender
            ) {
                // Admin sending as themselves - reload their chat with the other user
                const otherUser = users.find(
                    (u) => u.Username === selectedSender,
                );
                const res = await fetchUserMessages(currentUserId);
                if (res.success) {
                    const filtered = res.data
                        .filter(
                            (msg) =>
                                (msg.SENDER_ID === currentUserId &&
                                    msg.RECEIVER_ID === otherUser.ID) ||
                                (msg.RECEIVER_ID === currentUserId &&
                                    msg.SENDER_ID === otherUser.ID),
                        )
                        .sort(
                            (a, b) =>
                                new Date(a.DATE_SENT) - new Date(b.DATE_SENT),
                        );
                    setChatMessages(filtered);
                    setShouldScrollToBottom(true);

                    // Mark unread messages as read
                    const unreadMessages = filtered.filter(
                        (msg) =>
                            msg.RECEIVER_ID === currentUserId && !msg.IS_READ,
                    );
                    for (const msg of unreadMessages) {
                        await markAsRead(msg.ID);
                    }

                    // Refresh unread count and update dropdown indicators
                    if (unreadMessages.length > 0) {
                        await fetchUnreadCount(currentUserId);

                        // Refresh unread senders list
                        const result = await fetchUserMessages(currentUserId);
                        if (result.success) {
                            const unreadSenderIds = result.data
                                .filter(
                                    (msg) =>
                                        msg.RECEIVER_ID === currentUserId &&
                                        !msg.IS_READ,
                                )
                                .map((msg) => msg.SENDER_ID);
                            const uniqueSenderIds = [
                                ...new Set(unreadSenderIds),
                            ];
                            const unreadUsernames = users
                                .filter((u) => uniqueSenderIds.includes(u.ID))
                                .map((u) => u.Username);
                            setUsersWithUnreadMessages(unreadUsernames);
                        }
                    }
                }
            }
        }
    };

    const showChat = isEmployee
        ? selectedReceiver
        : selectedReceiver && selectedSender;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm cursor-default flex items-center justify-center z-50">
            <div
                className="bg-[var(--bento-bg)] rounded-xl p-4 max-w-lg w-full mx-4 shadow-xl border border-[var(--light-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-[var(--light-primary)] pb-4 mb-4">
                    <div className="flex flex-row items-center gap-2 text-[var(--black)]">
                        <BellIcon className="w-6" />
                        <h1 className="text-xl">Notifiche</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--gray)] hover:text-[var(--black)] text-2xl font-bold"
                    >
                        <CloseIcon className="w-6" />
                    </button>
                </div>
                <div className="flex flex-col gap-8 max-h-[calc(60vh-4rem)] overflow-y-auto pr-1">
                    {/* Employee/Shift Leader: Show single dropdown */}
                    {isEmployee && !selectedReceiver && (
                        <div className="flex flex-col gap-1 w-full">
                            <h3 className="text-sm text-[var(--gray)]">
                                Visualizza la chat con
                            </h3>
                            <div className="relative">
                                <select
                                    name=""
                                    id=""
                                    value={selectedReceiver}
                                    onChange={(e) => {
                                        setSelectedReceiver(e.target.value);
                                    }}
                                    className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                >
                                    <option value="">...</option>
                                    {users
                                        .filter(
                                            (user) => user.ID !== currentUserId,
                                        )
                                        .map((user, index) => (
                                            <option
                                                key={index}
                                                value={user.Username}
                                                style={{
                                                    color: usersWithUnreadMessages.includes(
                                                        user.Username,
                                                    )
                                                        ? "red"
                                                        : "inherit",
                                                }}
                                            >
                                                {formatUsername(user.Username)}
                                            </option>
                                        ))}
                                </select>
                                <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Admin: Show two dropdowns */}
                    {isAdmin && !showChat && (
                        <>
                            <div className="flex flex-col gap-1 w-full">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Visualizza la chat di
                                </h3>
                                <div className="relative">
                                    <select
                                        name=""
                                        id=""
                                        value={selectedReceiver}
                                        onChange={(e) => {
                                            setSelectedReceiver(e.target.value);
                                        }}
                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                    >
                                        <option value="">...</option>
                                        {users.map((user, index) => (
                                            <option
                                                key={index}
                                                value={user.Username}
                                            >
                                                {formatUsername(user.Username)}
                                            </option>
                                        ))}
                                    </select>
                                    <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <h3 className="text-sm text-[var(--gray)]">
                                    Con
                                </h3>
                                <div className="relative">
                                    <select
                                        name=""
                                        id=""
                                        value={selectedSender}
                                        onChange={(e) => {
                                            setSelectedSender(e.target.value);
                                        }}
                                        className="p-2 pr-10 text-[var(--black)] border border-[var(--light-primary)] rounded-md bg-[var(--white)] hover:border-[var(--separator)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200 ease-in-out w-full appearance-none cursor-pointer"
                                    >
                                        <option value="">...</option>
                                        {users
                                            .filter(
                                                (user) =>
                                                    user.Username !==
                                                    selectedReceiver,
                                            )
                                            .map((user, index) => (
                                                <option
                                                    key={index}
                                                    value={user.Username}
                                                    style={{
                                                        color: usersWithUnreadMessages.includes(
                                                            user.Username,
                                                        )
                                                            ? "red"
                                                            : "inherit",
                                                    }}
                                                >
                                                    {formatUsername(
                                                        user.Username,
                                                    )}
                                                </option>
                                            ))}
                                    </select>
                                    <ArrowRightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 text-[var(--gray)] pointer-events-none" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Display messages */}
                    {showChat &&
                        chatMessages.map((msg, index) => {
                            const isSentByCurrentUser = isEmployee
                                ? msg.SENDER_ID === currentUserId
                                : false;
                            const isSentByReceiver = isAdmin
                                ? msg.SENDER_ID ===
                                  users.find(
                                      (u) => u.Username === selectedReceiver,
                                  )?.ID
                                : false;

                            const shouldAlignRight = isEmployee
                                ? isSentByCurrentUser
                                : isSentByReceiver;

                            return (
                                <div
                                    key={index}
                                    className={`flex flex-col gap-2 w-3/4 ${shouldAlignRight ? "self-end items-end" : ""}`}
                                >
                                    <h1 className="text-md text-[var(--gray)]">
                                        {shouldAlignRight
                                            ? isEmployee
                                                ? "Tu:"
                                                : `${formatUsername(selectedReceiver)}:`
                                            : isEmployee
                                              ? `${formatUsername(selectedReceiver)}:`
                                              : `${formatUsername(selectedSender)}:`}
                                    </h1>
                                    <div className="text-md text-[var(--black)] w-full border border-[var(--light-primary)] rounded-md p-2">
                                        {renderMessageContent(
                                            msg.MESSAGE_CONTENT,
                                        )}
                                        <p
                                            className={`text-xs text-[var(--gray)] mt-1 ${shouldAlignRight ? "text-right" : "text-left"}`}
                                        >
                                            {formatDate(msg.DATE_SENT)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                    {/* Show message if no messages exist */}
                    {showChat && chatMessages.length === 0 && (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-[var(--gray)]">
                                Nessun messaggio in questa chat
                            </p>
                        </div>
                    )}
                    {/* Invisible element at the bottom for scrolling */}
                    <div ref={messagesEndRef} />
                </div>
                {showChat &&
                    (isEmployee ||
                        (isAdmin && currentUsername === selectedReceiver)) && (
                        <div className="flex gap-2 pt-4 mt-4">
                            <input
                                type="text"
                                className="w-full h-[44px] p-3 border border-[var(--light-primary)] overflow-y-none rounded-md bg-[var(--white)] text-[var(--black)] focus:outline-[var(--gray)] focus:border-[var(--separator)] transition-all duration-200"
                                placeholder="Scrivi qui..."
                                value={emptyText}
                                onChange={(e) => setEmptyText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && emptyText) {
                                        handleSendMessage();
                                    }
                                }}
                            ></input>
                            <button
                                onClick={handleSendMessage}
                                className={`btn flex gap-2 items-center h-[44px] ${emptyText ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                                disabled={!emptyText}
                            >
                                <SendIcon className="w-6" />
                                Invia
                            </button>
                        </div>
                    )}
                {showChat && (
                    <div className="flex items-center gap-4 pt-4 mt-4 border-t border-[var(--light-primary)]">
                        <div
                            onClick={handleBack}
                            className="flex gap-2 items-center border border-[var(--light-primary)] bg-[var(--white)] hover:bg-[var(--light-primary)] hover:text-[var(--primary)] transition rounded-md p-2 cursor-pointer"
                        >
                            <ArrowLeftIcon className="w-6" />
                        </div>

                        <h1 className="text-lg text-[var(--black)]">
                            {isEmployee
                                ? formatUsername(selectedReceiver)
                                : `${formatUsername(selectedReceiver)} - ${formatUsername(selectedSender)}`}
                        </h1>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notifications;
