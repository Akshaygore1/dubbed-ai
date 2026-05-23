import {
  ChevronDown,
  Film,
  Languages,
  LoaderCircle,
  UploadCloud,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useId,
  useState,
} from "react";
import { Controller, type SubmitHandler } from "react-hook-form";
import { useSnackbar } from "@/app/providers/snackbar-context";
import { Select, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AUTO_SOURCE_LANGUAGE,
  LANGUAGES,
  type DubbingFormData,
} from "./dubbing-schema";
import { useDubbingForm } from "./use-dubbing-form";

export function DubbingForm() {
  const inputId = useId();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { showSnackbar } = useSnackbar();

  const { form, mutation } = useDubbingForm();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];

    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setFileError(null);
      return;
    }

    setFileError("Please drop a valid video file");
  }, []);

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file && file.type.startsWith("video/")) {
        setVideoFile(file);
        setFileError(null);
        return;
      }

      setFileError("Please select a valid video file");
    },
    [],
  );

  const clearFile = useCallback(() => {
    setVideoFile(null);
    setFileError(null);
  }, []);

  const onSubmit: SubmitHandler<DubbingFormData> = (values) => {
    if (!videoFile) {
      setFileError("Please select a video file before submitting");
      showSnackbar({
        message: "Add a video file before starting processing.",
        variant: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("sourceLanguage", values.sourceLanguage);
    formData.append("targetLanguage", values.targetLanguage);
    mutation.mutate(formData, {
      onSuccess: () => {
        setVideoFile(null);
        setFileError(null);
        showSnackbar({
          message: "Video submitted. Recent jobs will update automatically.",
          variant: "success",
        });
      },
      onError: () => {
        showSnackbar({
          message: "Unable to submit the video. Check the file and try again.",
          variant: "error",
        });
      },
    });
  };

  return (
    <form
      className="w-full rounded-lg border border-(--color-text) bg-(--color-surface) p-4 shadow-[6px_6px_0_rgba(21,23,19,0.09)] md:p-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold text-(--color-blue)">
            New dubbing job
          </p>
          <h1 className="mt-2 font-serif text-3xl leading-tight text-(--color-text) md:text-4xl">
            Upload video
          </h1>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-(--color-border) bg-(--color-bg) px-3 py-2 font-mono text-xs text-(--color-text-dim)">
          <UploadCloud className="size-3.5 text-(--color-blue)" />
          MP4 MOV WebM
        </div>
      </div>

      <div className="mb-4">
        <div
          className={cn(
            "relative flex min-h-36 items-center justify-center overflow-hidden rounded-md border border-dashed px-4 py-5 text-center transition sm:min-h-40",
            isDragging && "border-(--color-blue) bg-blue-50",
            videoFile &&
              !isDragging &&
              "border-(--color-blue) bg-(--color-panel)",
            !videoFile &&
              !isDragging &&
              "border-(--color-border) bg-(--color-bg) hover:border-(--color-text)",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {videoFile ? (
            <div className="flex min-w-0 flex-col items-center gap-2">
              <div className="flex size-11 items-center justify-center rounded-md border border-(--color-blue) bg-white text-(--color-blue)">
                <Film className="size-5" />
              </div>
              <span className="max-w-full truncate text-base font-semibold text-(--color-text)">
                {videoFile.name}
              </span>
              <span className="font-mono text-xs text-[var(--color-text-dim)]">
                {(videoFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                type="button"
                className="absolute right-3 top-3 z-10 rounded-md border border-[var(--color-border)] bg-white p-2 text-[var(--color-text-dim)] transition hover:border-[var(--color-text)] hover:text-[var(--color-text)]"
                onClick={clearFile}
              >
                <span className="sr-only">Remove selected video</span>
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-md border border-[var(--color-border)] bg-white text-[var(--color-blue)]">
                <UploadCloud className="size-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--color-text)]">
                  Drag a video here, or click to browse.
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-dim)]">
                  Start with the target language below.
                </p>
              </div>
            </div>
          )}
          <label className="absolute inset-0 cursor-pointer" htmlFor={inputId}>
            <span className="sr-only">Choose a video file</span>
          </label>
          <input
            id={inputId}
            type="file"
            accept="video/*"
            className="sr-only"
            onChange={handleFileSelect}
          />
        </div>
        <div className="flex min-h-6 items-center pt-1">
          {fileError ? (
            <p className="text-sm text-red-600">{fileError}</p>
          ) : (
            <span className="font-mono text-xs text-[var(--color-text-dim)]">
              Video file
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label
          className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold text-[var(--color-text-dim)]"
          htmlFor="targetLanguage"
        >
          <Languages className="size-3.5 text-(--color-blue)" />
          Target language
        </label>
        <Controller
          control={control}
          name="targetLanguage"
          render={({ field }) => (
            <Select
              id="targetLanguage"
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Choose target language"
              error={Boolean(errors.targetLanguage)}
              disabled={mutation.isPending}
            >
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </Select>
          )}
        />
        {errors.targetLanguage ? (
          <p className="mt-2 text-sm text-red-600">
            {errors.targetLanguage.message}
          </p>
        ) : null}
      </div>

      <div className="mb-5 rounded-md border border-(--color-border) bg-(--color-bg)">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-semibold text-(--color-text)"
          onClick={() => setShowAdvanced((value) => !value)}
          aria-expanded={showAdvanced}
        >
          <span>Advanced</span>
          <ChevronDown
            className={cn(
              "size-4 text-(--color-text-dim) transition",
              showAdvanced && "rotate-180",
            )}
          />
        </button>

        {showAdvanced ? (
          <div className="border-t border-(--color-border) px-3 pb-3 pt-2">
            <label
              className="mb-2 block font-mono text-xs font-semibold text-[var(--color-text-dim)]"
              htmlFor="sourceLanguage"
            >
              Source language
            </label>
            <Controller
              control={control}
              name="sourceLanguage"
              render={({ field }) => (
                <Select
                  id="sourceLanguage"
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Source"
                  error={Boolean(errors.sourceLanguage)}
                  disabled={mutation.isPending}
                >
                  <SelectItem value={AUTO_SOURCE_LANGUAGE}>
                    Auto-detect
                  </SelectItem>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
            {errors.sourceLanguage ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.sourceLanguage.message}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="border-t border-(--color-border) px-3 pb-3 pt-2 text-sm text-(--color-text-dim)">
            Source language is set to auto-detect.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-md border border-[var(--color-text)] bg-[var(--color-accent)] px-4 py-3.5 text-sm font-semibold text-[var(--color-accent-text)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <LoaderCircle className="size-4 animate-spin" />
            Uploading
          </span>
        ) : (
          "Start processing"
        )}
      </button>
    </form>
  );
}
