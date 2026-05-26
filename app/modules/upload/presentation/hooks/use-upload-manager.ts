"use client";

import { useRef, useState } from "react";
import { UploadFilesUseCase } from "@modules/upload/application/use-cases";
import { UploadApiRepository } from "@modules/upload/infrastructure/repositories";
import { limitConcurrency } from "../../application/utils";
import { UploadItem } from "../types";

export const useUploadManager = () => {
    const [files, setFiles] = useState<UploadItem[]>([]);
    const repo = new UploadApiRepository();
    const useCase = new UploadFilesUseCase(repo);

    // controla AbortControllers por archivo
    const controllers = useRef<Map<string, AbortController>>(new Map());

    const addFiles = (newFiles: File[]) => {
        const mapped: UploadItem[] = newFiles.map((file) => ({
            id: crypto.randomUUID(),
            file,
            status: "idle",
            progress: 0,
        }));

        setFiles((prev) => [...prev, ...mapped]);
    };

    const uploadFile = async (item: UploadItem) => {
        const controller = new AbortController();

        controllers.current.set(item.id, controller);

        // actualizar estado a uploading
        setFiles((prev) =>
            prev.map((f) =>
                f.id === item.id
                    ? { ...f, status: "uploading", progress: 0 }
                    : f
            )
        );

        try {
            const response = await useCase.execute(item.file, controller.signal);

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === item.id
                        ? {
                            ...f,
                            status: "done",
                            progress: 100,
                            url: response.url,
                        }
                        : f
                )
            );

            controllers.current.delete(item.id);
        } catch (err) {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === item.id
                        ? { ...f, status: "error", error: "Upload failed" }
                        : f
                )
            );

            controllers.current.delete(item.id);
        }
    };

    const cancelUpload = (id: string) => {
        const controller = controllers.current.get(id);

        if (!controller) return;

        controller.abort();

        setFiles((prev) =>
            prev.map((f) =>
                f.id === id
                    ? { ...f, status: "canceled" }
                    : f
            )
        );

        controllers.current.delete(id);
    };

    const uploadAll = async () => {
        const pending = files.filter((f) => f.status === "idle");

        // maximo 3 uploads simultaneos
        await limitConcurrency(3, pending.map((f) => () => uploadFile(f)));
    };

    const reset = () => {
        controllers.current.forEach((c) => c.abort());
        controllers.current.clear();
        setFiles([]);
    };

    return {
        files,
        addFiles,
        uploadFile,
        uploadAll,
        cancelUpload,
        reset,
    };
}