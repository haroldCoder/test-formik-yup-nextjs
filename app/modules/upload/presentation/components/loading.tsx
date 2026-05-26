import { Loader2Icon } from "lucide-react";

export const Loading = () => {
    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <Loader2Icon className="animate-spin size-16 text-blue-500" />
        </div>
    )
}