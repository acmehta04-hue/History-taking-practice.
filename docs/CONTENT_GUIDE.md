# Content guide

All medical content lives in `src/content/` as plain TypeScript data. You can add a patient or a whole presentation without touching any screen.

## The model

```
Specialty → Presentation (UKMLA presentation, e.g. "Palpitations")
          → Sections (drills): interview blocks + reasoning blocks
          → Cases (patients). One rep = one case × one section.
```

- **Interview sections** (HPC, systems, DH, risk…) have one shared `checklist` per presentation. Each case fills in `answers[itemId]` with what that patient says. Items it leaves out fall back to `defaultAnswer` (usually a negative).
- **Reasoning sections** (`ddx`, `ix`, `mx`) have a model answer per case in `reasoning[sectionId]`. `distractors[sectionId]` adds plausible-but-wrong options for Guided mode.
- **Follow-ups** (`followUps[sectionId]`) add a reasoning question at the end of an interview rep. Example: "What adherence options would you discuss?"

## Weights

| Weight | Meaning | Score weight |
| --- | --- | --- |
| `redflag` | Must not miss. Missing one costs 5 points. | 3 |
| `core` | Expected of every finalist | 2 |
| `extra` | Good practice, distinction-level | 1 |

## Writing patterns

Patterns are case-insensitive regular expressions, matched against a normalised question: lower-case, with punctuation turned into spaces (so "what's" becomes "what s").

- Be generous: a well-phrased question should never be marked as missed.
- Use `\\b` for short words (`'\\bmg\\b'`) so they don't match inside other words.
- Avoid bare common words (`'start'`, `'how often'`). They steal credit from other items. The tests caught several of these.
- The **model question must match its own item**, and every **Guided option label must match its own item**. Tests enforce both.

## Adding a case

1. Copy an existing case in the presentation file.
2. Write `summary` (shown in reasoning reps), `answers`, `reasoning` for every reasoning section, and a `pearl`.
3. Run `npm test` and fix anything it flags.
4. Get it clinically reviewed (below).

## Adding a presentation

1. Create `src/content/presentations/<name>.ts` exporting a `Presentation`.
2. Reuse items from `common.ts` where you can.
3. Register it in `src/content/index.ts` (`presentations` array), and remove its name from the specialty's `planned` list.
4. Add a matching `describe` block in `tests/engine.test.ts` by adding it to `ALL`.

## Clinical review checklist (before any release)

- [ ] Every management step matches current NICE guidance / NICE CKS / BNF. Note the guideline and date in the card's `verify` list.
- [ ] Drug doses, monitoring intervals and thresholds checked against the BNF.
- [ ] Red flags reflect real must-not-miss diagnoses.
- [ ] Language is UK English and patient-friendly in the patient's answers.
- [ ] Reviewer name and date recorded in the pull request.

## Licensing

Paraphrase guidance and link to it. Don't copy NICE or BNF text verbatim. Reusing NICE content in a commercial product can need a licence. Check before launch.
