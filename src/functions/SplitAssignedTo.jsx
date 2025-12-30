export default function Splitter({ taskInfo, style, div }) {
    return (
        <div
            className={div ? div : "flex items-center gap-1 max-w-xs flex-wrap"}
        >
            {taskInfo.ASSIGNED_TO ? (
                taskInfo.ASSIGNED_TO.split(", ")
                    .filter((name) => name.trim())
                    .map((user, index, arr) => (
                        <p className={style} key={index}>
                            {user.split(".")[0].charAt(0).toUpperCase() +
                                user.split(".")[0].slice(1)}
                            {user.split(".")[1] && (
                                <>
                                    {" "}
                                    {user.split(".")[1].charAt(0).toUpperCase()}
                                </>
                            )}
                            {index !== arr.length - 1 ? ", " : ""}
                        </p>
                    ))
            ) : (
                <p className={style}>Nessuno</p>
            )}
        </div>
    );
}
