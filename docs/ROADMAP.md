# Engineering roadmap

The product plan (design, content, strategy, revenue) is kept in a shared doc. This file covers the engineering side only.

## Phase 1 — MVP (this repo, v0.4) ✅

- Expo app for iOS, Android and web from one codebase
- Sets × reps drill loop with three assistance levels and adaptive fading
- Offline keyword matcher and scripted patients
- Scoring: accuracy, independence, level, speed, red flags
- Progress dashboard; teaching library (15 cards)
- 4 full presentations (13 patients), 1 deep dive, combined drills, challenge stages, viva blocks with flashcards, a placement/exam calendar
- The UKMLA syllabus map: 24 areas, 131 presentations, 427 conditions, 176 investigations, 117 drugs to know
- Generated syllabus drills for every area: differentials sprint, spot the diagnosis, spot the cause for every presentation
- Results panels: obs with NEWS2, bloods, ECG strips, schematic X-rays; follow-up visits (Robert’s journey)
- Drug drills: warfarin, metformin, levothyroxine, prednisolone, methotrexate, alendronic acid
- Engine and content tests (227)

## Next content (Phase 1.5)

Highest value first:

1. Full history drills for the commonest OSCE presentations still without one: chest pain, breathlessness, headache, cough, back pain, fever, falls, confusion.
2. Management (`mx`) for each syllabus condition, so spot the diagnosis can ask “first-line treatment?” at Challenge.
3. More drug profiles, starting with high-risk PSA drugs: insulin, gentamicin, opioids, DOACs, lithium, antiepileptics, antibiotics.
4. More follow-up journeys with results: DKA on the ward, an AKI on ACE inhibitors, a COPD exacerbation with an ABG.
5. Clinical review of the whole catalogue against the current MLA content map, NICE CKS and the BNF.

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
