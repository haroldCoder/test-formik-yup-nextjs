export type BaseFileDescriptor = {
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'idle' | 'uploading' | 'done' | 'error' | 'canceled';
    progress?: number;
    url?: string;
    error?: string;
};

export type FileDescriptor =
    | (BaseFileDescriptor & { status: 'idle' })
    | (BaseFileDescriptor & { status: 'uploading'; progress: number }) // si el status es uploading, el progress es 0-100
    | (BaseFileDescriptor & { status: 'done'; progress: 100; url: string }) // si el status es done, el progress es 100 y tiene url
    | (BaseFileDescriptor & { status: 'error'; error: string }) // si el status es error, tiene un mensaje de error
    | (BaseFileDescriptor & { status: 'canceled' }); // si el status es cancelado
