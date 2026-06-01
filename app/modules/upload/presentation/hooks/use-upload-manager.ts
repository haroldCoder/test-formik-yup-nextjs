"use client";

import { useRef, useState } from "react";
import { UploadFilesUseCase } from "@modules/upload/application/use-cases";
import { UploadApiRepository } from "@modules/upload/infrastructure/repositories";
import { limitConcurrency, mapFilesToDescriptors } from "../../application/utils";
import { UploadItem } from "../types";
import { FileDescriptorEntity } from "../../domain/entities";

export const useUploadManager = () => {
    const [files, setFiles] = useState<UploadItem[]>([]);
    const repo = new UploadApiRepository();
    const useCase = new UploadFilesUseCase(repo);

    // controla AbortControllers por archivo
    const controllers = useRef<Map<string, AbortController>>(new Map());

    const addFiles = (newFiles: File[]) => {
        const descriptors = mapFilesToDescriptors(newFiles);
        const mapped: UploadItem[] = descriptors.map((desc, i) => ({
            ...desc,
            file: newFiles[i],
            retryCount: 0,
        }));

        setFiles((prev) => [...prev, ...mapped]);
    };

    const uploadFile = async (item: UploadItem, actionError?: (err: Error) => void) => {
        const controller = new AbortController();

        controllers.current.set(item.id, controller);

        try {
            if (!new FileDescriptorEntity({ // Aplicamos reglas de negocio, para verificar si el archivo que quiere subir el usuario tiene el tamaño ideal
                id: item.id,
                name: item.file.name,
                size: item.file.size,
                type: item.file.type,
                status: "idle",
                progress: 0
            }).isValidFormatSize()) { // Aplicamos reglas de negocio
                throw new Error('Invalid file format size');
            }

            // actualizar estado a uploading
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === item.id
                        ? { ...f, status: "uploading", progress: 0, error: undefined }
                        : f
                )
            );

            const onProgress = (progress: number) => {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === item.id && f.status === "uploading"
                            ? { ...f, progress }
                            : f
                    )
                );
            };

            const response = await useCase.execute(item.file, controller.signal, onProgress);

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

        } catch (err: any) {
            // Si el upload fue cancelado intencionalmente, no sobreescribir el estado 'canceled' con 'error'
            if (err.name === 'AbortError') return;

            actionError?.(err); // lo llamamos si hay error, para que se encargue del formik, o lo que se tenga que hacer, muy recomendado para separar responsabilidades.

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === item.id
                        ? { ...f, status: "error", error: err.message || "Upload failed" }
                        : f
                )
            );
        } finally {
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

    const uploadAll = async ({ actionError }: { actionError: (err: Error) => void }) => {
        const pending = files.filter((f) => f.status === "idle");

        // maximo 3 uploads simultaneos
        await limitConcurrency(3, pending.map((f) => () => uploadFile(f, actionError)));
    };

    const reset = (callback?: () => void) => {
        controllers.current.forEach((c) => c.abort());
        controllers.current.clear();
        setFiles([]);
        callback?.(); // Dejamos este callback aqui, en este caso segun la aplicacion y su flujo seria para limpiar el formik
    };

    const retryUpload = async (id: string) => {
        const fileToRetry = files.find((f) => f.id === id);

        if (!fileToRetry) return;

        // solo retry si falló o fue cancelado
        if (
            fileToRetry.status !== "error" &&
            fileToRetry.status !== "canceled"
        ) {
            return;
        }

        // actualizar retry count
        setFiles((prev) =>
            prev.map((f) =>
                f.id === id
                    ? {
                        ...f,
                        retryCount: f.retryCount + 1,
                        status: "idle",
                        error: undefined, // quitamos el error
                    }
                    : f
            )
        );

        // ejecutar upload nuevamente
        const retryItem = {
            ...fileToRetry,
            retryCount: fileToRetry.retryCount + 1,
            status: "idle" as const,
        };
        // @ts-ignore
        delete retryItem.error;
        await uploadFile(retryItem);
    }

    const removeFiles = ({ ids }: { ids: string[] }) => {
        setFiles((prev) => prev.filter((f) => !ids.includes(f.id)));
    }

    return {
        files,
        addFiles,
        uploadFile,
        uploadAll,
        cancelUpload,
        reset,
        retryUpload,
        removeFiles
    };
}