import { FileDescriptor } from "../types/file-descriptor";

export interface SubmitDataEntity {
    title: string;
    description: string;
    files: FileDescriptor[];
}