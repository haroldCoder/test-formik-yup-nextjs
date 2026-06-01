import { SubmitDataEntity } from "../entities";

export interface UploadRepository {
    upload(file: File, signal?: AbortSignal, onProgress?: (progress: number) => void): Promise<{ id: string; url: string }>;
    submit(data: SubmitDataEntity): Promise<boolean>;
}