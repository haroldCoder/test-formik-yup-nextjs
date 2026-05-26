import { UploadStatus } from "@modules/upload/domain/types";

export type UploadItem = {
    id: string;
    file: File;
    status: UploadStatus;
    progress: number;
    url?: string;
    error?: string;
    retryCount: number;
};