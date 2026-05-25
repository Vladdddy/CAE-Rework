import React, { useState, useEffect, useCallback } from "react";
import CloseIcon from "../../assets/icons/close.tsx";
import ScoreModal from "./ScoreModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const MONTHS_IT = [
    "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
    "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
];
const WEEK_DAYS = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];

const formatName = (username) =>
    username.split(".").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

const perfLabel = (v) => {
    if (v >= 95) return { text: "Eccellente", color: "#10b981" };
    if (v >= 80) return { text: "Ottimo",     color: "var(--primary)" };
    if (v >= 60) return { text: "Buono",       color: "#f59e0b" };
    return             { text: "Critico",      color: "#ef4444" };
};

function ScoreCalendar({ employee, onClose }) {
    const today = new Date();
    const [viewDate, setViewDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1),
    );
    const [dailySummaries, setDailySummaries] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);

    const [topCategories, setTopCategories] = useState([]);
    const [softskillSubs, setSoftskillSubs] = useState([]);
    const [competenzeSubs, setCompetenzeSubs] = useState([]);
    const [predefinedValues, setPredefinedValues] = useState({});
    const [alltimeScores, setAlltimeScores] = useState({});
    const [accordionOpen, setAccordionOpen] = useState(false);

    const loadDailySummaries = useCallback(async () => {
        try {
            const res = await fetch(
                `${API_URL}/score/values/dailySummary?employeeId=${employee.key}`,
            );
            const data = await res.json();
            const map = {};
            data.forEach((row) => { map[row.score_date] = row; });
            setDailySummaries(map);
        } catch (err) {
            console.error("Failed to load daily summaries:", err);
        }
    }, [employee.key]);

    const loadStats = useCallback(async () => {
        try {
            const [topRes, softRes, compRes, pvRes, atRes] = await Promise.all([
                fetch(`${API_URL}/score/topCategories`),
                fetch(`${API_URL}/score/rowSubcategories?macroType=softskills`),
                fetch(`${API_URL}/score/rowSubcategories?macroType=competenze`),
                fetch(`${API_URL}/score/predefinedValues`),
                fetch(`${API_URL}/score/values/alltime?employeeId=${employee.key}`),
            ]);
            const [topData, softData, compData, pvData, atData] = await Promise.all([
                topRes.json(), softRes.json(), compRes.json(), pvRes.json(), atRes.json(),
            ]);
            setTopCategories(topData);
            setSoftskillSubs(softData);
            setCompetenzeSubs(compData);

            const pvMap = {};
            pvData.forEach((pv) => {
                if (!pvMap[pv.row_subcategory_id]) pvMap[pv.row_subcategory_id] = [];
                pvMap[pv.row_subcategory_id].push({ id: pv.id, value: Number(pv.value) });
            });
            setPredefinedValues(pvMap);

            const atMap = {};
            atData.forEach((row) => {
                atMap[`${row.row_subcategory_id}-${row.top_category_id}`] = row.avg_value;
            });
            setAlltimeScores(atMap);
        } catch (err) {
            console.error("Failed to load stats:", err);
        }
    }, [employee.key]);

    useEffect(() => {
        loadDailySummaries();
        loadStats();
    }, [loadDailySummaries, loadStats]);

    // ── Stats calculations (same logic as ScoreModal, using alltime averages) ──
    const scoreKey = (rowSubId, topCatId) => `${rowSubId}-${topCatId}`;

    const calcSectionPerf = (subs) => {
        let num = 0, den = 0;
        subs.forEach((sub) => {
            const peso = parseFloat(sub.peso) || 0;
            if (peso === 0) return;
            const pvList = predefinedValues[sub.id] || [];
            const maxVal = pvList.length > 0 ? Math.max(...pvList.map((v) => v.value)) : 0;
            if (maxVal === 0) return;
            const entered = topCategories
                .map((cat) => alltimeScores[scoreKey(sub.id, cat.id)])
                .filter((v) => v !== undefined);
            const avg = entered.length > 0
                ? entered.reduce((a, b) => a + b, 0) / entered.length
                : 0;
            num += (avg / maxVal) * peso;
            den += peso;
        });
        return den === 0 ? null : (num / den) * 100;
    };

    const sectionTotal = (subs) =>
        subs.reduce(
            (sum, sub) =>
                sum + topCategories.reduce((s, cat) => {
                    const v = alltimeScores[scoreKey(sub.id, cat.id)];
                    return s + (v !== undefined ? v : 0);
                }, 0),
            0,
        );

    const hasStats = Object.keys(alltimeScores).length > 0;

    const softPerf = hasStats ? calcSectionPerf(softskillSubs) : null;
    const compPerf = hasStats ? calcSectionPerf(competenzeSubs) : null;
    const combinedPerf = (softPerf !== null || compPerf !== null)
        ? (softPerf ?? 0) * 0.9 + (compPerf ?? 0) * 0.1
        : null;

    const softRaw   = hasStats ? sectionTotal(softskillSubs) : 0;
    const bonusRaw  = hasStats ? sectionTotal(competenzeSubs) : 0;
    const softMedia  = softskillSubs.length  > 0 ? softRaw  / softskillSubs.length  : 0;
    const bonusMedia = competenzeSubs.length > 0 ? bonusRaw / competenzeSubs.length : 0;
    const mediaTotal = softRaw * 0.9 + bonusRaw * 0.1;

    // ── Calendar helpers ──────────────────────────────────────────────────
    const getDays = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        return days;
    };

    const toDateStr = (day) => {
        const y = viewDate.getFullYear();
        const m = String(viewDate.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}-${String(day).padStart(2, "0")}`;
    };

    const isCurrentMonth =
        viewDate.getMonth() === today.getMonth() &&
        viewDate.getFullYear() === today.getFullYear();

    const days = getDays(viewDate);

    if (selectedDate) {
        return (
            <ScoreModal
                employee={employee}
                date={selectedDate}
                onClose={() => {
                    setSelectedDate(null);
                    loadDailySummaries();
                    loadStats();
                }}
            />
        );
    }

    // ── UI helpers ────────────────────────────────────────────────────────
    const lbl = {
        fontSize: "0.67rem",
        fontWeight: 700,
        color: "var(--gray)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        margin: "0 0 5px 0",
        textAlign: "center",
    };

    const statCard = (label, valueEl) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: "90px" }}>
            <p style={lbl}>{label}</p>
            {valueEl}
        </div>
    );

    const perfCard = (label, value) => {
        if (value === null) return null;
        const { text, color } = perfLabel(value);
        return statCard(label, (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "1.15rem", fontWeight: 800, color, lineHeight: 1 }}>
                    {value.toFixed(1)}%
                </span>
                <span style={{ background: color, color: "#fff", fontSize: "0.62rem", fontWeight: 700, borderRadius: "20px", padding: "2px 8px" }}>
                    {text}
                </span>
            </div>
        ));
    };

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
                    width: "min(92vw, 560px)",
                    maxHeight: "88vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--light-primary)", flexShrink: 0 }}>
                    <span style={{ fontWeight: 600, color: "var(--black)", fontSize: "1.2rem" }}>
                        {formatName(employee.nome)}
                    </span>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray)", display: "flex" }}>
                        <CloseIcon style={{ width: "20px" }} />
                    </button>
                </div>

                {/* Month navigation */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid var(--light-primary)", flexShrink: 0 }}>
                    <button
                        onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: "var(--gray)", padding: "0 10px", lineHeight: 1 }}
                    >‹</button>
                    <span style={{ fontWeight: 600, color: "var(--black)", fontSize: "1rem" }}>
                        {MONTHS_IT[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </span>
                    <button
                        onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: "var(--gray)", padding: "0 10px", lineHeight: 1 }}
                    >›</button>
                </div>

                {/* Calendar grid */}
                <div style={{ padding: "16px 20px", overflow: "auto", flex: 1 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
                        {WEEK_DAYS.map((wd) => (
                            <div key={wd} style={{ textAlign: "center", fontSize: "0.72rem", color: "var(--gray)", fontWeight: 600, padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                {wd}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                        {days.map((day, idx) => {
                            if (!day) return <div key={idx} />;
                            const dateStr = toDateStr(day);
                            const summary = dailySummaries[dateStr];
                            const hasScores = !!summary;
                            const isToday = isCurrentMonth && day === today.getDate();
                            const softTotal = hasScores ? Number(summary.softskills_total) : 0;
                            const compTotal = hasScores ? Number(summary.competenze_total) : 0;
                            const dailyTotal = softTotal + compTotal;

                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedDate(dateStr)}
                                    style={{
                                        aspectRatio: "1",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        border: isToday ? "2px solid var(--primary)" : "1px solid var(--light-primary)",
                                        background: hasScores ? "var(--light-primary)" : "var(--pure-white)",
                                        transition: "background 0.15s",
                                        gap: "3px",
                                        padding: "4px 2px",
                                    }}
                                >
                                    <span style={{ fontWeight: isToday ? 700 : 500, fontSize: "0.9rem", color: isToday ? "var(--primary)" : "var(--black)", lineHeight: 1 }}>
                                        {day}
                                    </span>
                                    {hasScores && (
                                        <span style={{ background: "var(--primary)", color: "#fff", fontSize: "0.6rem", fontWeight: 700, borderRadius: "20px", padding: "1px 5px", lineHeight: 1.4 }}>
                                            {dailyTotal}
                                        </span>
                                    )}
                                    {hasScores && (
                                        <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                                            <span style={{ fontSize: "0.52rem", color: "var(--gray)", fontWeight: 600, lineHeight: 1 }}>S:{softTotal}</span>
                                            <span style={{ fontSize: "0.52rem", color: "var(--gray)", fontWeight: 600, lineHeight: 1 }}>C:{compTotal}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Accordion — shown when this employee has any scored days */}
                {hasStats && (
                    <div style={{ flexShrink: 0, borderTop: "1px solid var(--light-primary)" }}>
                        <button
                            onClick={() => setAccordionOpen((o) => !o)}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "11px 20px",
                                background: "var(--bento-bg)",
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--black)" }}>
                                Visualizza andamento
                            </span>
                            <span style={{ fontSize: "1rem", color: "var(--gray)", lineHeight: 1, transform: accordionOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                                ›
                            </span>
                        </button>

                        {accordionOpen && (
                            <>
                                {combinedPerf !== null && (
                                    <div style={{ display: "flex", justifyContent: "space-around", gap: "8px", flexWrap: "wrap", padding: "12px 16px", borderTop: "1px solid var(--light-primary)", borderBottom: "1px solid var(--light-primary)" }}>
                                        {perfCard("Performance", combinedPerf)}
                                        {perfCard("Softskills", softPerf)}
                                        {perfCard("Bonus/Malus", compPerf)}
                                    </div>
                                )}
                                <div style={{ display: "flex", justifyContent: "space-around", gap: "8px", flexWrap: "wrap", padding: "12px 16px", background: "var(--pure-white)" }}>
                                    {statCard("Media Softskills", (
                                        <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>
                                            {softMedia.toFixed(2)}
                                        </span>
                                    ))}
                                    {statCard("Bonus/Malus Media", (
                                        <span style={{ fontSize: "1.15rem", fontWeight: 800, color: bonusMedia >= 0 ? "#10b981" : "#ef4444", lineHeight: 1 }}>
                                            {bonusMedia >= 0 ? "+" : ""}{bonusMedia.toFixed(2)}
                                        </span>
                                    ))}
                                    {statCard("Media Totale", (
                                        <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--black)", lineHeight: 1 }}>
                                            {mediaTotal.toFixed(2)}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ScoreCalendar;
