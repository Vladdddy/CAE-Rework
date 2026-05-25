import React, { useState, useEffect, useRef, useMemo } from "react";
import CloseIcon from "../../assets/icons/close.tsx";
import DeleteIcon from "../../assets/icons/delete.tsx";
import EditIcon from "../../assets/icons/edit.tsx";

const API_URL = import.meta.env.VITE_API_URL;

const thStyle = {
    background: "var(--light-primary)",
    color: "var(--black)",
    fontWeight: 600,
    fontSize: "0.82rem",
    padding: "10px 14px",
    borderBottom: "2px solid var(--separator)",
    whiteSpace: "nowrap",
    textAlign: "center",
};

const macroStyle = {
    background: "var(--bento-bg)",
    color: "var(--gray)",
    fontWeight: 700,
    fontSize: "0.95rem",
    padding: "9px 14px",
    borderBottom: "1px solid var(--separator)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
};

const tdStyle = {
    padding: "8px 14px",
    borderBottom: "1px solid var(--light-primary)",
    color: "var(--black)",
    fontSize: "0.875rem",
    background: "var(--pure-white)",
};

const inputStyle = {
    border: "1px solid var(--primary)",
    borderRadius: "6px",
    padding: "3px 8px",
    fontSize: "0.82rem",
    outline: "none",
    color: "var(--black)",
    background: "var(--pure-white)",
    fontFamily: "inherit",
};

const addBtnStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--primary)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.8rem",
    padding: "2px 0",
    fontFamily: "inherit",
};

