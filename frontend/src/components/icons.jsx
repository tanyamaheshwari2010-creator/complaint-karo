const base = "h-[15px] w-[15px] fill-white";

export const UserIcon = () => (
  <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
  </svg>
);

export const MailIcon = () => (
  <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 8L4.5 7.5v1L12 14l7.5-5.5v-1Z" />
  </svg>
);

export const LockIcon = () => (
  <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
    <path d="M17 9V7a5 5 0 0 0-10 0v2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2ZM9 7a3 3 0 0 1 6 0v2H9Z" />
  </svg>
);
