import { UploadResultDto } from "@modules/upload/infrastructure/dtos";
import { UploadRepository } from "@modules/upload/domain/repositories";
import { SubmitDataEntity } from "../../domain/entities";

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

            const data = await response.json() as UploadResultDto; // solamente tomamos la respuesta una vez, para posteriormente retornarla
            if (!data.url) {
                throw new Error("Invalid upload response");
            }

            return data;
        } catch (err) {
            console.error('Upload failed:', err);
            throw err;
        }
    }

    async submit(data: SubmitDataEntity): Promise<boolean> {
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to submit data');
            }

            return true;
        } catch (err) {
            console.error('Failed to submit data:', err);
            throw err;
        }
    }
}