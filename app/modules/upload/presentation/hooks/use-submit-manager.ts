import { useState } from "react";
import { SubmitDataEntity } from "@modules/upload/domain/entities";
import { UploadApiRepository } from "@modules/upload/infrastructure/repositories";
import { SubmitDataUseCase } from "@modules/upload/application/use-cases";

export const useSubmitManager = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const repo = new UploadApiRepository();
    const useCase = new SubmitDataUseCase(repo); // Muy importante, aqui hacemos uso de caso de uso, por si en algun momento, tenemos otra implementacion del contrato, que no sea de la api

    const submit = async (data: SubmitDataEntity) => {
        setIsSubmitting(true);

        await useCase.execute(data);

        setIsSubmitting(false);
    }

    return {
        isSubmitting,
        submit
    }
}