import { SubmitDataEntity } from "../entities";

export interface UploadRepository {
    upload(file: File, signal?: AbortSignal): Promise<{ id: string; url: string }>;
    submit(data: SubmitDataEntity): Promise<boolean>;
}