function MasterScoreModal({ onClose }) {
    const [topCategories, setTopCategories] = useState([]);
    const [softskillSubs, setSoftskillSubs] = useState([]);
    const [competenzeSubs, setCompetenzeSubs] = useState([]);
    // { [rowSubId]: [{id, value}, ...] }
    const [predefinedValues, setPredefinedValues] = useState({});
    const [loading, setLoading] = useState(true);

    const [adding, setAdding] = useState(null); // "top" | "soft" | "comp"
    const [newName, setNewName] = useState("");
    // { type: "top"|"sub", id, name, macro: "soft"|"comp"|null }
    const [editingItem, setEditingItem] = useState(null);

    // Fixed-position dropdown anchor for predefined values
    const [dropdownAnchor, setDropdownAnchor] = useState(null); // { rowSubId, top, left }
    const [newValueInput, setNewValueInput] = useState("");
    const [newLabelInput, setNewLabelInput] = useState("");
    const [showValueInput, setShowValueInput] = useState(false);

    const pesoTimers = useRef({});

    useEffect(() => {
        const load = async () => {
            try {
                const [topRes, softRes, compRes, pvRes] = await Promise.all([
                    fetch(`${API_URL}/score/topCategories`),
                    fetch(
                        `${API_URL}/score/rowSubcategories?macroType=softskills`,
                    ),
                    fetch(
                        `${API_URL}/score/rowSubcategories?macroType=competenze`,
                    ),
                    fetch(`${API_URL}/score/predefinedValues`),
                ]);
                const [topData, softData, compData, pvData] = await Promise.all(
                    [
                        topRes.json(),
                        softRes.json(),
                        compRes.json(),
                        pvRes.json(),
                    ],
                );
                setTopCategories(topData);
                setSoftskillSubs(softData);
                setCompetenzeSubs(compData);
                const pvMap = {};
                pvData.forEach((pv) => {
                    if (!pvMap[pv.row_subcategory_id])
                        pvMap[pv.row_subcategory_id] = [];
                    pvMap[pv.row_subcategory_id].push({
                        id: pv.id,
                        value: Number(pv.value),
                        label: pv.label || "",
                    });
                });
                setPredefinedValues(pvMap);
            } catch (err) {
                console.error("Failed to load master data:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const softPeso = useMemo(
        () =>
            softskillSubs.reduce(
                (sum, s) => sum + (parseFloat(s.peso) || 0),
                0,
            ),
        [softskillSubs],
    );

    const compPeso = useMemo(
        () =>
            competenzeSubs.reduce(
                (sum, s) => sum + (parseFloat(s.peso) || 0),
                0,
            ),
        [competenzeSubs],
    );

    // ── Peso ──────────────────────────────────────────────────────────────
    const handlePesoChange = (sub, macro, val) => {
        const updater = (prev) =>
            prev.map((s) => (s.id === sub.id ? { ...s, peso: val } : s));
        if (macro === "soft") setSoftskillSubs(updater);
        else setCompetenzeSubs(updater);

        clearTimeout(pesoTimers.current[sub.id]);
        pesoTimers.current[sub.id] = setTimeout(async () => {
            const parsed = parseFloat(val);
            if (isNaN(parsed)) return;
            try {
                await fetch(`${API_URL}/score/rowSubcategories/${sub.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ peso: parsed }),
                });
            } catch (err) {
                console.error("Failed to save peso:", err);
            }
        }, 600);
    };

    // ── Predefined values ─────────────────────────────────────────────────
    const openDropdown = (rowSubId, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setDropdownAnchor({
            rowSubId,
            top: rect.bottom + 4,
            left: Math.min(rect.left, window.innerWidth - 200),
        });
        setShowValueInput(false);
        setNewValueInput("");
        setNewLabelInput("");
    };

    const handleAddValue = async () => {
        const parsed = parseFloat(newValueInput);
        if (isNaN(parsed) || !dropdownAnchor) return;
        const { rowSubId } = dropdownAnchor;
        if ((predefinedValues[rowSubId] || []).some((v) => v.value === parsed))
            return;
        const label = newLabelInput.trim();
        try {
            const res = await fetch(`${API_URL}/score/predefinedValues`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    row_subcategory_id: rowSubId,
                    value: parsed,
                    label,
                }),
            });
            const { id } = await res.json();
            setPredefinedValues((prev) => {
                const curr = prev[rowSubId] || [];
                return {
                    ...prev,
                    [rowSubId]: [...curr, { id, value: parsed, label }].sort(
                        (a, b) => a.value - b.value,
                    ),
                };
            });
            setNewValueInput("");
            setNewLabelInput("");
            setShowValueInput(false);
        } catch (err) {
            console.error("Failed to add value:", err);
        }
    };

    const handleDeleteValue = async (pvId, rowSubId) => {
        try {
            await fetch(`${API_URL}/score/predefinedValues/${pvId}`, {
                method: "DELETE",
            });
            setPredefinedValues((prev) => ({
                ...prev,
                [rowSubId]: (prev[rowSubId] || []).filter((v) => v.id !== pvId),
            }));
        } catch (err) {
            console.error("Failed to delete value:", err);
        }
    };

    // ── Categories ────────────────────────────────────────────────────────
    const startAdding = (type) => {
        setAdding(type);
        setNewName("");
    };

    const confirmAdd = async () => {
        const name = newName.trim();
        if (!name) {
            setAdding(null);
            setNewName("");
            return;
        }
        try {
            if (adding === "top") {
                const res = await fetch(`${API_URL}/score/topCategories`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name,
                        position: topCategories.length,
                    }),
                });
                const { id } = await res.json();
                setTopCategories((p) => [
                    ...p,
                    { id, name, position: p.length },
                ]);
            } else {
                const macro_type =
                    adding === "soft" ? "softskills" : "competenze";
                const subs = adding === "soft" ? softskillSubs : competenzeSubs;
                const res = await fetch(`${API_URL}/score/rowSubcategories`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        macro_type,
                        name,
                        position: subs.length,
                    }),
                });
                const { id } = await res.json();
                const entry = {
                    id,
                    macro_type,
                    name,
                    position: subs.length,
                    peso: 0,
                };
                if (adding === "soft") setSoftskillSubs((p) => [...p, entry]);
                else setCompetenzeSubs((p) => [...p, entry]);
            }
        } catch (err) {
            console.error("Failed to add category:", err);
        }
        setNewName("");
        setAdding(null);
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") confirmAdd();
        if (e.key === "Escape") {
            setNewName("");
            setAdding(null);
        }
    };

    const deleteTopCategory = async (id) => {
        try {
            await fetch(`${API_URL}/score/topCategories/${id}`, {
                method: "DELETE",
            });
            setTopCategories((p) => p.filter((c) => c.id !== id));
        } catch (err) {
            console.error("Failed to delete top category:", err);
        }
    };

    const deleteRowSub = async (id, macro) => {
        try {
            await fetch(`${API_URL}/score/rowSubcategories/${id}`, {
                method: "DELETE",
            });
            if (macro === "soft")
                setSoftskillSubs((p) => p.filter((s) => s.id !== id));
            else setCompetenzeSubs((p) => p.filter((s) => s.id !== id));
            setPredefinedValues((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        } catch (err) {
            console.error("Failed to delete subcategory:", err);
        }
    };

    const confirmRename = async () => {
        if (!editingItem) return;
        const name = editingItem.name.trim();
        setEditingItem(null);
        if (!name) return;
        try {
            if (editingItem.type === "top") {
                await fetch(
                    `${API_URL}/score/topCategories/${editingItem.id}`,
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name }),
                    },
                );
                setTopCategories((p) =>
                    p.map((c) =>
                        c.id === editingItem.id ? { ...c, name } : c,
                    ),
                );
            } else {
                await fetch(
                    `${API_URL}/score/rowSubcategories/${editingItem.id}`,
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name }),
                    },
                );
                const updater = (p) =>
                    p.map((s) =>
                        s.id === editingItem.id ? { ...s, name } : s,
                    );
                if (editingItem.macro === "soft") setSoftskillSubs(updater);
                else setCompetenzeSubs(updater);
            }
        } catch (err) {
            console.error("Failed to rename:", err);
        }
    };

    // ── Grid helpers ──────────────────────────────────────────────────────
    const totalCols = topCategories.length + 4; // Categoria + Peso + Valori + top cats + add

    const renderSubRows = (subs, macro) =>
        subs.map((sub) => {
            const pvList = predefinedValues[sub.id] || [];
            return (
                <tr key={sub.id}>
                    {/* Categoria */}
                    <td style={{ ...tdStyle, paddingLeft: "22px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            {editingItem?.type === "sub" &&
                            editingItem?.id === sub.id ? (
                                <input
                                    autoFocus
                                    value={editingItem.name}
                                    onChange={(e) =>
                                        setEditingItem((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") confirmRename();
                                        if (e.key === "Escape")
                                            setEditingItem(null);
                                    }}
                                    onBlur={confirmRename}
                                    style={{
                                        ...inputStyle,
                                        minWidth: "120px",
                                        padding: "3px 8px",
                                    }}
                                />
                            ) : (
                                <>
                                    <span>{sub.name}</span>
                                    <button
                                        onClick={() =>
                                            setEditingItem({
                                                type: "sub",
                                                id: sub.id,
                                                name: sub.name,
                                                macro,
                                            })
                                        }
                                        title="Rinomina"
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            display: "flex",
                                            padding: 0,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <EditIcon
                                            style={{
                                                width: "16px",
                                                color: "var(--gray)",
                                            }}
                                        />
                                    </button>
                                    <button
                                        onClick={() =>
                                            deleteRowSub(sub.id, macro)
                                        }
                                        title="Elimina"
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            display: "flex",
                                            padding: 0,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <DeleteIcon
                                            style={{
                                                width: "16px",
                                                color: "var(--red)",
                                            }}
                                        />
                                    </button>
                                </>
                            )}
                        </div>
                    </td>

                    {/* Peso */}
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                justifyContent: "center",
                            }}
                        >
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={sub.peso ?? 0}
                                onChange={(e) =>
                                    handlePesoChange(sub, macro, e.target.value)
                                }
                                style={{
                                    width: "58px",
                                    textAlign: "center",
                                    border: "1px solid var(--light-primary)",
                                    borderRadius: "6px",
                                    padding: "4px",
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    color: "var(--black)",
                                    background: "var(--pure-white)",
                                    outline: "none",
                                    fontFamily: "inherit",
                                }}
                            />
                            <span
                                style={{
                                    color: "var(--gray)",
                                    fontSize: "0.8rem",
                                    flexShrink: 0,
                                }}
                            >
                                %
                            </span>
                        </div>
                    </td>

                    {/* Valori predefiniti */}
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                        <button
                            onClick={(e) => openDropdown(sub.id, e)}
                            style={{
                                border: "1px solid var(--light-primary)",
                                borderRadius: "6px",
                                padding: "4px 10px",
                                background: "var(--pure-white)",
                                cursor: "pointer",
                                fontSize: "0.82rem",
                                color:
                                    pvList.length > 0
                                        ? "var(--black)"
                                        : "var(--gray)",
                                fontFamily: "inherit",
                                maxWidth: "140px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {pvList.length > 0
                                ? pvList
                                      .map((v) => v.label || String(v.value))
                                      .join(", ")
                                : "+ Aggiungi valori"}
                        </button>
                    </td>

                    {/* Top cat cells — structural only */}
                    {topCategories.map((cat) => (
                        <td
                            key={cat.id}
                            style={{
                                ...tdStyle,
                                textAlign: "center",
                                color: "var(--light-primary)",
                                fontSize: "1rem",
                            }}
                        >
                            —
                        </td>
                    ))}
                    <td style={tdStyle} />
                </tr>
            );
        });

    const renderAddRow = (macro) => (
        <tr>
            <td colSpan={totalCols} style={{ ...tdStyle, padding: "6px 22px" }}>
                {adding === macro ? (
                    <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={onKeyDown}
                        onBlur={confirmAdd}
                        placeholder="Nome sottocategoria..."
                        style={{
                            ...inputStyle,
                            minWidth: "200px",
                            padding: "4px 10px",
                        }}
                    />
                ) : (
                    <button
                        onClick={() => startAdding(macro)}
                        style={addBtnStyle}
                    >
                        + Aggiungi categoria
                    </button>
                )}
            </td>
        </tr>
    );

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
            }}
        >
            <div
                style={{
                    background: "var(--pure-white)",
                    borderRadius: "12px",
                    width: "min(92vw, 980px)",
                    maxHeight: "88vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        borderBottom: "1px solid var(--light-primary)",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 600,
                                color: "var(--black)",
                                fontSize: "1.2rem",
                            }}
                        >
                            Imposta valutazioni
                        </span>
                        <span
                            style={{ fontSize: "0.8rem", color: "var(--gray)" }}
                        >
                            Configura categorie, pesi e valori disponibili
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--gray)",
                            display: "flex",
                        }}
                    >
                        <CloseIcon style={{ width: "20px" }} />
                    </button>
                </div>

                {loading ? (
                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                            color: "var(--gray)",
                            fontSize: "0.9rem",
                        }}
                    >
                        Caricamento...
                    </div>
                ) : (
                    <div
                        style={{ overflow: "auto", flex: 1 }}
                        onScroll={() => setDropdownAnchor(null)}
                    >
                        <table
                            style={{
                                borderCollapse: "collapse",
                                width: "100%",
                                minWidth: "560px",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            ...thStyle,
                                            textAlign: "left",
                                            minWidth: "180px",
                                        }}
                                    >
                                        Categoria
                                    </th>
                                    <th
                                        style={{
                                            ...thStyle,
                                            minWidth: "100px",
                                        }}
                                    >
                                        Peso %
                                    </th>
                                    <th
                                        style={{
                                            ...thStyle,
                                            minWidth: "160px",
                                        }}
                                    >
                                        Valori disponibili
                                    </th>
                                    {topCategories.map((cat) => (
                                        <th
                                            key={cat.id}
                                            style={{
                                                ...thStyle,
                                                minWidth: "80px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "6px",
                                                }}
                                            >
                                                {editingItem?.type === "top" &&
                                                editingItem?.id === cat.id ? (
                                                    <input
                                                        autoFocus
                                                        value={editingItem.name}
                                                        onChange={(e) =>
                                                            setEditingItem(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    name: e
                                                                        .target
                                                                        .value,
                                                                }),
                                                            )
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                "Enter"
                                                            )
                                                                confirmRename();
                                                            if (
                                                                e.key ===
                                                                "Escape"
                                                            )
                                                                setEditingItem(
                                                                    null,
                                                                );
                                                        }}
                                                        onBlur={confirmRename}
                                                        style={{
                                                            ...inputStyle,
                                                            width: "100px",
                                                        }}
                                                    />
                                                ) : (
                                                    <>
                                                        <span>{cat.name}</span>
                                                        <button
                                                            onClick={() =>
                                                                setEditingItem({
                                                                    type: "top",
                                                                    id: cat.id,
                                                                    name: cat.name,
                                                                    macro: null,
                                                                })
                                                            }
                                                            title="Rinomina"
                                                            style={{
                                                                background:
                                                                    "none",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                padding: 0,
                                                            }}
                                                        >
                                                            <EditIcon
                                                                style={{
                                                                    width: "16px",
                                                                    color: "var(--gray)",
                                                                }}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                deleteTopCategory(
                                                                    cat.id,
                                                                )
                                                            }
                                                            title="Elimina"
                                                            style={{
                                                                background:
                                                                    "none",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                padding: 0,
                                                            }}
                                                        >
                                                            <DeleteIcon
                                                                style={{
                                                                    width: "16px",
                                                                    color: "var(--red)",
                                                                }}
                                                            />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    <th
                                        style={{
                                            ...thStyle,
                                            width: "52px",
                                            padding: "6px",
                                        }}
                                    >
                                        {adding === "top" ? (
                                            <input
                                                autoFocus
                                                value={newName}
                                                onChange={(e) =>
                                                    setNewName(e.target.value)
                                                }
                                                onKeyDown={onKeyDown}
                                                onBlur={confirmAdd}
                                                placeholder="Nuova categoria..."
                                                style={{
                                                    ...inputStyle,
                                                    width: "130px",
                                                }}
                                            />
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    startAdding("top")
                                                }
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "var(--primary)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    margin: "0 auto",
                                                    fontSize: "0.75rem",
                                                }}
                                            >
                                                + Aggiungi
                                            </button>
                                        )}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={totalCols} style={macroStyle}>
                                        Softskills
                                    </td>
                                </tr>
                                {renderSubRows(softskillSubs, "soft")}
                                {renderAddRow("soft")}

                                <tr>
                                    <td colSpan={totalCols} style={macroStyle}>
                                        Bonus / Malus
                                    </td>
                                </tr>
                                {renderSubRows(competenzeSubs, "comp")}
                                {renderAddRow("comp")}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer: total peso */}
                <div
                    style={{
                        padding: "10px 20px",
                        borderTop: "1px solid var(--light-primary)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    {[
                        { label: "Softskills", value: softPeso },
                        { label: "Bonus", value: compPeso },
                    ].map(({ label, value }) => (
                        <div
                            key={label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                marginRight: "16px",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.82rem",
                                    color: "var(--gray)",
                                }}
                            >
                                {label}:
                            </span>
                            <span
                                style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    color:
                                        value > 100
                                            ? "var(--red)"
                                            : value === 100
                                              ? "var(--green)"
                                              : "var(--black)",
                                }}
                            >
                                {value.toFixed(1)}%
                            </span>
                            {value > 100 && (
                                <span
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "var(--red)",
                                        fontWeight: 600,
                                    }}
                                >
                                    ⚠ Supera 100%
                                </span>
                            )}
                            {value === 100 && (
                                <span
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "var(--green)",
                                        fontWeight: 600,
                                    }}
                                >
                                    ✓
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Fixed dropdown for predefined values management */}
            {dropdownAnchor && (
                <>
                    <div
                        onClick={() => setDropdownAnchor(null)}
                        style={{ position: "fixed", inset: 0, zIndex: 1050 }}
                    />
                    <div
                        style={{
                            position: "fixed",
                            top: dropdownAnchor.top,
                            left: dropdownAnchor.left,
                            zIndex: 1051,
                            background: "var(--pure-white)",
                            border: "1px solid var(--light-primary)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
                            minWidth: "170px",
                            padding: "8px",
                        }}
                    >
                        {/* Existing values */}
                        <div
                            style={{
                                maxHeight: "180px",
                                overflowY: "auto",
                                marginBottom: "6px",
                            }}
                        >
                            {(predefinedValues[dropdownAnchor.rowSubId] || [])
                                .length === 0 ? (
                                <p
                                    style={{
                                        fontSize: "0.78rem",
                                        color: "var(--gray)",
                                        padding: "4px 0",
                                        textAlign: "center",
                                    }}
                                >
                                    Nessun valore
                                </p>
                            ) : (
                                (
                                    predefinedValues[dropdownAnchor.rowSubId] ||
                                    []
                                ).map((v) => (
                                    <div
                                        key={v.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "4px 4px 4px 8px",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "1px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "0.9rem",
                                                    fontWeight: 600,
                                                    color: "var(--black)",
                                                }}
                                            >
                                                {v.value}
                                            </span>
                                            {v.label && (
                                                <span
                                                    style={{
                                                        fontSize: "0.72rem",
                                                        color: "var(--gray)",
                                                    }}
                                                >
                                                    {v.label}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleDeleteValue(
                                                    v.id,
                                                    dropdownAnchor.rowSubId,
                                                )
                                            }
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: "2px",
                                                display: "flex",
                                            }}
                                        >
                                            <DeleteIcon
                                                style={{
                                                    width: "13px",
                                                    color: "var(--red)",
                                                }}
                                            />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add value */}
                        <div
                            style={{
                                borderTop: "1px solid var(--light-primary)",
                                paddingTop: "6px",
                            }}
                        >
                            {showValueInput ? (
                                (() => {
                                    const parsedNew = parseFloat(newValueInput);
                                    const isDuplicate =
                                        !isNaN(parsedNew) &&
                                        (
                                            predefinedValues[
                                                dropdownAnchor?.rowSubId
                                            ] || []
                                        ).some((v) => v.value === parsedNew);
                                    return (
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "5px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "4px",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    min="0"
                                                    step="0.5"
                                                    value={newValueInput}
                                                    onChange={(e) =>
                                                        setNewValueInput(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter")
                                                            handleAddValue();
                                                        if (
                                                            e.key === "Escape"
                                                        ) {
                                                            setShowValueInput(
                                                                false,
                                                            );
                                                            setNewValueInput(
                                                                "",
                                                            );
                                                            setNewLabelInput(
                                                                "",
                                                            );
                                                        }
                                                    }}
                                                    placeholder="Es. 8"
                                                    style={{
                                                        ...inputStyle,
                                                        width: "58px",
                                                        padding: "4px 6px",
                                                        borderColor: isDuplicate
                                                            ? "var(--red)"
                                                            : undefined,
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    value={newLabelInput}
                                                    onChange={(e) =>
                                                        setNewLabelInput(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter")
                                                            handleAddValue();
                                                        if (
                                                            e.key === "Escape"
                                                        ) {
                                                            setShowValueInput(
                                                                false,
                                                            );
                                                            setNewValueInput(
                                                                "",
                                                            );
                                                            setNewLabelInput(
                                                                "",
                                                            );
                                                        }
                                                    }}
                                                    placeholder="Parola"
                                                    style={{
                                                        ...inputStyle,
                                                        flex: 1,
                                                        padding: "4px 6px",
                                                    }}
                                                />
                                            </div>
                                            {isDuplicate && (
                                                <span
                                                    style={{
                                                        fontSize: "0.7rem",
                                                        color: "var(--red)",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Valore già esistente
                                                </span>
                                            )}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "4px",
                                                }}
                                            >
                                                <button
                                                    onClick={handleAddValue}
                                                    disabled={isDuplicate}
                                                    style={{
                                                        background: isDuplicate
                                                            ? "var(--light-primary)"
                                                            : "var(--primary)",
                                                        color: isDuplicate
                                                            ? "var(--gray)"
                                                            : "#fff",
                                                        border: "none",
                                                        borderRadius: "5px",
                                                        padding: "4px 8px",
                                                        cursor: isDuplicate
                                                            ? "not-allowed"
                                                            : "pointer",
                                                        fontFamily: "inherit",
                                                        fontSize: "0.82rem",
                                                        flex: 1,
                                                    }}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowValueInput(
                                                            false,
                                                        );
                                                        setNewValueInput("");
                                                        setNewLabelInput("");
                                                    }}
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        color: "var(--gray)",
                                                        fontFamily: "inherit",
                                                        fontSize: "0.82rem",
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <button
                                    onClick={() => setShowValueInput(true)}
                                    style={{
                                        ...addBtnStyle,
                                        width: "100%",
                                        justifyContent: "center",
                                        padding: "4px 0",
                                    }}
                                >
                                    + Aggiungi valore
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default MasterScoreModal;
