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
- **Difficulty** (`difficulty: 1 | 2 | 3`) decides when a patient appears. Foundation sets use the easiest patients, Challenge sets start with the hardest. Give each presentation a spread.
- **Twist** (`twist`) is the Challenge-set question after reasoning reps: new information that changes the picture ("Her BP falls to 82/50…"). Write 5–7 model points; make at least one a red flag.
- **Combined drills** (`combos` on the presentation) chain blocks on one patient. List the section ids in the order a real history would run them.
- The **commit-and-defend** question (Application and Challenge sets) is generated automatically from the first two `ddx` items, so put the leading diagnosis first and give it a good `reasonMatch`.

## Viva questions

Each patient has `viva` questions in `src/content/viva/<presentation>.ts`:

- `tier: 1` recall ("What are the side effects of lithium?"), `tier: 2` explain why ("Why avoid NSAIDs on lithium?"), `tier: 3` data or what-if, with the results in `data`.
- Give tier-2 questions a `probe`: the examiner's follow-up, asked from Application onwards.
- Give recall questions 1–2 `distractors` (plausible wrong answers) so Guided mode isn't a giveaway.
- Every question has an `id`, so it becomes a flashcard. Keep ids unique within the patient.

## Deep dives

A deep dive is a `Presentation` with `kind: 'deepdive'` in `src/content/deepdives/`. Its sections use `caseIds` to choose patients per set:

1. **Why?** (`kind: 'interview'`, `tagPurpose: true`): each checklist item has a `purpose` (`exclude`, `risk`, `severity`) and a `target` saying what it excludes or checks.
2. **Ladder** (`kind: 'reasoning'`): investigations, then `followUps.ladder`: first line, second line, third line, then "your choice".
3. **Counsel** (`kind: 'counsel'`): the checklist holds what a good explanation covers (`modelQuestion` is the model statement). Each patient lists `concerns` (what they ask back) and acknowledgements in `answers`. Patient-specific points use `appliesTo` with `tags`.
4. **PSA** (`kind: 'reasoning'`): the prescription (drug, dose, route, frequency), then `followUps.prescribe`: prescription review, monitoring, data interpretation, viva.

Reuse a presentation's patients by spreading their case files (see `deepdives/depression.ts`), and use `openings` / `summaries` for set-specific first words or vignettes.

## The syllabus catalogue

`src/content/catalogue/` holds the whole UKMLA syllabus as plain tables, one line per entry, so you can edit it like a spreadsheet:

- `areas.ts`: the 24 areas of clinical practice.
- `presentations.ts`: `id | Title | areas | causes`. Causes are condition ids; prefix `!` for must-not-miss and `?` for also consider. Put must-not-miss causes first. A presentation whose id matches a hand-written presentation links to its full history drills.
- `conditions-*.ts`: `id | Title | areas | synonyms | classic picture | tests`. The title is always recognised; add abbreviations and other names as synonyms (regex, separated by `;`). An id starting with `~` is a differential bucket (e.g. “Adverse drug effect”) that is never a spot-the-diagnosis answer.
- `tests.ts`: `id | label | category | patterns`, used by “how would you confirm it?” questions.
- `drugs.ts`: the drugs to know, by area.

The drills for every area are generated from these tables (`catalogue/drills.ts`): a differentials sprint, spot the diagnosis, and spot the cause for each presentation.

Rules the tests enforce (`tests/catalogue.test.ts`):

- **The classic picture never names its own condition.** It is the spot-the-diagnosis vignette, so “thunderclap headache” can’t also be a synonym for SAH.
- **Naming one cause never credits another in the same differential.** If “Supraventricular tachycardia” matched a VT synonym, the test fails. Use `\b` and specific phrases.
- **The tests confirming one condition never credit each other** (e.g. “Haemoglobin electrophoresis” must not match the FBC pattern).
- Every area, cause and test id points at something real; every pattern compiles; every title and label matches itself.

## Results and follow-up visits

Any question can show results to interpret (`FollowUp.results`), and a case can show results with its vignette (`CaseFile.results[sectionId]`):

| Kind | What you write | What the app does |
| --- | --- | --- |
| `obs` | RR, SpO₂, oxygen, BP, pulse, ACVPU, temperature | Works out NEWS2 (shown only in the summary, so it doesn’t give the answer away) |
| `bloods` | test, value, unit, reference range, an earlier value | Flags H and L, shows the trend |
| `ecg` | rate, rhythm (sinus, AF, flutter), QRS, ST, T and U waves | Draws a 6-second rhythm strip at 25 mm/s |
| `xray` | abdominal or chest, findings | Draws a labelled schematic (not a real image) |
| `report` | lines of text | A CT, colonoscopy or histology report |

If a model answer says “NEWS2 8”, a test checks that the obs on screen really score 8.

**Follow-up visits:** give a case `episode: { of, order, when }` to make it a later visit by the same patient. Episodes only appear in sections that list them in `caseIds`; set `ordered: true` on that section so every set runs the visits in order (see Robert’s journey in `presentations/change-bowel-habit.ts`).

## Drug drills

Each drug is one `DrugProfile` in `src/content/drugs/`, turned into three drills by `drugs/build.ts`:

1. **Viva** in three topics (uses and how it works, side effects and interactions, monitoring and results). Each topic needs a tier-1 recall question; across the three, include tiers 1, 2 and 3 and at least one examiner probe.
2. **Counsel:** the points a good explanation covers (`point()`, with the model statement), plus `ideas()` and `teachBack()`. Each patient lists `concerns` (what they ask back) and their replies in `answers`. Use `tag` for points only some patients need (e.g. pregnancy).
3. **Prescribe:** per patient, the prescription items (`rxDrug`, `rxDose`, `rxOral`, `rxFreq`, plus extras), optional wrong options (`rxDistractors`), and review questions.

Add the profile to `drugs/index.ts`, and make sure its id is in `catalogue/drugs.ts`.

**Writing labels:** the matcher only looks at the words before the first “to / for / if / because / as / :” in a line. Put the key term first: “Post-exposure prophylaxis if not immune”, not “If not immune: post-exposure prophylaxis”.

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
2. Write `summary` (shown in reasoning reps), `answers`, `reasoning` for every reasoning section, a `difficulty`, a `twist` and a `pearl`.
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
- [ ] NEWS2 bands, reference ranges and results panels checked.
- [ ] Syllabus tables checked against the current MLA content map.
- [ ] Red flags reflect real must-not-miss diagnoses.
- [ ] Language is UK English and patient-friendly in the patient's answers.
- [ ] Reviewer name and date recorded in the pull request.

## Licensing

Paraphrase guidance and link to it. Don't copy NICE or BNF text verbatim. Reusing NICE content in a commercial product can need a licence. Check before launch.
