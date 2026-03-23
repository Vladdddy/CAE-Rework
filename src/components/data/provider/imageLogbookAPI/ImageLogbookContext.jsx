import { useCallback, useState } from "react";
import { ImageLogbookContext } from "./imageLogbookContext";

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

const getAttachmentLogbookId = (image) => image?.LOGBOOK_ID ?? image?.logbookId;

const getLogbookRelativePath = (path) => {
    const normalizedPath = normalizePath(path);
    const match = normalizedPath.match(/(Logbook-\d+\/.+)$/i);

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

    const logbookRelativePath = getLogbookRelativePath(path);
    const normalizedPath = normalizePath(path);
    const fileName = getFileNameFromPath(path);
    const logbookId = getAttachmentLogbookId(image);
    const imageId = getAttachmentId(image);
    const base = getApiBase();
    const endpointBase = base || "";

    const candidates = [
        joinApiPath(normalizedPath),
        logbookRelativePath && joinApiPath(logbookRelativePath),
        logbookRelativePath && joinApiPath(`uploads/${logbookRelativePath}`),
        logbookRelativePath && joinApiPath(`allegati/${logbookRelativePath}`),
        logbookRelativePath &&
            joinApiPath(`attachments/${logbookRelativePath}`),
        logbookId &&
            fileName &&
            joinApiPath(`Logbook-${logbookId}/${fileName}`),
        logbookId &&
            fileName &&
            joinApiPath(`uploads/Logbook-${logbookId}/${fileName}`),
        imageId && `${endpointBase}/imageLogbook/file/${imageId}`,
        imageId && `${endpointBase}/imageLogbook/${imageId}/file`,
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
    const logbookRelativePath = getLogbookRelativePath(path);

    const candidates = [
        localPreviewByPath[normalizedPath],
        logbookRelativePath &&
            localPreviewByPath[normalizePath(logbookRelativePath)],
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

const buildUploadedImage = (
    data,
    logbookId,
    fallbackPath,
    originalFileName,
) => {
    const originalName =
        data?.originalFileName ??
        data?.ORIGINAL_FILE_NAME ??
        data?.originalName ??
        data?.ORIGINAL_NAME ??
        originalFileName;

    return {
        ID: data?.id ?? data?.ID,
        LOGBOOK_ID: Number(logbookId),
        PATH: data?.path ?? data?.PATH ?? fallbackPath,
        FILE_NAME: data?.fileName ?? data?.FILE_NAME ?? fallbackPath,
        ORIGINAL_FILE_NAME: originalName,
        DISPLAY_NAME: originalName,
    };
};

export const ImageLogbookProvider = ({ children }) => {
    const [imagesByLogbook, setImagesByLogbook] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [localPreviewByPath, setLocalPreviewByPath] = useState({});

    const fetchLogbookImages = useCallback(async (logbookId) => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/imageLogbook/${logbookId}`,
            );

            if (!response.ok) {
                throw new Error("Failed to fetch logbook attachments");
            }

            const data = await response.json();
            setImagesByLogbook((prev) => ({ ...prev, [logbookId]: data }));

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message, data: [] };
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadLogbookImages = useCallback(async (logbookId, files) => {
        if (!files || files.length === 0) {
            return { success: true, data: [] };
        }

        try {
            setLoading(true);

            const uploadedImages = [];

            for (const file of files) {
                const logbookFolder = `Logbook-${logbookId}`;
                const relativePath = `${logbookFolder}/${file.name}`;
                const localPreviewUrl = URL.createObjectURL(file);

                // Backend usually expects JSON payloads for create operations.
                const response = await fetch(
                    `${API_URL}/imageLogbook/${logbookId}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            path: relativePath,
                            folder: logbookFolder,
                            fileName: file.name,
                            filename: file.name,
                            originalName: file.name,
                            originalFileName: file.name,
                        }),
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    uploadedImages.push({
                        ...buildUploadedImage(
                            data,
                            logbookId,
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
                formData.append("folder", logbookFolder);
                formData.append("originalName", file.name);
                formData.append("originalFileName", file.name);

                const fallbackResponse = await fetch(
                    `${API_URL}/imageLogbook/${logbookId}`,
                    {
                        method: "POST",
                        body: formData,
                    },
                );

                if (!fallbackResponse.ok) {
                    throw new Error("Failed to upload logbook attachment");
                }

                const fallbackData = await fallbackResponse.json();
                uploadedImages.push({
                    ...buildUploadedImage(
                        fallbackData,
                        logbookId,
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

            setImagesByLogbook((prev) => ({
                ...prev,
                [logbookId]: [...(prev[logbookId] || []), ...uploadedImages],
            }));

            return { success: true, data: uploadedImages };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteLogbookImage = useCallback(async (imageId, logbookId) => {
        try {
            const response = await fetch(`${API_URL}/imageLogbook/${imageId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete logbook attachment");
            }

            setImagesByLogbook((prev) => ({
                ...prev,
                [logbookId]: (prev[logbookId] || []).filter(
                    (image) => image.ID !== imageId && image.id !== imageId,
                ),
            }));

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    const getLogbookImages = useCallback(
        (logbookId) => imagesByLogbook[logbookId] || [],
        [imagesByLogbook],
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

    return (
        <ImageLogbookContext.Provider
            value={{
                imagesByLogbook,
                loading,
                error,
                fetchLogbookImages,
                uploadLogbookImages,
                deleteLogbookImage,
                getLogbookImages,
                getAttachmentLabel,
                getAttachmentPreviewUrl,
                getAttachmentPreviewSources,
                isImageFile,
            }}
        >
            {children}
        </ImageLogbookContext.Provider>
    );
};
