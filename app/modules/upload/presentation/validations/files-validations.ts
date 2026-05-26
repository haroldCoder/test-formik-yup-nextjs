import { UploadItem } from "../types";

export class FileValidations {
    static validateFilesNotRepeat = (files: UploadItem[]): string[] => {
        const seen = new Map<string, string>(); // key -> id duplicado
        const duplicates: string[] = [];

        for (const file of files) {
            const key = `${file.file.name}-${file.file.size}`;

            if (seen.has(key)) {
                duplicates.push(file.id);
            } else {
                seen.set(key, file.id);
            }
        }

        return duplicates; // retornar los id de los archivos repetidos
    }
}