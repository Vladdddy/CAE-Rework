import { useCallback, useState } from "react";
import { ImageTaskContext } from "./imageTaskContext";

const API_URL = import.meta.env.VITE_API_URL;

const getFileNameFromPath = (path) => {
    if (!path) {
        return "Allegato";
    }

    return path.split(/[\\/]/).pop() || path;
};

const getOriginalNameFromImage = (image) => {
    if (!image) {
        return "";
    }

    return (
        image?.ORIGINAL_FILE_NAME ||
        image?.originalFileName ||
        image?.ORIGINAL_NAME ||
        image?.originalName ||
        image?.DISPLAY_NAME ||
        image?.displayName ||
        ""
    );
};

const normalizePath = (path) => {
    if (!path) {
        return "";
    }

    return String(path).replace(/\\/g, "/").replace(/^\/+/, "");
};

const encodePath = (path) =>
    normalizePath(path)
        .split("/")
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join("/");

const getApiBase = () => String(API_URL || "").replace(/\/+$/, "");

const joinApiPath = (path) => {
    const encodedPath = encodePath(path);

    if (!encodedPath) {
        return "";
    }

    const base = getApiBase();

    if (!base) {
        return `/${encodedPath}`;
    }

    return `${base}/${encodedPath}`;
};

const getAttachmentPath = (image) => image?.PATH || image?.path || "";

const getAttachmentId = (image) => image?.ID ?? image?.id;

const getAttachmentTaskId = (image) => image?.TASK_ID ?? image?.taskId;

const getTaskRelativePath = (path) => {
    const normalizedPath = normalizePath(path);
    const match = normalizedPath.match(/(Task-\d+\/.+)$/i);

    return match ? match[1] : "";
};

const getAttachmentPreviewCandidates = (image) => {
    const path = getAttachmentPath(image);

    if (!path) {
        return [];
    }

    if (/^https?:\/\//i.test(path)) {
        return [path];
    }

    const taskRelativePath = getTaskRelativePath(path);
    const normalizedPath = normalizePath(path);
    const fileName = getFileNameFromPath(path);
    const taskId = getAttachmentTaskId(image);
    const imageId = getAttachmentId(image);
    const base = getApiBase();
    const endpointBase = base || "";

    const candidates = [
        joinApiPath(normalizedPath),
        taskRelativePath && joinApiPath(taskRelativePath),
        taskRelativePath && joinApiPath(`uploads/${taskRelativePath}`),
        taskRelativePath && joinApiPath(`allegati/${taskRelativePath}`),
        taskRelativePath && joinApiPath(`attachments/${taskRelativePath}`),
        taskId && fileName && joinApiPath(`Task-${taskId}/${fileName}`),
        taskId && fileName && joinApiPath(`uploads/Task-${taskId}/${fileName}`),
        imageId && `${endpointBase}/imageTask/file/${imageId}`,
        imageId && `${endpointBase}/imageTask/${imageId}/file`,
    ];

    return candidates.filter(Boolean).filter((value, index, array) => {
        return array.indexOf(value) === index;
    });
};

const getLocalPreviewCandidates = (image, localPreviewByPath) => {
    const path = getAttachmentPath(image);

    if (!path) {
        return [];
    }

    const normalizedPath = normalizePath(path);
    const taskRelativePath = getTaskRelativePath(path);

    const candidates = [
        localPreviewByPath[normalizedPath],
        taskRelativePath && localPreviewByPath[normalizePath(taskRelativePath)],
        image?.LOCAL_PREVIEW_URL,
        image?.localPreviewUrl,
    ];

    return candidates.filter(Boolean).filter((value, index, array) => {
        return array.indexOf(value) === index;
    });
};

const getAttachmentUrl = (image) => {
    const candidates = getAttachmentPreviewCandidates(image);

    return candidates[0] || "";
};

const isImageAttachment = (image) => {
    const label =
        getOriginalNameFromImage(image) ||
        image?.FILE_NAME ||
        image?.fileName ||
        getAttachmentPath(image);

    return /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i.test(label || "");
};

const buildUploadedImage = (data, taskId, fallbackPath, originalFileName) => {
    const originalName =
        data?.originalFileName ??
        data?.ORIGINAL_FILE_NAME ??
        data?.originalName ??
        data?.ORIGINAL_NAME ??
        originalFileName;

    return {
        ID: data?.id ?? data?.ID,
        TASK_ID: Number(taskId),
        PATH: data?.path ?? data?.PATH ?? fallbackPath,
        FILE_NAME: data?.fileName ?? data?.FILE_NAME ?? fallbackPath,
        ORIGINAL_FILE_NAME: originalName,
        DISPLAY_NAME: originalName,
    };
};

