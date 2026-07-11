// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SnackbarContext } from '@/app/providers/snackbar-context'
import { api } from '@/lib/api'
import { DubbingJobsTable } from './dubbing-jobs-table'
import { dubbingJobsQueryKey, type SourceVideo } from './use-dubbing-jobs'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

afterEach(cleanup)

const source: SourceVideo = {
  id: '17b74ec6-7086-459c-8f0d-d39d6c3c4acd',
  originalFilename: 'launch.mp4',
  displayTitle: 'Product launch',
  sourceLanguage: 'en-IN',
  videoUrl: null,
  videoKey: 'videos/launch.mp4',
  createdAt: '2026-05-18T10:00:00.000Z',
  updatedAt: '2026-05-18T10:00:00.000Z',
  versions: [
    { id: 'completed', sourceId: '17b74ec6-7086-459c-8f0d-d39d6c3c4acd', audioKey: null, dubbedAudioKey: null, dubbedVideoKey: 'dubbed/hi.mp4', targetLanguage: 'hi-IN', transcriptionLanguage: null, status: 'completed', dubbedVideoUrl: null, errorMessage: null, createdAt: '2026-05-18T10:00:00.000Z', updatedAt: '2026-05-18T10:00:00.000Z' },
    { id: 'failed', sourceId: '17b74ec6-7086-459c-8f0d-d39d6c3c4acd', audioKey: null, dubbedAudioKey: null, dubbedVideoKey: null, targetLanguage: 'ta-IN', transcriptionLanguage: null, status: 'failed', dubbedVideoUrl: null, errorMessage: 'Provider unavailable', createdAt: '2026-05-18T10:00:00.000Z', updatedAt: '2026-05-18T10:00:00.000Z' },
  ],
}

const renderTable = (sources: SourceVideo[]) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  client.setQueryData(dubbingJobsQueryKey, sources)
  const showSnackbar = vi.fn()
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <SnackbarContext value={{ showSnackbar }}>{children}</SnackbarContext>
    </QueryClientProvider>
  )
  return { client, showSnackbar, ...render(<DubbingJobsTable />, { wrapper: Wrapper }) }
}

describe('adding another source language version', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [source] } })
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })
  })

  it('shows locked source details, unavailable languages, and submits JSON before refreshing', async () => {
    const user = userEvent.setup()
    renderTable([source])

    await user.click(screen.getByRole('button', { name: 'Dub in another language' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Product launch')
    expect(screen.getByLabelText('Source language')).toHaveValue('English')
    expect(screen.getByRole('option', { name: 'Hindi — already added' })).toBeDisabled()
    expect(screen.getByRole('option', { name: 'Tamil — retry separately' })).toBeDisabled()

    await user.selectOptions(screen.getByLabelText('Target language'), 'bn-IN')
    await user.click(screen.getByRole('button', { name: 'Start dubbing' }))

    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      `/dubbing/sources/${source.id}/versions`,
      { targetLanguage: 'bn-IN' },
    ))
    await waitFor(() => expect(api.get).toHaveBeenCalled())
  })

  it('disables the source action and explains the active-version constraint', () => {
    renderTable([{ ...source, versions: [{ ...source.versions[0], status: 'processing' }] }])
    expect(screen.getByRole('button', { name: 'Dub in another language' })).toBeDisabled()
    expect(screen.getByText('Wait for the active language version to finish before adding another.')).toBeVisible()
  })

  it('keeps recoverable error feedback visible and refreshes the workspace', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('conflict'))
    const user = userEvent.setup()
    renderTable([source])
    await user.click(screen.getByRole('button', { name: 'Dub in another language' }))
    await user.selectOptions(screen.getByLabelText('Target language'), 'bn-IN')
    await user.click(screen.getByRole('button', { name: 'Start dubbing' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('The language version was not started')
    await waitFor(() => expect(api.get).toHaveBeenCalled())
  })
})
