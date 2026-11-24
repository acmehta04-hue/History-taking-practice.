# Engineering roadmap

The product plan (design, content, strategy, revenue) is kept in a shared doc. This file covers the engineering side only.

## Phase 1 — MVP (this repo, v0.2) ✅

- Expo app for iOS, Android and web from one codebase
- Sets × reps drill loop with three assistance levels and adaptive fading
- Offline keyword matcher and scripted patients
- Scoring: accuracy, independence, level, speed, red flags
- Progress dashboard; teaching library
- 3 presentations, 10 patients, 20 single-block drills + 11 combined drills, 12 teaching cards
- Challenge stages (Foundation → Application → Challenge), combined drills, and a placement/exam calendar that steers recommendations
- Engine and content tests (64)

## Phase 2 — AI patient and AI feedback

Keep the offline matcher as a fallback. Put a model behind the same seams:

- `matchQuestion(question, items)` → **AI classifier**: maps any phrasing to checklist item ids (structured output).
- `patientReply(matched, case)` → **AI patient**: answers in character, grounded only in the case file, so it can't invent findings.
- Set summary → **AI examiner**: comments on structure, signposting and empathy, not just coverage.

Architecture: never put an API key in the app. Add a small backend (Supabase Edge Function, Cloudflare Worker or Vercel function) that holds the key, checks the user's plan and rate-limits.

## Phase 3 — accounts and sync

- Supabase (Postgres + auth): sign in with Apple, Google or email
- Sync `sets` and `programs` from the zustand store; keep offline-first
- Push notifications when a set is due (expo-notifications)

## Phase 4 — content at scale

- Move content from TypeScript into a CMS or database with a review workflow
- Authoring UI for clinical contributors
- Voice mode (speech-to-text) for OSCE realism
- Institution dashboards (cohort analytics)
