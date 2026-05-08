import { LoaderCircle, Send } from 'lucide-react'
import { useContactForm } from './use-contact-form'

export function ContactForm() {
  const { form, mutation } = useContactForm()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <form
      className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur"
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
    >
      <div>
        <label className="mb-2 block text-sm text-zinc-300" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-cyan-400"
          placeholder="Akhil Sharma"
          {...register('name')}
        />
        {errors.name ? <p className="mt-2 text-sm text-rose-300">{errors.name.message}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-300" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-cyan-400"
          placeholder="you@company.com"
          {...register('email')}
        />
        {errors.email ? <p className="mt-2 text-sm text-rose-300">{errors.email.message}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-300" htmlFor="message">
          Project brief
        </label>
        <textarea
          id="message"
          rows={5}
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none transition focus:border-cyan-400"
          placeholder="Tell us what you want to build..."
          {...register('message')}
        />
        {errors.message ? (
          <p className="mt-2 text-sm text-rose-300">{errors.message.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
        {mutation.isPending ? 'Sending...' : 'Send request'}
      </button>

      {mutation.isSuccess ? (
        <p className="text-sm text-emerald-300">Your request was submitted successfully.</p>
      ) : null}
      {mutation.isError ? (
        <p className="text-sm text-rose-300">Unable to submit. Check API and database setup.</p>
      ) : null}
    </form>
  )
}
