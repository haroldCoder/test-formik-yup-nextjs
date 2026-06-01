import { FileDescriptor } from "../../domain/types/file-descriptor";

export function mapFilesToDescriptors(files: FileList | File[]): FileDescriptor[] {
    const filesArray = Array.isArray(files) ? files : Array.from(files);

    // Remover duplicados por nombre y tamaño
    const uniqueFiles = filesArray.filter((file, index, self) =>
        index === self.findIndex((f) => f.name === file.name && f.size === file.size)
    );

    return uniqueFiles.map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'idle'
    }));
}
