import { UploadResultDto } from "@modules/upload/infrastructure/dtos";
import { UploadRepository } from "@modules/upload/domain/repositories";
import { SubmitDataEntity } from "../../domain/entities";

export class UploadApiRepository implements UploadRepository {
    upload(file: File, signal?: AbortSignal, onProgress?: (progress: number) => void): Promise<UploadResultDto> {
        return new Promise((resolve, reject) => {
            const form = new FormData();
            form.append('file', file);

            const xhr = new XMLHttpRequest(); // usamos xmlhttprequest para poder gestionar el estado y el progreso de la subida, lo que no podemos hacer con fetch
            xhr.open('POST', '/api/upload');

            if (signal) {
                signal.addEventListener('abort', () => { // si la peticion se cancela, se aborta la peticion
                    xhr.abort();
                    reject(new DOMException('Aborted', 'AbortError'));
                });
            }

            xhr.upload.onprogress = (event) => { // obtenemos el progreso de la subida
                if (event.lengthComputable && onProgress) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    onProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) { // 2xx son exitos, 3xx redicrecion, 4xx error del cliente, 5xx error del servidor
                    try {
                        const data = JSON.parse(xhr.responseText) as UploadResultDto;
                        if (!data.url) throw new Error("Invalid upload response"); // si no hay url, lanzamos error
                        resolve(data);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    try { // si no es exito, lanzamos error
                        const data = JSON.parse(xhr.responseText);
                        reject(new Error(data.error || 'Failed to upload file'));
                    } catch {
                        reject(new Error('Failed to upload file'));
                    }
                }
            };

            xhr.onerror = () => reject(new Error('Network error during upload')); // si hay error de red, lanzamos error

            xhr.send(form); // enviamos el formulario
        });
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