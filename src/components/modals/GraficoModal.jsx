import React, { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.tsx";

const API_URL = import.meta.env.VITE_API_URL;

const PALETTE = [
    "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6",
    "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
    "#06b6d4", "#a855f7", "#d946ef", "#0ea5e9", "#22c55e",
    "#dc2626", "#7c3aed", "#059669", "#d97706", "#2563eb",
];

const MIN = -10, MAX = 10;
// Grid rings every 2 units; labels every 5
const GRID_VALUES  = [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10];
const LABEL_VALUES = [-10, -5, 0, 5, 10];

const formatName = (u) =>
    u.split(".").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

function RadarChart({ subcategories, scoredUsers, userAvgs }) {
    const N = subcategories.length;
    const CX = 240, CY = 240, R = 190;

    const toAngle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / N;

    const pt = (axisIdx, value) => {
        const clamped = Math.max(MIN, Math.min(MAX, value));
        const r = ((clamped - MIN) / (MAX - MIN)) * R;
        const a = toAngle(axisIdx);
        return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
    };

    const pts = (values) =>
        subcategories.map((_, i) => pt(i, values[i] ?? 0).join(",")).join(" ");

    return (
        <svg
            viewBox="-60 -60 600 600"
            style={{ width: "100%", maxWidth: 520, maxHeight: "100%", aspectRatio: "1 / 1", overflow: "visible" }}
        >
            {/* Grid rings */}
            {GRID_VALUES.map((val) => (
                <polygon
                    key={val}
                    points={subcategories.map((_, i) => pt(i, val).join(",")).join(" ")}
                    fill="none"
                    stroke={val === 0 ? "#94a3b8" : "#e2e8f0"}
                    strokeWidth={val === 0 ? 1.5 : 0.8}
                />
            ))}

            {/* Axis lines */}
            {subcategories.map((_, i) => {
                const [x, y] = pt(i, MAX);
                return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#e2e8f0" strokeWidth={0.8} />;
            })}

            {/* Scale labels along first (top) axis */}
            {LABEL_VALUES.filter((v) => v > MIN).map((val) => {
                const [x, y] = pt(0, val);
                return (
                    <text key={val} x={x + 5} y={y} fontSize={9} fill="#94a3b8" dominantBaseline="middle" style={{ userSelect: "none" }}>
                        {val}
                    </text>
                );
            })}

            {/* Axis category labels */}
            {subcategories.map((sub, i) => {
                const a = toAngle(i);
                const lx = CX + (R + 26) * Math.cos(a);
                const ly = CY + (R + 26) * Math.sin(a);
                const anchor   = Math.cos(a) > 0.1 ? "start"   : Math.cos(a) < -0.1 ? "end"  : "middle";
                const baseline = Math.sin(a) > 0.1 ? "hanging" : Math.sin(a) < -0.1 ? "auto" : "middle";
                return (
                    <text key={sub.id} x={lx} y={ly} fontSize={11} fontWeight={600}
                        fill="var(--black)" textAnchor={anchor} dominantBaseline={baseline}
                        style={{ userSelect: "none" }}>
                        {sub.name}
                    </text>
                );
            })}

            {/* User polygons */}
            {scoredUsers.map((user, ui) => {
                const avgs = userAvgs[user.ID] || {};
                const values = subcategories.map((sub) => avgs[sub.id] ?? 0);
                const color = PALETTE[ui % PALETTE.length];
                return (
                    <polygon
                        key={user.ID}
                        points={pts(values)}
                        fill={color}
                        fillOpacity={0.15}
                        stroke={color}
                        strokeWidth={2}
                        strokeOpacity={0.9}
                    />
                );
            })}
        </svg>
    );
}

function GraficoModal({ users, onClose }) {
    const [subcategories, setSubcategories] = useState([]);
    const [userAvgs, setUserAvgs] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [subRes, avgRes] = await Promise.all([
                    fetch(`${API_URL}/score/rowSubcategories`),
                    fetch(`${API_URL}/score/values/alltimeAll`),
                ]);
                const [subData, avgData] = await Promise.all([subRes.json(), avgRes.json()]);
                setSubcategories(subData);
                const map = {};
                avgData.forEach((row) => {
                    if (!map[row.employee_id]) map[row.employee_id] = {};
                    map[row.employee_id][row.row_subcategory_id] = row.avg_value;
                });
                setUserAvgs(map);
            } catch (err) {
                console.error("Failed to load chart data:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const scoredUsers = users.filter(
        (u) => u.Role === "Employee" && Object.keys(userAvgs[u.ID] || {}).length > 0,
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
                    width: "min(95vw, 900px)",
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
                        Grafico andamento
                    </span>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray)", display: "flex" }}>
                        <CloseIcon style={{ width: "20px" }} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--gray)", fontSize: "0.9rem" }}>
                        Caricamento...
                    </div>
                ) : subcategories.length < 3 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--gray)", fontSize: "0.9rem" }}>
                        Nessuna categoria configurata.
                    </div>
                ) : (
                    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                        {/* Chart area */}
                        <div style={{ flex: 1, padding: "20px 50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <RadarChart
                                subcategories={subcategories}
                                scoredUsers={scoredUsers}
                                userAvgs={userAvgs}
                            />
                        </div>

                        {/* Legend */}
                        <div style={{ width: "200px", flexShrink: 0, borderLeft: "1px solid var(--light-primary)", padding: "20px", overflowY: "auto" }}>
                            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--gray)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
                                Legenda
                            </p>
                            {scoredUsers.length === 0 ? (
                                <p style={{ fontSize: "0.82rem", color: "var(--gray)" }}>Nessun dato disponibile</p>
                            ) : (
                                scoredUsers.map((user, ui) => {
                                    const color = PALETTE[ui % PALETTE.length];
                                    return (
                                        <div key={user.ID} style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
                                            <div style={{ width: "14px", height: "14px", borderRadius: "3px", background: color, flexShrink: 0 }} />
                                            <span style={{ fontSize: "0.82rem", color: "var(--black)", fontWeight: 500, lineHeight: 1.3 }}>
                                                {formatName(user.Username)}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GraficoModal;
