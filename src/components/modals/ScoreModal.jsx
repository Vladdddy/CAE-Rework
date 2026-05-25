import React, { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.tsx";

const API_URL = import.meta.env.VITE_API_URL;

const MONTHS_IT = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
];

const formatName = (username) =>
    username
        .split(".")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");

const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split("-");
    return `${parseInt(d)} ${MONTHS_IT[parseInt(m) - 1]} ${y}`;
};

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

function ScoreModal({ employee, date, onClose }) {
    const [topCategories, setTopCategories] = useState([]);
    const [softskillSubs, setSoftskillSubs] = useState([]);
    const [competenzeSubs, setCompetenzeSubs] = useState([]);
    // scores[rowSubId-topCatId] = numeric value
    const [scores, setScores] = useState({});
    // predefinedValues[rowSubId] = [{id, value}, ...]
    const [predefinedValues, setPredefinedValues] = useState({});
    const [loading, setLoading] = useState(true);

    // Fixed dropdown for score selection
    const [dropdownAnchor, setDropdownAnchor] = useState(null); // { key, rowSubId, top, left }

    // Nota modal
    const [showNotaModal, setShowNotaModal] = useState(false);
    const [notaText, setNotaText] = useState("");
    const [saving, setSaving] = useState(false);

    // ── Load all data ──────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const [topRes, softRes, compRes, valRes, pvRes, noteRes] =
                    await Promise.all([
                        fetch(`${API_URL}/score/topCategories`),
                        fetch(
                            `${API_URL}/score/rowSubcategories?macroType=softskills`,
                        ),
                        fetch(
                            `${API_URL}/score/rowSubcategories?macroType=competenze`,
                        ),
                        fetch(
                            `${API_URL}/score/values?employeeId=${employee.key}&date=${date}`,
                        ),
                        fetch(`${API_URL}/score/predefinedValues`),
                        fetch(
                            `${API_URL}/score/notes?employeeId=${employee.key}&date=${date}`,
                        ),
                    ]);
                const [topData, softData, compData, valData, pvData, noteData] =
                    await Promise.all([
                        topRes.json(),
                        softRes.json(),
                        compRes.json(),
                        valRes.json(),
                        pvRes.json(),
                        noteRes.json(),
                    ]);

                setTopCategories(topData);
                setSoftskillSubs(softData);
                setCompetenzeSubs(compData);

                const scoreMap = {};
                valData.forEach((v) => {
                    scoreMap[`${v.row_subcategory_id}-${v.top_category_id}`] =
                        Number(v.value);
                });
                setScores(scoreMap);

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

                if (noteData?.note) setNotaText(noteData.note);
            } catch (err) {
                console.error("Failed to load score data:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [employee.key, date]);

    // ── Score dropdown ────────────────────────────────────────────────────
    const scoreKey = (rowSubId, topCatId) => `${rowSubId}-${topCatId}`;

    const openDropdown = (key, rowSubId, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setDropdownAnchor({
            key,
            rowSubId,
            top: rect.bottom + 4,
            left: Math.min(rect.left, window.innerWidth - 180),
        });
    };

    const selectValue = (key, value) => {
        setScores((p) => {
            if (p[key] === value) {
                const next = { ...p };
                delete next[key];
                return next;
            }
            return { ...p, [key]: value };
        });
        setDropdownAnchor(null);
    };

    // ── Save all ──────────────────────────────────────────────────────────
    const handleConfirmNota = async () => {
        if (!notaText.trim() || saving) return;
        setSaving(true);
        try {
            const savePromises = Object.entries(scores)
                .filter(([, v]) => v !== null && v !== undefined)
                .map(([key, value]) => {
                    const [rowSubId, topCatId] = key.split("-").map(Number);
                    return fetch(`${API_URL}/score/values`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            employee_id: employee.key,
                            row_subcategory_id: rowSubId,
                            top_category_id: topCatId,
                            value,
                            score_date: date,
                        }),
                    });
                });

            await Promise.all(savePromises);
            await fetch(`${API_URL}/score/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employee_id: employee.key,
                    score_date: date,
                    note: notaText.trim(),
                }),
            });
            setShowNotaModal(false);
            onClose();
        } catch (err) {
            console.error("Failed to save:", err);
        } finally {
            setSaving(false);
        }
    };

    // ── Performance ───────────────────────────────────────────────────────
    // Softskills = 90% of total, Bonus/Malus = 10% of total
    const calcSectionPerf = (subs) => {
        let num = 0,
            den = 0;
        subs.forEach((sub) => {
            const peso = parseFloat(sub.peso) || 0;
            if (peso === 0) return;
            const pvList = predefinedValues[sub.id] || [];
            const maxVal =
                pvList.length > 0 ? Math.max(...pvList.map((v) => v.value)) : 0;
            if (maxVal === 0) return;
            const entered = topCategories
                .map((cat) => scores[scoreKey(sub.id, cat.id)])
                .filter((v) => v !== undefined);
            const avg =
                entered.length > 0
                    ? entered.reduce((a, b) => a + b, 0) / entered.length
                    : 0;
            num += (avg / maxVal) * peso;
            den += peso;
        });
        return den === 0 ? null : (num / den) * 100;
    };

    const computePerformance = () => {
        const softPerf = calcSectionPerf(softskillSubs);
        const compPerf = calcSectionPerf(competenzeSubs);
        if (softPerf === null && compPerf === null) return null;
        return {
            combined: (softPerf ?? 0) * 0.9 + (compPerf ?? 0) * 0.1,
            softPerf,
            compPerf,
        };
    };

    const perfLabel = (v) => {
        if (v >= 95) return { text: "Eccellente", color: "#10b981" };
        if (v >= 80) return { text: "Ottimo", color: "var(--primary)" };
        if (v >= 60) return { text: "Buono", color: "#f59e0b" };
        return { text: "Critico", color: "#ef4444" };
    };

    // ── Grid helpers ──────────────────────────────────────────────────────
    const totalCols = topCategories.length + 2; // Categoria + Peso + top cats

    const sectionTotal = (subs) =>
        subs.reduce(
            (sum, sub) =>
                sum +
                topCategories.reduce((s, cat) => {
                    const v = scores[scoreKey(sub.id, cat.id)];
                    return s + (v !== undefined ? v : 0);
                }, 0),
            0,
        );

    const rowWeighted = (sub) => {
        const total = topCategories.reduce((sum, cat) => {
            const val = scores[scoreKey(sub.id, cat.id)];
            return sum + (val !== undefined ? val : 0);
        }, 0);
        if (total === 0) return null;
        return total * ((parseFloat(sub.peso) || 0) / 100);
    };

    const renderSubRows = (subs) =>
        subs.map((sub) => {
            const weighted = rowWeighted(sub);
            return (
                <tr key={sub.id}>
                    {/* Categoria */}
                    <td style={{ ...tdStyle, paddingLeft: "22px" }}>
                        <span>{sub.name}</span>
                    </td>

                    {/* Peso (read-only) + weighted contribution */}
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "2px",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "var(--gray)",
                                }}
                            >
                                {parseFloat(sub.peso || 0).toFixed(1)}%
                            </span>
                        </div>
                    </td>

                    {/* Score cell per top category */}
                    {topCategories.map((cat) => {
                        const key = scoreKey(sub.id, cat.id);
                        const selected = scores[key];
                        return (
                            <td
                                key={cat.id}
                                style={{ ...tdStyle, textAlign: "center" }}
                            >
                                <button
                                    onClick={(e) =>
                                        openDropdown(key, sub.id, e)
                                    }
                                    style={{
                                        minWidth: "64px",
                                        padding: "5px 10px",
                                        border: "1px solid var(--light-primary)",
                                        borderRadius: "6px",
                                        background:
                                            selected !== undefined
                                                ? "var(--light-primary)"
                                                : "var(--pure-white)",
                                        cursor: "pointer",
                                        fontSize: "1rem",
                                        fontWeight: 600,
                                        color:
                                            selected !== undefined
                                                ? "var(--primary)"
                                                : "var(--gray)",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {selected !== undefined ? selected : "—"}
                                </button>
                            </td>
                        );
                    })}
                </tr>
            );
        });

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
                    width: "min(92vw, 920px)",
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
                            {formatName(employee.nome)}
                        </span>
                        <span
                            style={{
                                fontSize: "0.82rem",
                                color: "var(--gray)",
                            }}
                        >
                            {formatDate(date)}
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
                    <>
                        <div
                            style={{ overflow: "auto", flex: 1 }}
                            onScroll={() => setDropdownAnchor(null)}
                        >
                            <table
                                style={{
                                    borderCollapse: "collapse",
                                    width: "100%",
                                    minWidth: "420px",
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
                                                minWidth: "80px",
                                            }}
                                        >
                                            Peso %
                                        </th>
                                        {topCategories.map((cat) => (
                                            <th
                                                key={cat.id}
                                                style={{
                                                    ...thStyle,
                                                    minWidth: "90px",
                                                }}
                                            >
                                                {cat.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td
                                            colSpan={totalCols}
                                            style={macroStyle}
                                        >
                                            Softskills
                                        </td>
                                    </tr>
                                    {renderSubRows(softskillSubs)}

                                    <tr>
                                        <td
                                            colSpan={totalCols}
                                            style={macroStyle}
                                        >
                                            Bonus / Malus
                                        </td>
                                    </tr>
                                    {renderSubRows(competenzeSubs)}
                                </tbody>
                            </table>

                            {notaText && (
                                <div
                                    style={{
                                        margin: "1rem",
                                        padding: "14px 20px",
                                        borderRadius: "8px",
                                        background: "var(--bento-bg)",
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: "0.72rem",
                                            fontWeight: 700,
                                            color: "var(--gray)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Nota
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "var(--black)",
                                            lineHeight: 1.55,
                                            whiteSpace: "pre-wrap",
                                            margin: 0,
                                        }}
                                    >
                                        {notaText}
                                    </p>
                                </div>
                            )}

                            {(() => {
                                const perfs = computePerformance();
                                const softRaw = sectionTotal(softskillSubs);
                                const bonusRaw = sectionTotal(competenzeSubs);
                                const softMedia =
                                    softskillSubs.length > 0
                                        ? softRaw / softskillSubs.length
                                        : 0;
                                const bonusMedia =
                                    competenzeSubs.length > 0
                                        ? bonusRaw / competenzeSubs.length
                                        : 0;
                                const mediaTotal =
                                    softRaw * 0.9 + bonusRaw * 0.1;
                                const hasScores =
                                    Object.keys(scores).length > 0;
                                if (perfs === null && !hasScores) return null;

                                const lbl = {
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    color: "var(--gray)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    margin: "0 0 6px 0",
                                };

                                const card = (children) => ({
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    flex: 1,
                                    minWidth: "120px",
                                });

                                const perfBlock = (label, value) => {
                                    if (value === null) return null;
                                    const { text, color } = perfLabel(value);
                                    return (
                                        <div key={label} style={card()}>
                                            <p style={lbl}>{label}</p>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: "1.5rem",
                                                        fontWeight: 800,
                                                        color,
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {value.toFixed(1)}%
                                                </span>
                                                <span
                                                    style={{
                                                        background: color,
                                                        color: "#fff",
                                                        fontSize: "0.7rem",
                                                        fontWeight: 700,
                                                        borderRadius: "20px",
                                                        padding: "3px 9px",
                                                    }}
                                                >
                                                    {text}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                };

                                const row = {
                                    background: "var(--bento-bg)",
                                    display: "flex",
                                    justifyContent: "space-around",
                                    gap: "12px",
                                    flexWrap: "wrap",
                                    borderRadius: "8px",
                                    padding: "14px 20px",
                                    margin: "0 1rem",
                                };

                                return (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                            paddingBottom: "4px",
                                        }}
                                    >
                                        {/* Performances */}
                                        {perfs !== null && (
                                            <div style={row}>
                                                {perfBlock(
                                                    "Performance Softskills",
                                                    perfs.softPerf,
                                                )}
                                                {perfBlock(
                                                    "Performance Bonus/Malus",
                                                    perfs.compPerf,
                                                )}
                                                {perfBlock(
                                                    "Performance Totale",
                                                    perfs.combined,
                                                )}
                                            </div>
                                        )}

                                        {/* Medie */}
                                        {hasScores && (
                                            <div style={row}>
                                                <div style={card()}>
                                                    <p style={lbl}>
                                                        Media Softskills
                                                    </p>
                                                    <span
                                                        style={{
                                                            fontSize: "1.5rem",
                                                            fontWeight: 800,
                                                            color: "var(--primary)",
                                                            lineHeight: 1,
                                                        }}
                                                    >
                                                        {softMedia.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div style={card()}>
                                                    <p style={lbl}>
                                                        Bonus/Malus Media
                                                    </p>
                                                    <span
                                                        style={{
                                                            fontSize: "1.5rem",
                                                            fontWeight: 800,
                                                            color:
                                                                bonusMedia >= 0
                                                                    ? "#10b981"
                                                                    : "#ef4444",
                                                            lineHeight: 1,
                                                        }}
                                                    >
                                                        {bonusMedia >= 0
                                                            ? "+"
                                                            : ""}
                                                        {bonusMedia.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div style={card()}>
                                                    <p style={lbl}>
                                                        Media Totale
                                                    </p>
                                                    <span
                                                        style={{
                                                            fontSize: "1.5rem",
                                                            fontWeight: 800,
                                                            color: "var(--black)",
                                                            lineHeight: 1,
                                                        }}
                                                    >
                                                        {mediaTotal.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer: Salva */}
                        <div
                            style={{
                                padding: "12px 20px",
                                borderTop: "1px solid var(--light-primary)",
                                flexShrink: 0,
                                display: "flex",
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                onClick={() => setShowNotaModal(true)}
                                style={{
                                    background: "var(--primary)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "8px 24px",
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                }}
                            >
                                Salva
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Fixed dropdown for score value selection */}
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
                            minWidth: "140px",
                            overflow: "hidden",
                        }}
                    >
                        {(predefinedValues[dropdownAnchor.rowSubId] || [])
                            .length === 0 ? (
                            <div
                                style={{
                                    padding: "10px 14px",
                                    fontSize: "0.82rem",
                                    color: "var(--gray)",
                                }}
                            >
                                Nessun valore configurato
                            </div>
                        ) : (
                            (
                                predefinedValues[dropdownAnchor.rowSubId] || []
                            ).map((v) => {
                                const isSelected =
                                    scores[dropdownAnchor.key] === v.value;
                                return (
                                    <div
                                        key={v.id}
                                        onClick={() =>
                                            selectValue(
                                                dropdownAnchor.key,
                                                v.value,
                                            )
                                        }
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            padding: "8px 14px",
                                            cursor: "pointer",
                                            background: isSelected
                                                ? "var(--light-primary)"
                                                : "var(--pure-white)",
                                            transition: "background 0.1s",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            style={{
                                                pointerEvents: "none",
                                                accentColor: "var(--primary)",
                                                width: "14px",
                                                height: "14px",
                                            }}
                                        />
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                                            <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--black)" }}>
                                                {v.value}
                                            </span>
                                            {v.label && (
                                                <span style={{ fontSize: "0.72rem", color: "var(--gray)", lineHeight: 1 }}>
                                                    {v.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}

            {/* Nota modal */}
            {showNotaModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        zIndex: 1100,
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
                            width: "min(90vw, 480px)",
                            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                padding: "16px 20px",
                                borderBottom: "1px solid var(--light-primary)",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                    color: "var(--black)",
                                }}
                            >
                                Nota
                            </span>
                            <p
                                style={{
                                    marginTop: "4px",
                                    fontSize: "0.82rem",
                                    color: "var(--gray)",
                                }}
                            >
                                Inserisci una nota per la valutazione di{" "}
                                {formatName(employee.nome)} del{" "}
                                {formatDate(date)}.
                            </p>
                        </div>

                        <div style={{ padding: "16px 20px" }}>
                            <textarea
                                autoFocus
                                value={notaText}
                                onChange={(e) => setNotaText(e.target.value)}
                                placeholder="Inserisci una nota..."
                                rows={5}
                                style={{
                                    width: "100%",
                                    resize: "vertical",
                                    border: "1px solid var(--light-primary)",
                                    borderRadius: "8px",
                                    padding: "10px 12px",
                                    fontSize: "0.9rem",
                                    color: "var(--black)",
                                    background: "var(--pure-white)",
                                    fontFamily: "inherit",
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div
                            style={{
                                padding: "12px 20px",
                                borderTop: "1px solid var(--light-primary)",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "8px",
                            }}
                        >
                            <button
                                onClick={() => setShowNotaModal(false)}
                                style={{
                                    background: "var(--pure-white)",
                                    color: "var(--gray)",
                                    border: "1px solid var(--light-primary)",
                                    borderRadius: "8px",
                                    padding: "8px 20px",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    fontSize: "0.9rem",
                                }}
                            >
                                Annulla
                            </button>
                            <button
                                onClick={handleConfirmNota}
                                disabled={!notaText.trim() || saving}
                                style={{
                                    background:
                                        notaText.trim() && !saving
                                            ? "var(--primary)"
                                            : "var(--light-primary)",
                                    color:
                                        notaText.trim() && !saving
                                            ? "#fff"
                                            : "var(--gray)",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "8px 24px",
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                    cursor:
                                        notaText.trim() && !saving
                                            ? "pointer"
                                            : "not-allowed",
                                    fontFamily: "inherit",
                                    transition: "background 0.15s",
                                }}
                            >
                                {saving ? "Salvataggio..." : "Conferma"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ScoreModal;
