# API tests (Phase 4)

1. Make 5 test accounts (sign up in the app, then set `role` in Atlas):
   citizen, citizen2 (role citizen), officer (complaint_officer), worker, worker2 (field_worker).
2. Copy config.example.json to config.json and fill in the emails/passwords. Do NOT commit config.json.
3. Start the backend, then:   node run.mjs

Options:
  node run.mjs --skip-ai-wait        don't wait for Gemini
  node run.mjs --expect-ai-failed    use after you break GEMINI_API_KEY on purpose

The tests create complaints whose description starts with "[API TEST]". Delete them in Atlas afterwards.
