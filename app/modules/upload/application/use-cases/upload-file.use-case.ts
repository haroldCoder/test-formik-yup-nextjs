import { UploadRepository } from "@modules/upload/domain/repositories";

export class UploadFilesUseCase {
    constructor(private repo: UploadRepository) { }

    async execute(file: File, signal?: AbortSignal) {
        return this.repo.upload(file, signal);
    }
}