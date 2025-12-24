export default function GetSimulators({ type }) {
    const simulators = [
        "FTD",
        "109FFS",
        "139#1",
        "139#3",
        "169",
        "189",
        "Others",
    ];

    return (
        <>
            <div
                className={`${
                    type === "table"
                        ? "grid grid-cols-7 gap-4 justify-start items-start gap-1"
                        : "flex flex-col gap-2"
                } `}
            >
                {simulators.map((simulator, index) => (
                    <div
                        className={`${
                            type === "table" ? "flex flex-col gap-2" : ""
                        } `}
                    >
                        {type === "dashboard" ? (
                            <p
                                key={index}
                                className="mt-4 text-sm text-[var(--primary)]"
                            >
                                {simulator}
                            </p>
                        ) : type === "table" ? (
                            <p
                                key={index}
                                className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2"
                            >
                                {simulator}
                            </p>
                        ) : null}
                        <p>{index} task</p>
                    </div>
                ))}
            </div>
        </>
    );
}
