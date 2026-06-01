import { UploadRepository } from "@modules/upload/domain/repositories";

export class UploadFilesUseCase {
    constructor(private repo: UploadRepository) { }

    async execute(file: File, signal?: AbortSignal, onProgress?: (progress: number) => void) {
        return this.repo.upload(file, signal, onProgress);
    }
}