export const ImageTaskProvider = ({ children }) => {
    const [imagesByTask, setImagesByTask] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [localPreviewByPath, setLocalPreviewByPath] = useState({});

    const fetchTaskImages = useCallback(async (taskId) => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/imageTask/${taskId}`);

            if (!response.ok) {
                throw new Error("Failed to fetch task attachments");
            }

            const data = await response.json();
            setImagesByTask((prev) => ({ ...prev, [taskId]: data }));

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message, data: [] };
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadTaskImages = useCallback(async (taskId, files) => {
        if (!files || files.length === 0) {
            return { success: true, data: [] };
        }

        try {
            setLoading(true);

            const uploadedImages = [];

            for (const file of files) {
                const taskFolder = `Task-${taskId}`;
                const relativePath = `${taskFolder}/${file.name}`;
                const localPreviewUrl = URL.createObjectURL(file);

                // Backend usually expects JSON payloads for create operations.
                const response = await fetch(`${API_URL}/imageTask/${taskId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        path: relativePath,
                        folder: taskFolder,
                        fileName: file.name,
                        filename: file.name,
                        originalName: file.name,
                        originalFileName: file.name,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    uploadedImages.push({
                        ...buildUploadedImage(
                            data,
                            taskId,
                            relativePath,
                            file.name,
                        ),
                        LOCAL_PREVIEW_URL: localPreviewUrl,
                    });

                    setLocalPreviewByPath((prev) => ({
                        ...prev,
                        [normalizePath(relativePath)]: localPreviewUrl,
                        [normalizePath(data?.path ?? data?.PATH ?? "")]:
                            localPreviewUrl,
                    }));
                    continue;
                }

                const formData = new FormData();
                formData.append("file", file);
                formData.append("filename", file.name);
                formData.append("path", relativePath);
                formData.append("folder", taskFolder);
                formData.append("originalName", file.name);
                formData.append("originalFileName", file.name);

                const fallbackResponse = await fetch(
                    `${API_URL}/imageTask/${taskId}`,
                    {
                        method: "POST",
                        body: formData,
                    },
                );

                if (!fallbackResponse.ok) {
                    throw new Error("Failed to upload task attachment");
                }

                const fallbackData = await fallbackResponse.json();
                uploadedImages.push({
                    ...buildUploadedImage(
                        fallbackData,
                        taskId,
                        relativePath,
                        file.name,
                    ),
                    LOCAL_PREVIEW_URL: localPreviewUrl,
                });

                setLocalPreviewByPath((prev) => ({
                    ...prev,
                    [normalizePath(relativePath)]: localPreviewUrl,
                    [normalizePath(
                        fallbackData?.path ?? fallbackData?.PATH ?? "",
                    )]: localPreviewUrl,
                }));
            }

            setImagesByTask((prev) => ({
                ...prev,
                [taskId]: [...(prev[taskId] || []), ...uploadedImages],
            }));

            return { success: true, data: uploadedImages };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTaskImage = useCallback(async (imageId, taskId) => {
        try {
            const response = await fetch(`${API_URL}/imageTask/${imageId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete task attachment");
            }

            setImagesByTask((prev) => ({
                ...prev,
                [taskId]: (prev[taskId] || []).filter(
                    (image) => image.ID !== imageId && image.id !== imageId,
                ),
            }));

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    const getTaskImages = useCallback(
        (taskId) => imagesByTask[taskId] || [],
        [imagesByTask],
    );

    const getAttachmentLabel = useCallback((image) => {
        return (
            image.ORIGINAL_FILE_NAME ||
            image.originalFileName ||
            image.ORIGINAL_NAME ||
            image.originalName ||
            image.DISPLAY_NAME ||
            image.displayName ||
            image.FILE_NAME ||
            image.fileName ||
            getFileNameFromPath(image.PATH || image.path)
        );
    }, []);

    const getAttachmentPreviewUrl = useCallback(
        (image) => {
            const localPreviewCandidates = getLocalPreviewCandidates(
                image,
                localPreviewByPath,
            );

            if (localPreviewCandidates.length > 0) {
                return localPreviewCandidates[0];
            }

            return getAttachmentUrl(image);
        },
        [localPreviewByPath],
    );

    const getAttachmentPreviewSources = useCallback(
        (image) => {
            const localPreviewCandidates = getLocalPreviewCandidates(
                image,
                localPreviewByPath,
            );
            const remotePreviewCandidates =
                getAttachmentPreviewCandidates(image);

            return [
                ...localPreviewCandidates,
                ...remotePreviewCandidates,
            ].filter((value, index, array) => array.indexOf(value) === index);
        },
        [localPreviewByPath],
    );

    const isImageFile = useCallback((image) => isImageAttachment(image), []);

    const copyTaskImages = useCallback(async (originalTaskId, newTaskId) => {
        try {
            const fetchResponse = await fetch(`${API_URL}/imageTask/${originalTaskId}`);
            if (!fetchResponse.ok) {
                return { success: false, copied: 0, failed: 0 };
            }
            const attachments = await fetchResponse.json();
            if (!attachments || attachments.length === 0) {
                return { success: true, copied: 0, failed: 0 };
            }

            let copied = 0;
            let failed = 0;

            for (const attachment of attachments) {
                const attachmentPath = attachment.PATH || attachment.path || "";
                if (!attachmentPath) {
                    failed++;
                    continue;
                }
                const postResponse = await fetch(`${API_URL}/imageTask/${newTaskId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path: attachmentPath }),
                });
                if (postResponse.ok) {
                    copied++;
                } else {
                    failed++;
                }
            }

            return { success: failed === 0, copied, failed };
        } catch {
            return { success: false, copied: 0, failed: 0 };
        }
    }, []);

    return (
        <ImageTaskContext.Provider
            value={{
                imagesByTask,
                loading,
                error,
                fetchTaskImages,
                uploadTaskImages,
                deleteTaskImage,
                getTaskImages,
                getAttachmentLabel,
                getAttachmentPreviewUrl,
                getAttachmentPreviewSources,
                isImageFile,
                copyTaskImages,
            }}
        >
            {children}
        </ImageTaskContext.Provider>
    );
};
