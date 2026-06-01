import { FileDescriptor } from "../../domain/types/file-descriptor";

export type UploadItem = FileDescriptor & {
    file: File;
    retryCount: number;
};