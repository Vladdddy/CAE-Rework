import React, { useState } from "react";

function Update({ title, text, date }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col p-2 bg-[var(--light-primary)] rounded-md">
            <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-lg text-[var(--black)]">
                    {title}
                </p>
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "Collapse update" : "Expand update"}
                    className="p-1 text-[var(--gray)] hover:text-[var(--black)]"
                >
                    <svg
                        className={`h-4 w-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : "rotate-0"
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <>
                    <p className="text-sm text-[var(--gray)]">{text}</p>
                    <p className="text-end text-xs text-[var(--gray)] mt-1">
                        {date}
                    </p>
                </>
            )}
        </div>
    );
}

export default Update;
