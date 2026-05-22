import { Film, LoaderCircle, UploadCloud, X } from 'lucide-react'
import { useCallback, useId, useState } from 'react'
import { Controller, type SubmitHandler } from 'react-hook-form'
import { useSnackbar } from '@/app/providers/snackbar-context'
import { Select, SelectItem } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  AUTO_SOURCE_LANGUAGE,
  LANGUAGES,
  type DubbingFormData,
} from './dubbing-schema'
import { useDubbingForm } from './use-dubbing-form'

type DubbingFormProps = {
  isEmptyState?: boolean
}

export function DubbingForm({ isEmptyState = false }: DubbingFormProps) {
  const inputId = useId()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const { showSnackbar } = useSnackbar()

  const { form, mutation } = useDubbingForm()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]

    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
      setFileError(null)
      return
    }

    setFileError('Please drop a valid video file')
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
      setFileError(null)
      return
    }

    setFileError('Please select a valid video file')
  }, [])

  const clearFile = useCallback(() => {
    setVideoFile(null)
    setFileError(null)
  }, [])

  const onSubmit: SubmitHandler<DubbingFormData> = (values) => {
    if (!videoFile) {
      setFileError('Please drop a video file before submitting')
      showSnackbar({
        message: 'Add a video file before starting processing.',
        variant: 'error',
      })
      return
    }

    const formData = new FormData()
    formData.append('video', videoFile)
    formData.append('sourceLanguage', values.sourceLanguage)
    formData.append('targetLanguage', values.targetLanguage)
    mutation.mutate(formData, {
      onSuccess: () => {
        setVideoFile(null)
        setFileError(null)
        showSnackbar({
          message: 'Video submitted. The status table will update automatically.',
          variant: 'success',
        })
      },
      onError: () => {
        showSnackbar({
          message: 'Unable to submit the video. Check the file and try again.',
          variant: 'error',
        })
      },
    })
  }

  return (
    <form
      className={cn(
        'w-full border border-[var(--color-border)] bg-[var(--color-panel)]/90 p-4 shadow-2xl shadow-black/30 backdrop-blur md:p-5',
        isEmptyState ? 'max-w-3xl' : 'max-w-xl',
      )}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-accent)]">
            Upload Window
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-none text-[var(--color-text)] md:text-4xl">
            Drop one video.
          </h2>
        </div>
        <div className="hidden rounded-full border border-[var(--color-border)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-dim)] sm:block">
          MP4 MOV WebM
        </div>
      </div>

      <div className="mb-4">
        <div
          className={cn(
            'relative flex min-h-64 flex-col items-center justify-center overflow-hidden border border-dashed px-6 py-10 text-center transition md:min-h-80',
            isDragging && 'border-[var(--color-accent)] bg-[var(--color-accent)]/10',
            videoFile && !isDragging && 'border-[var(--color-accent)]/60 bg-white/[0.03]',
            !videoFile && !isDragging && 'border-[var(--color-border)] hover:border-[var(--color-text-dim)]',
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="pointer-events-none absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/60 to-transparent" />
          {videoFile ? (
            <div className="flex w-full flex-col items-center gap-3">
              <div className="flex size-16 items-center justify-center rounded-full border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <Film className="size-7" />
              </div>
              <span className="max-w-full truncate text-lg text-[var(--color-text)]">
                {videoFile.name}
              </span>
              <span className="text-xs text-[var(--color-text-dim)]">
                {(videoFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                type="button"
                className="absolute right-4 top-4 z-10 text-[var(--color-text-dim)] transition hover:text-[var(--color-text)]"
                onClick={clearFile}
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex size-16 items-center justify-center rounded-full border border-[var(--color-border)] bg-black/30 text-[var(--color-accent)]">
                <UploadCloud className="size-7" />
              </div>
              <p className="text-lg text-[var(--color-text)]">
                Drag a video here, or click to browse.
              </p>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-[var(--color-text-dim)]">
                Your upload starts a dubbing job tied to this account. Choose the source
                and target language below before processing.
              </p>
            </>
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
        <div className="flex h-5 items-center">
          {fileError ? (
            <p className="text-xs text-red-500">{fileError}</p>
          ) : (
            <span className="text-xs text-[var(--color-text-dim)]">Video file</span>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-[var(--color-text-dim)]"
            htmlFor="sourceLanguage"
          >
            Source Language
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
                <SelectItem value={AUTO_SOURCE_LANGUAGE}>Auto-detect</SelectItem>
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
            className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-[var(--color-text-dim)]"
            htmlFor="targetLanguage"
          >
            Target Language
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
        className="w-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-4 text-sm font-medium uppercase tracking-[0.18em] text-black transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <LoaderCircle className="size-4 animate-spin" />
            Uploading
          </span>
        ) : (
          'Start Processing'
        )}
      </button>

      {mutation.isSuccess && (
        <p className="mt-4 text-xs text-[var(--color-accent)]">
          Video submitted. The status table will update while processing runs.
        </p>
      )}
      {mutation.isError && (
        <p className="mt-4 text-xs text-red-500">
          Unable to submit. Check the video file and try again.
        </p>
      )}
    </form>
  )
}
