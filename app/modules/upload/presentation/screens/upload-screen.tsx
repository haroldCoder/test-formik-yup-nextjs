'use client'

import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import { useSubmitManager, useUploadManager } from "../hooks";
import { uploadSchema } from "../validations";
import { inputCls } from "../constants";
import { CardFiles, Loading } from "../components";
import { FileDescriptorEntity } from "../../domain/entities";

type FormValues = {
    title: string;
    description: string;
};

export const UploadScreen = () => {
    const { files, addFiles, cancelUpload, retryUpload, uploadAll, reset } = useUploadManager();
    const { isSubmitting, submit } = useSubmitManager();

    const isUploading = files.some((f) => f.status === "uploading");
    const hasErrors = files.some((f) => f.status === "error");
    const allDone = files.length > 0 && files.every((f) => f.status === "done");

    return (
        <>
            {isSubmitting && (
                <Loading />
            )}
            <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center p-6">
                {/* Glass card */}
                <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/40 p-8">

                    {/* Header */}
                    <div className="mb-8 space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-white">
                            Upload Files
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Add a title, description and choose your files.
                        </p>
                    </div>

                    <Formik
                        initialValues={{ title: "", description: "" }}
                        validationSchema={uploadSchema}
                        onSubmit={async (values, { resetForm }) => {
                            await submit({
                                title: values.title,
                                description: values.description,
                                files: files.map((f) => new FileDescriptorEntity({ // esto podemos hacer un mapper, para convertir el dto a entity
                                    id: f.id,
                                    name: f.file.name,
                                    size: f.file.size,
                                    type: f.file.type,
                                    url: f.url!,
                                    status: f.status,
                                    progress: f.progress,

                                })),
                            })

                            reset(() => resetForm());

                        }}
                    >
                        {({ isValid }: FormikProps<FormValues>) => (
                            <Form className="space-y-5">

                                {/* Title */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium uppercase tracking-widest text-zinc-400">
                                        Title
                                    </label>
                                    <Field
                                        name="title"
                                        placeholder="My awesome upload"
                                        className={inputCls}
                                    />
                                    <ErrorMessage
                                        name="title"
                                        component="p"
                                        className="text-xs text-red-400 mt-0.5"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium uppercase tracking-widest text-zinc-400">
                                        Description
                                    </label>
                                    <Field
                                        name="description"
                                        as="textarea"
                                        rows={3}
                                        placeholder="What are these files about?"
                                        className={`${inputCls} resize-none`}
                                    />
                                    <ErrorMessage
                                        name="description"
                                        component="p"
                                        className="text-xs text-red-400 mt-0.5"
                                    />
                                </div>

                                {/* Drop zone / file picker */}
                                <label className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/3 px-6 py-8 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-200">
                                    <span className="text-2xl select-none">📂</span>
                                    <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                                        Click to choose files
                                    </span>
                                    <span className="text-xs text-zinc-600">JPG, PNG or PDF · max 5 MB</span>
                                    <input
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

                                {/* Upload all button */}
                                <button
                                    type="button"
                                    onClick={uploadAll}
                                    disabled={files.length === 0 || isUploading}
                                    className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white
                                           hover:bg-indigo-500 active:scale-[.98] transition-all duration-150
                                           disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                                           cursor-pointer"
                                >
                                    {isUploading ? "Uploading…" : "Upload files"}
                                </button>

                                {/* File list */}
                                {files.length > 0 && (
                                    <ul className="space-y-2">
                                        {files.map((file) => (
                                            <CardFiles key={file.id} file={file} cancelUpload={cancelUpload} retryUpload={retryUpload} />
                                        ))}
                                    </ul>
                                )}

                                {/* Divider */}
                                {files.length > 0 && (
                                    <hr className="border-white/10" />
                                )}

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={!isValid || !allDone || isUploading || hasErrors}
                                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white
                                           hover:bg-emerald-500 active:scale-[.98] transition-all duration-150
                                           disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                                           cursor-pointer"
                                >
                                    Submit
                                </button>

                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </>
    );
};