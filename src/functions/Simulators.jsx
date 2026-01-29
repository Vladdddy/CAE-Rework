import ClockIcon from "../assets/icons/shifts.tsx";
import { useState, useEffect } from "react";
import SimulatorModal from "../components/modals/SimulatorModal.jsx";
import Task from "../components/data/Task.jsx";
import { useSimulators } from "../components/data/provider/simulatorAPI/useSimulators.js";

export function GetSimulators({
    type,
    time,
    date,
    taskList,
    status,
    onDeleteSuccess,
}) {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

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
                        : ""
                } `}
            >
                {simulators.map((simulator, index) => (
                    <div key={index} className={"flex flex-col gap-2"}>
                        {taskList || taskList.length === 0
                            ? date
                                ? (() => {
                                      const filteredTasks = taskList.filter(
                                          (task) => {
                                              const matchesTime =
                                                  task?.TIME === time;
                                              const matchesSimulator =
                                                  task?.SIMULATOR === simulator;

                                              // Properly format the date with zero-padding
                                              const year = date.getFullYear();
                                              const month = String(
                                                  date.getMonth() + 1,
                                              ).padStart(2, "0");
                                              const day = String(
                                                  date.getDate(),
                                              ).padStart(2, "0");
                                              const expectedDate = `${year}-${month}-${day}T00:00:00.000Z`;

                                              const matchesDate =
                                                  task?.DATE === expectedDate;

                                              return (
                                                  matchesTime &&
                                                  matchesSimulator &&
                                                  matchesDate
                                              );
                                          },
                                      );

                                      return filteredTasks.length > 0 ? (
                                          <>
                                              {type === "dashboard" && (
                                                  <p className="mt-4 text-sm text-[var(--primary)]">
                                                      {simulator}
                                                  </p>
                                              )}
                                              {filteredTasks.map((task) => (
                                                  <Task
                                                      key={task.id}
                                                      title={task?.TITLE}
                                                      date={formatDate(
                                                          task?.DATE,
                                                      )}
                                                      assignedTo={
                                                          task?.ASSIGNED_TO
                                                      }
                                                      status={task?.STATUS}
                                                      type="dashboard"
                                                      wholeTask={task}
                                                      onDeleteSuccess={
                                                          onDeleteSuccess
                                                      }
                                                  />
                                              ))}
                                          </>
                                      ) : null;
                                  })()
                                : status
                                  ? (() => {
                                        const filteredTasks = taskList.filter(
                                            (task) => {
                                                const matchesStatus =
                                                    task?.STATUS === status;
                                                const matchesSimulator =
                                                    task?.SIMULATOR ===
                                                    simulator;
                                                return (
                                                    matchesStatus &&
                                                    matchesSimulator
                                                );
                                            },
                                        );

                                        return filteredTasks.length > 0 ? (
                                            <>
                                                {type === "dashboard" && (
                                                    <p className="mt-4 text-sm text-[var(--primary)]">
                                                        {simulator}
                                                    </p>
                                                )}
                                                {filteredTasks.map((task) => (
                                                    <Task
                                                        key={task.id}
                                                        title={task?.TITLE}
                                                        date={formatDate(
                                                            task?.DATE,
                                                        )}
                                                        assignedTo={
                                                            task?.ASSIGNED_TO
                                                        }
                                                        status={task?.STATUS}
                                                        type="dashboard"
                                                        wholeTask={task}
                                                        onDeleteSuccess={
                                                            onDeleteSuccess
                                                        }
                                                    />
                                                ))}
                                            </>
                                        ) : null;
                                    })()
                                  : (() => {
                                        const filteredTasks = taskList.filter(
                                            (task) => {
                                                const matchesSimulator =
                                                    task?.SIMULATOR ===
                                                    simulator;
                                                return matchesSimulator;
                                            },
                                        );

                                        return filteredTasks.length > 0 ? (
                                            <>
                                                {type === "dashboard" && (
                                                    <p className="mt-4 text-sm text-[var(--primary)]">
                                                        {simulator}
                                                    </p>
                                                )}
                                                {filteredTasks.map((task) => (
                                                    <Task
                                                        key={task.id}
                                                        title={task?.TITLE}
                                                        date={formatDate(
                                                            task?.DATE,
                                                        )}
                                                        assignedTo={
                                                            task?.ASSIGNED_TO
                                                        }
                                                        status={task?.STATUS}
                                                        type="dashboard"
                                                        wholeTask={task}
                                                        onDeleteSuccess={
                                                            onDeleteSuccess
                                                        }
                                                    />
                                                ))}
                                            </>
                                        ) : null;
                                    })()
                            : null}
                    </div>
                ))}
            </div>
        </>
    );
}

export function GetSimulatorsList() {
    return ["FTD", "109FFS", "139#1", "139#3", "169", "189", "Others"];
}

export function GetTableSimulators({
    type,
    time,
    date,
    taskList,
    onDeleteSuccess,
}) {
    const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
    const [selectedSimulator, setSelectedSimulator] = useState(null);
    const { simulators: dbSimulators, fetchSimulators } = useSimulators();

    useEffect(() => {
        fetchSimulators();
    }, [date]);

    const handleSimulatorClick = (simulatorData) => {
        setSelectedSimulator(simulatorData);
        setIsSimulatorModalOpen(true);
    };

    const handleCloseSimulatorModal = () => {
        setIsSimulatorModalOpen(false);
        setSelectedSimulator(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const simulators = [
        "FTD",
        "109FFS",
        "139#1",
        "139#3",
        "169",
        "189",
        "Others",
    ];

    const findMatchingSimulator = (simulatorName) => {
        const selectedDate = localStorage.getItem("selectedDate");

        if (!selectedDate) return null;

        const dateObj = new Date(selectedDate + "T00:00:00");
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const formattedSelectedDate = `${year}-${month}-${day}`;

        /*const today = new Date("T00:00:00");
        const yearToday = today.getFullYear();
        const monthToday = String(today.getMonth() + 1).padStart(2, "0");
        const dayToday = String(today.getDate()).padStart(2, "0");
        const formattedSelectedDateToday = `${yearToday}-${monthToday}-${dayToday}`;*/

        const match = dbSimulators?.find((dbSim) => {
            if (!dbSim.CREATION_DATE) return false;

            const dbDateObj = new Date(dbSim.CREATION_DATE);
            const dbYear = dbDateObj.getFullYear();
            const dbMonth = String(dbDateObj.getMonth() + 1).padStart(2, "0");
            const dbDay = String(dbDateObj.getDate()).padStart(2, "0");
            const dbFormattedDate = `${dbYear}-${dbMonth}-${dbDay}`;

            return (
                dbSim.NAME === simulatorName &&
                dbFormattedDate === formattedSelectedDate
            );
        });

        return match;
    };

    return (
        <>
            <div
                className={`${
                    type === "table"
                        ? "grid grid-cols-7 gap-4 justify-start items-start gap-1"
                        : ""
                } `}
            >
                {simulators.map((simulator, index) => (
                    <div key={index} className={"flex flex-col gap-2"}>
                        <div className="flex items-center gap-1">
                            {/* Simulatore */}
                            {(() => {
                                const matchingSimulator =
                                    findMatchingSimulator(simulator);
                                return matchingSimulator ? (
                                    <div
                                        onClick={() =>
                                            handleSimulatorClick(
                                                matchingSimulator,
                                            )
                                        }
                                        className="bg-[var(--primary)] rounded-md p-1 flex items-center justify-center cursor-pointer hover:bg-[var(--primary-hover)] transition-all duration-200"
                                    >
                                        <ClockIcon className="w-4 text-[#ffffff]" />
                                    </div>
                                ) : null;
                            })()}
                            <p className="text-center text-[var(--primary)] bg-[var(--light-primary)] rounded-md px-2 flex-1">
                                {simulator}
                            </p>
                        </div>
                        {!taskList || taskList.length === 0
                            ? ""
                            : (() => {
                                  const filteredTasks = taskList.filter(
                                      (task) => {
                                          const matchesTime =
                                              task?.TIME === time;
                                          const matchesSimulator =
                                              task?.SIMULATOR === simulator;
                                          const month = String(
                                              date.getMonth() + 1,
                                          ).padStart(2, "0");
                                          const day = String(
                                              date.getDate(),
                                          ).padStart(2, "0");
                                          const formattedDate = `${date.getFullYear()}-${month}-${day}T00:00:00.000Z`;

                                          const matchesDate =
                                              task?.DATE === formattedDate;

                                          return (
                                              matchesTime &&
                                              matchesSimulator &&
                                              matchesDate
                                          );
                                      },
                                  );

                                  return filteredTasks.length > 0 ? (
                                      <>
                                          {filteredTasks.map((task) => (
                                              <Task
                                                  key={task.id}
                                                  title={task?.TITLE}
                                                  date={formatDate(task?.DATE)}
                                                  assignedTo={task?.ASSIGNED_TO}
                                                  status={task?.STATUS}
                                                  type="table"
                                                  wholeTask={task}
                                                  onDeleteSuccess={
                                                      onDeleteSuccess
                                                  }
                                              />
                                          ))}
                                      </>
                                  ) : null;
                              })()}
                    </div>
                ))}

                {isSimulatorModalOpen && selectedSimulator && (
                    <SimulatorModal
                        onClose={handleCloseSimulatorModal}
                        simulatorInfo={selectedSimulator.NAME}
                        startTime={selectedSimulator.START_HOUR}
                        endTime={selectedSimulator.END_HOUR}
                        assignee={selectedSimulator.ASSIGNED_TO}
                    />
                )}
            </div>
        </>
    );
}
