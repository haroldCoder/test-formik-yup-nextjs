export interface UploadRepository {
    upload(file: File, signal?: AbortSignal): Promise<{ id: string; url: string }>;
}