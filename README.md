# History Drills

History-taking practice for UK medical students. You drill **one block of a history at a time** (HPC, systems review, drug history, risk assessment, differentials, investigations, management) in **sets and reps**, with guidance that fades as you improve.

- **Rep:** one patient, one block of the history. Example: the HPC for a 22-year-old with abdominal pain.
- **Set:** 3 reps of the same block with 3 different patients, followed by feedback: what you missed, how to ask it, the ideal flow, and teaching cards.
- **Levels:** L1 Guided (suggested questions) → L2 Prompted (framework progress + hints) → L3 Independent (blank page and a clock). Score at least 80% accuracy and 80% independence to move up; under 50% accuracy moves you down.
- **Points:** combine accuracy, independence, level, speed and red flags. See `src/engine/scoring.ts`.
- **Stages:** the work gets harder as you go. Set 1 **Foundation** uses classic patients. Set 2 **Application** makes you commit to a diagnosis and defend it after each history. Set 3+ **Challenge** brings the hardest patients first, 25% less time, the must-not-miss diagnosis, and a twist (new information) to re-think. See `src/engine/stages.ts`.
- **Combined drills:** once each block reaches L2, chain blocks on one patient: HPC + Systems, PPH + DH, DH + FH/SH, Ddx → Ix → Mx, then the full station.
- **Plan:** a calendar for placements and exams. Home steers drills to your current placement and switches to exam mode 4 weeks before an exam.
- **Viva:** every presentation has a Viva block. Foundation asks recall questions; Application adds "explain why" with examiner follow-ups; Challenge adds data interpretation and what-ifs. The full-station combined drill ends with the viva.
- **Deep dives:** pick a UKMLA condition instead of a presentation and follow it through four sets: a history where you tag every question (exclude / risk factor / severity), the management ladder (first, second, third line, then choose the drug), a counselling session where the patient asks back, and PSA-style prescribing with interactions, monitoring, data interpretation and viva questions. First deep dive: depression → sertraline.
- **Viva flashcards:** every viva and PSA question becomes a card. Missed cards come back straight away; remembered ones after 1, 3, 7, 14 and 30 days.

It runs on iPhone, Android and the web from one codebase (Expo + React Native).

> Educational tool for medical students, not clinical advice. Content must be checked by a clinician before release — see `docs/CONTENT_GUIDE.md`.

## What's in v0.3

| Presentation | Patients | Drills |
| --- | --- | --- |
| Abdominal pain | Appendicitis, cholecystitis, Crohn's, ectopic | HPC · Systems · DH · Ddx · Ix · Mx · Viva |
| Palpitations | Graves', AF + amiodarone thyrotoxicosis, SVT | HPC · Systems · DH · FH/SH · Ddx · Ix · Mx · Viva |
| Low mood | New depression, SSRI non-adherence, bipolar depression | HPC · Risk · PPH · DH · Ddx · Ix · Mx · Viva |
| **Deep dive: depression** | Laura, Michael, Tom, plus Jade (19) and Arthur (74) for prescribing | Why? · Ladder · Counsel · PSA |

There are also 40 viva questions with examiner follow-ups, and 13 teaching cards: PSA prescribing, SSRIs, the NICE depression ladder, risk assessment, lithium, antipsychotic monitoring, amiodarone, hyperthyroidism, adherence, and more.

## Run it (no coding experience needed)

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
```

**On your phone:** install **Expo Go** from the App Store or Play Store, then:

```bash
npm start
```

Scan the QR code with your camera (iPhone) or with Expo Go (Android). Your phone and computer must be on the same Wi-Fi. This project uses Expo SDK 58, so update Expo Go if it complains about the SDK version.

**In a browser:**

```bash
npm run web
```

**Checks** (run before every commit):

```bash
npm test
```

```bash
npm run typecheck
```

`npm test` also checks the content. Every model question must score for its own checklist item, every Guided option must score for itself, every case needs a model answer for every reasoning block, and every teaching link must exist.

## Project map

```
src/
  app/                    Screens (Expo Router: each file is a route)
    (tabs)/index.tsx      Home dashboard
    (tabs)/topics.tsx     Drill picker
    (tabs)/plan.tsx       Calendar: placements and exams
    deep/[id]             A deep dive: four sets for one condition
    viva.tsx              Viva flashcard review
    (tabs)/progress.tsx   Progress and charts
    (tabs)/library.tsx    Teaching cards
    presentation/[id]     One presentation and its drills
    drill/[p]/[s]         The drill player: intro → reps → set
    summary/[setId]       Set feedback
    learn/[id]            One teaching card
  components/             UI kit, charts, drill components
  content/                ALL medical content (plain TypeScript data)
    common.ts             Reusable checklist items (SOCRATES, drug history…)
    presentations/*.ts    One file per presentation
    library.ts            Teaching cards
    viva/*.ts             Viva questions per presentation
    deepdives/*.ts        Deep dives (condition → history → ladder → counselling → PSA)
  engine/                 Matching, scoring, levels, stages, calendar, recommendations (no UI, unit-tested)
  store/                  Saved progress (on-device, AsyncStorage)
  theme/                  Colours and type — change the look here
tests/engine.test.ts      Engine and content tests
docs/                     Content guide and roadmap
```

## Ship it

- **Website:** `npm run build:web` creates `dist/`, a static site you can host on Netlify, Vercel, Cloudflare Pages or EAS Hosting (`npx eas-cli deploy`).
- **App stores:** `npx eas-cli build` builds in the cloud (no Mac needed). `npx eas-cli submit` uploads to the stores. You need an Apple Developer account (£79/year) and a Google Play account ($25 once).

## How the "patient" works today

The app runs offline. Each checklist item has keyword patterns (`src/content/*`). A question covers an item if any pattern matches, and the patient replies with that case's scripted answer. This is fast, free and predictable, but students sometimes have to rephrase. Phase 2 adds an AI classifier and an AI patient behind the same functions (`src/engine/matcher.ts`). See `docs/ROADMAP.md`.
