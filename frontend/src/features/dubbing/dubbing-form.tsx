import { LoaderCircle, Film, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useDubbingForm } from './use-dubbing-form'
import { LANGUAGES, type DubbingFormData } from './dubbing-schema'

export function DubbingForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  
  const { form, mutation } = useDubbingForm()
  const {
    register,
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
      },
    })
  }

  return (
    <form
      className="w-full max-w-md"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-4">
        <div
          className={`relative flex cursor-pointer flex-col items-center justify-center border border-dashed py-8 transition ${
            isDragging
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
              : videoFile
                ? 'border-[var(--color-accent)]/50'
                : 'border-[var(--color-border)] hover:border-[var(--color-text-dim)]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {videoFile ? (
            <div className="flex w-full flex-col items-center gap-2">
              <Film className="size-6 text-[var(--color-accent)]" />
              <span className="max-w-[200px] truncate text-sm">{videoFile.name}</span>
              <span className="text-xs text-[var(--color-text-dim)]">
                {(videoFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                type="button"
                className="absolute right-2 top-2 text-[var(--color-text-dim)] transition hover:text-[var(--color-text)]"
                onClick={clearFile}
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <Film className="mb-2 size-5 text-[var(--color-text-dim)]" />
              <p className="text-xs text-[var(--color-text-dim)]">
                Drag and drop a video here or click to browse
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
                MP4 · MOV · WebM
              </p>
            </>
          )}
          <input
            type="file"
            accept="video/*"
            className="absolute inset-0 cursor-pointer opacity-0"
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

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <select
            id="sourceLanguage"
            className={`w-full border-b border-[var(--color-border)] bg-transparent py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] ${
              errors.sourceLanguage ? 'border-red-500' : ''
            }`}
            {...register('sourceLanguage')}
          >
            <option value="" className="bg-[var(--color-surface)]">Source</option>
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-[var(--color-surface)]">
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            id="targetLanguage"
            className={`w-full border-b border-[var(--color-border)] bg-transparent py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] ${
              errors.targetLanguage ? 'border-red-500' : ''
            }`}
            {...register('targetLanguage')}
          >
            <option value="" className="bg-[var(--color-surface)]">Target</option>
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-[var(--color-surface)]">
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-3 text-sm font-medium uppercase tracking-wider text-black transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <LoaderCircle className="size-4 animate-spin" />
            Processing
          </span>
        ) : (
          'Start Dubbing'
        )}
      </button>

      {mutation.isSuccess && (
        <p className="mt-4 text-xs text-[var(--color-accent)]">
          Video submitted. You'll be notified when ready.
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
