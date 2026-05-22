import {
  CheckCircle2,
  Film,
  Languages,
  LoaderCircle,
  UploadCloud,
  Wand2,
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

type DubbingFormProps = {
  isEmptyState?: boolean;
};

const guidedSteps = [
  {
    title: "Upload",
    copy: "Add the source video for this job.",
    icon: UploadCloud,
  },
  {
    title: "Language",
    copy: "Choose the source and target language pair.",
    icon: Languages,
  },
  {
    title: "Render",
    copy: "Track processing until the dubbed file is ready.",
    icon: Wand2,
  },
] as const;

export function DubbingForm({ isEmptyState = false }: DubbingFormProps) {
  const inputId = useId();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
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
      setFileError("Please drop a video file before submitting");
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
          message:
            "Video submitted. The status table will update automatically.",
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
      className={cn(
        "w-full rounded-lg border border-(--color-text) bg-(--color-surface) p-4 shadow-[8px_8px_0_rgba(21,23,19,0.1)] md:p-5",
        isEmptyState && "grid gap-6 md:p-6 lg:grid-cols-[1.25fr_0.75fr]",
      )}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold text-(--color-blue)">
              {isEmptyState ? "First job" : "New upload"}
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-none text-(--color-text)">
              {isEmptyState ? "Upload your first video." : "Add another video."}
            </h2>
          </div>
          <div className="hidden rounded-md border border-(--color-border) bg-(--color-bg) px-3 py-2 font-mono text-xs text-(--color-text-dim) sm:block">
            MP4 MOV WebM
          </div>
        </div>

        <div className="mb-4">
          <div
            className={cn(
              "relative flex flex-col items-center justify-center overflow-hidden rounded-md border border-dashed px-5 py-8 text-center transition",
              isEmptyState ? "min-h-72 md:min-h-80" : "min-h-48",
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
              <div className="flex w-full flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-md border border-(--color-blue) bg-white text-(--color-blue)">
                  <Film className="size-6" />
                </div>
                <span className="max-w-full truncate text-lg font-semibold text-(--color-text)">
                  {videoFile.name}
                </span>
                <span className="font-mono text-xs text-[var(--color-text-dim)]">
                  {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  className="absolute right-4 top-4 z-10 rounded-md border border-[var(--color-border)] bg-white p-2 text-[var(--color-text-dim)] transition hover:border-[var(--color-text)] hover:text-[var(--color-text)]"
                  onClick={clearFile}
                >
                  <span className="sr-only">Remove selected video</span>
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5 flex size-14 items-center justify-center rounded-md border border-[var(--color-border)] bg-white text-[var(--color-blue)]">
                  <UploadCloud className="size-6" />
                </div>
                <p className="text-lg font-semibold text-[var(--color-text)]">
                  Drag a video here, or click to browse.
                </p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-text-dim)]">
                  Choose a language pair below before starting the job.
                </p>
              </>
            )}
            <label
              className="absolute inset-0 cursor-pointer"
              htmlFor={inputId}
            >
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
          <div className="flex h-6 items-center">
            {fileError ? (
              <p className="text-sm text-red-600">{fileError}</p>
            ) : (
              <span className="font-mono text-xs text-[var(--color-text-dim)]">
                Video file
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
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
          </div>

          <div>
            <label
              className="mb-2 block font-mono text-xs font-semibold text-[var(--color-text-dim)]"
              htmlFor="targetLanguage"
            >
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
                  placeholder="Target"
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
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-md border border-[var(--color-text)] bg-[var(--color-accent)] px-4 py-4 text-sm font-semibold text-[var(--color-accent-text)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
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

        {mutation.isSuccess && (
          <p className="mt-4 text-sm text-emerald-700">
            Video submitted. The status table will update while processing runs.
          </p>
        )}
        {mutation.isError && (
          <p className="mt-4 text-sm text-red-600">
            Unable to submit. Check the video file and try again.
          </p>
        )}
      </div>

      {isEmptyState && (
        <aside className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 lg:p-5">
          <p className="font-mono text-xs font-semibold text-[var(--color-blue)]">
            Guided setup
          </p>
          <h3 className="mt-3 text-2xl font-semibold">First-job checklist</h3>
          <div className="mt-6 space-y-4">
            {guidedSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  className="grid grid-cols-[auto_1fr] gap-3"
                  key={step.title}
                >
                  <span className="flex size-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-white text-[var(--color-blue)]">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-dim)]">
                      {step.copy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-md border border-[var(--color-border)] bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span className="font-mono text-xs font-semibold text-[var(--color-muted)]">
                Output
              </span>
            </div>
            <p className="text-sm leading-6 text-[var(--color-text-dim)]">
              Completed jobs appear below with authenticated download actions.
            </p>
          </div>
        </aside>
      )}
    </form>
  );
}
