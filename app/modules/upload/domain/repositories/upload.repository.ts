export interface UploadRepository {
    upload(file: File): Promise<{ id: string; url: string }>;
}