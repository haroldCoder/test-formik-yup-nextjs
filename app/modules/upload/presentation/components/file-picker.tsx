interface FilePickerProps {
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
    addFiles: (files: File[]) => void;
}

export const FilePicker = ({ isDragging, setIsDragging, addFiles }: FilePickerProps) => {
    return (
        <label
            data-cy="file-drop-zone"
            className={`group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-all duration-200 ${isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/3 hover:border-indigo-500/50 hover:bg-indigo-500/5"
                }`}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragEnter={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    addFiles(Array.from(e.dataTransfer.files));
                }
            }}
        >
            <span className="text-2xl select-none">📂</span>
            <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                Click to choose files o drag & drop files
            </span>
            <span className="text-xs text-zinc-600">JPG, PNG or PDF · max 5 MB</span>
            <input
                data-cy="file-input"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                    if (!e.target.files) return;
                    addFiles(Array.from(e.target.files));
                }}
            />
        </label>
    );
};