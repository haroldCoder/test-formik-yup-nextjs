import { UploadResultDto } from "@modules/upload/infrastructure/dtos";
import { UploadRepository } from "@modules/upload/domain/repositories";

export class UploadApiRepository implements UploadRepository {
    async upload(file: File, signal?: AbortSignal): Promise<UploadResultDto> {
        try {
            const form = new FormData();
            form.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: form,
                signal
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            const data = await response.json() as UploadResultDto;
            if (!data.url) {
                throw new Error("Invalid upload response");
            }

            return response.json() as Promise<UploadResultDto>;
        } catch (err) {
            console.error('Upload failed:', err);
            throw err;
        }
    }
}