import { STATUS_BADGE, STATUS_LABEL } from "../constants";
import { UploadItem } from "../types";
import { formatBytes } from "../utils";

interface CardFilesProps {
    file: UploadItem;
    cancelUpload: (id: string) => void;
}

export const CardFiles = ({ file, cancelUpload }: CardFilesProps) => {
    return (
        <li
            key={file.id}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 space-y-2"
        >
            {/* File name + status badge */}
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white truncate max-w-[70%]">
                    {file.file.name}
                </p>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[file.status] ?? ""}`}>
                    {STATUS_LABEL[file.status] ?? file.status}
                </span>
            </div>

            {/* File size */}
            <p className="text-xs text-zinc-500">
                {formatBytes(file.file.size)}
            </p>

            {/* Progress bar */}
            {(file.status === "uploading" || file.status === "done") && (
                <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${file.status === "done"
                            ? "bg-emerald-500"
                            : "bg-indigo-500"
                            }`}
                        style={{ width: `${file.progress}%` }}
                    />
                </div>
            )}

            {/* Error message */}
            {file.status === "error" && file.error && (
                <p className="text-xs text-red-400">{file.error}</p>
            )}

            {/* Cancel button */}
            {file.status === "uploading" && (
                <button
                    type="button"
                    onClick={() => cancelUpload(file.id)}
                    className="text-xs text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                >
                    Cancel
                </button>
            )}
        </li>
    )
}