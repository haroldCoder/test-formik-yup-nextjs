import { UploadRepository } from "@modules/upload/domain/repositories";

export class UploadFilesUseCase {
    constructor(private repo: UploadRepository) { }

    execute(file: File) {
        return this.repo.upload(file);
    }
}