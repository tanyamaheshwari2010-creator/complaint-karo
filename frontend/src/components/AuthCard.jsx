// The frosted glass card. Login and Signup both render inside it.
export default function AuthCard({ title, children }) {
  return (
    <section className="m-auto w-full max-w-95 rounded-[14px] border border-white/20 bg-white/10 px-7.5 pb-6.5 pt-7.5 shadow-[0_18px_50px_rgba(2,8,30,0.45)] backdrop-blur-[10px] max-[420px]:px-5.5">
      <h1 className="mb-5.5 text-center text-[1.9rem] font-bold tracking-[0.01em]">
        {title}
      </h1>
      {children}
    </section>
  );
}

export function ErrorMessage({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="mb-3 rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-100">
      {children}
    </p>
  );
}

export function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="h-11 w-full cursor-pointer rounded-full bg-white text-[0.92rem] font-semibold text-[#12275a] transition hover:shadow-[0_6px_22px_rgba(255,220,130,0.35)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber-300/70 active:scale-[0.985] disabled:cursor-wait disabled:opacity-70"
    >
      {children}
    </button>
  );
}
