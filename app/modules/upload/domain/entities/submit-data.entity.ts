import { FileDescriptorEntity } from "./file-descriptor.entity";

export interface SubmitDataEntity {
    title: string;
    description: string;
    files: FileDescriptorEntity[];
}