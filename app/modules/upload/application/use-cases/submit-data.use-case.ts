import { SubmitDataEntity } from "@modules/upload/domain/entities";
import { UploadRepository } from "@modules/upload/domain/repositories";

export class SubmitDataUseCase {
    constructor(private readonly repository: UploadRepository) { }

    async execute(data: SubmitDataEntity) {
        return await this.repository.submit(data);
    }
}