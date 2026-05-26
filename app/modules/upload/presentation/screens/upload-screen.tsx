'use client'

import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import { useSubmitManager, useUploadManager } from "../hooks";
import { FileValidations, uploadSchema } from "../validations";
import { inputCls } from "../constants";
import { CardFiles, FilePicker, Loading } from "../components";
import { FileDescriptorEntity } from "../../domain/entities";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

type FormValues = {
    title: string;
    description: string;
};

export const UploadScreen = () => {
    const { files, addFiles, cancelUpload, retryUpload, uploadAll, reset, removeFiles } = useUploadManager();
    const { isSubmitting, submit } = useSubmitManager();
    const [isDragging, setIsDragging] = useState(false);

    const isUploading = files.some((f) => f.status === "uploading");
    const hasErrors = files.some((f) => f.status === "error");
    const allDone = files.length > 0 && files.every((f) => f.status === "done");

    useEffect(() => {
        if (files.length === 0) return;

        const duplicatedIds = FileValidations.validateFilesNotRepeat(files);

        if (duplicatedIds.length === 0) return;

        toast.error("this file is duplicated");

        removeFiles({ ids: duplicatedIds });
    }, [files, removeFiles]);

    const actionErrorOnUploadAll = (err: Error) => {
        toast.error(err.message || "Upload failed");
    }

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
                            }).then(() => {
                                toast.success("Files submitted successfully");
                                resetForm();
                            }).catch((error) => {
                                toast.error(error.message ?? "Error submitting files");
                            });

                            reset();

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
                                <FilePicker isDragging={isDragging} setIsDragging={setIsDragging} addFiles={addFiles} />

                                {/* Upload all button */}
                                <button
                                    type="button"
                                    onClick={() => uploadAll({ actionError: actionErrorOnUploadAll })}
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