import React from "react";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";

function Shifts() {
    const [isSidebarOpen, setSidebarStatus] = useState(() => {
        const saved = localStorage.getItem("sidebarOpen");
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    return (
        <section className="flex">
            <Sidebar active="shifts" isSidebarOpen={isSidebarOpen} />

            <div className="flex-1">
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    setSidebarStatus={setSidebarStatus}
                />

                <h1 className="text-xl text-center text-[var(--gray)] mt-32">
                    La pagina Shifts è in fase di sviluppo.
                </h1>
            </div>
        </section>
    );
}

export default Shifts;
