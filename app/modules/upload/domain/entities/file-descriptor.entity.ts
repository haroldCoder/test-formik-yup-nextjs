import { MAX_FILE_SIZE } from "../constants";
import { UploadStatus } from "../types";

export class FileDescriptorEntity {
    id: string;
    name: string;
    size: number;
    type: string;
    status: UploadStatus;
    progress: number;
    error?: string;
    url?: string;

    constructor(params: {
        id: string;
        name: string;
        size: number;
        type: string;
        status: UploadStatus;
        progress: number;
        error?: string;
        url?: string;
    }) {
        if (params.size > MAX_FILE_SIZE) { // reglas basicas de negocio, para asegurar la integridad de los datos
            throw new Error('File exceeds max size');
        }

        if (params.status === 'uploading' && params.progress === undefined) {
            throw new Error('Uploading file must have progress');
        }

        if (params.status !== 'uploading' && params.progress !== undefined) {
            throw new Error('Only uploading files can have progress');
        }

        this.id = params.id;
        this.name = params.name;
        this.size = params.size;
        this.type = params.type;
        this.status = params.status;
        this.progress = params.progress;
        this.error = params.error;
        this.url = params.url;
    }

    updateProgress(progress: number): FileDescriptorEntity {
        if (!this.canUpdateProgress()) return this;

        return new FileDescriptorEntity({
            ...this,
            progress: Math.min(100, Math.max(0, progress)),
        });
    }

    markAsDone(url: string): FileDescriptorEntity {
        return new FileDescriptorEntity({
            ...this,
            status: 'done',
            progress: 100,
            url,
        });
    }

    markAsError(error: string): FileDescriptorEntity {
        return new FileDescriptorEntity({
            ...this,
            status: 'error',
            error,
        });
    }

    cancel(): FileDescriptorEntity {
        return new FileDescriptorEntity({
            ...this,
            status: 'canceled',
            progress: 0,
        });
    }

    canUpdateProgress(): boolean {
        return this.status === 'uploading';
    }

    isValidFormatSize(): boolean {
        return this.size <= MAX_FILE_SIZE;
    }
}