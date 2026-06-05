# Requirements — Ethiopian Legal Document Platform (Final)

**Type:** Full-stack Next.js application + offline Python ML subsystem (added late, §13)
**Market:** Ethiopia. **Anchor document type:** lease/rental agreements.
**Languages:** Amharic (Ge'ez) + English first; Afaan Oromoo added only when demand and corpus justify it (§0.3).

**Core thesis:** the products are the wedge; the durable asset is a *system* — a reviewed legal-translation corpus + independent legal QA + fit with how Ethiopian documents are actually executed + distribution and trust. Raw lease data alone is a thin moat (§0.2). Build the data engine (Phase 1) before the consumer product (Phase 2), and **validate demand, economics, institutional acceptance, and legal structure before building either** (§1). Build order follows the gates, not all at once (§16).

---

# PART A — STRATEGY & PHASING

## 0. Strategy at a Glance

### 0.1 Two products, in order
| | **Phase 1 — Expert Tool** | **Phase 2 — Consumer App** |
|---|---|---|
| User | Translation / legal shops | Landlords, tenants, SMBs |
| Job | Make legal translation faster | Self-serve a lease, sign/execute it |
| Output | Reviewed segment-pairs (the corpus) | Assembled, executed documents |
| Role | **Data engine** | **Corpus consumer** |
| Built when | After §1 validation clears | After the §3 corpus gate clears |

### 0.2 Honest moat
A lease-only corpus is *thin* — leases are highly templated, so a competitor could rebuild it. Defensibility is the **combination**: reviewed corpus **+** independent legal-QA layer (§4) **+** institutional fit (documents the kebele/courts/banks accept, §6.4) **+** per-shop data gravity (§2.5) **+** in-market distribution and trust. Treat improving base models as a *tailwind* for review speed, not only a threat; QA + institutional layers survive model improvement.

### 0.3 Language strategy
Do not pre-build the hardest, most expensive language on faith. Default **Amharic + English**. Add **Afaan Oromoo** only when (a) §1.A validates demand for an Oromo legal version and (b) the corpus + QA can support it. Architecture is trilingual-ready; the *commitment* is demand-gated.

### 0.4 Build-before-validate is rejected
The cheapest, highest-leverage work (§1) is mostly no-code and currently unvalidated. Building the full system before §1 risks constructing the corpus pipeline, QA layer, signing, and ML infra before confirming anyone wants a trilingual e-signed lease, that institutions accept it, or that the ETB math clears. The build order (§16) ships only what de-risks the next gate.

## 1. Phase 0 — Validation Gates (cheap, ~3–5 weeks; mostly no code)

Each gate: a question, a cheap test, a go/no-go.

- **A. Demand.** Do users want this, in which languages? Test: 15–20 interviews + a landing/"fake-door" page measuring sign-ups by language. Go: clear pull for an assisted multilingual lease. Pivot/Kill: if only Amharic is wanted, drop trilingual and re-judge the premise.
- **B. Institutional acceptance.** Will a kebele/woreda registry, court, and bank accept the output? Test: interview a registry + a property lawyer on wet-ink/stamp/witness/registration rules. Go: e-execution accepted. Else: redesign Phase 2 as **hybrid** (§6.4). Validity ≠ acceptance.
- **C. Economics.** Can ETB pricing cover USD costs with margin at 160+ ETB/USD? Test: build the §7 unit-economics model with real per-document inference cost (per §7.2 cost models) and willingness-to-pay. Go: positive margin. Else: cut/repath AI cost or target forex segments first.
- **D. Legal structure.** Is this unauthorized practice of law, and can confidential documents legally leave the country? Test: one legal opinion on (i) licensed-entity requirements and (ii) cross-border transfer of confidential/personal data. Go: a compliant structure (§8) + a data-residency rule (§7.2). Can force core architecture — resolve before building.
- **E. Supply.** Is the data-engine market big enough? Test: count Ethiopian legal/translation shops and estimate legal-doc volume.

**Precondition:** the shop **data-rights + anonymization contract (§2.6)** is drafted before any document enters the system. Cannot be retrofitted.
**Kill if:** only Amharic wanted *and* no business there · institutions reject e-execution *and* hybrid unviable · economics can't clear USD costs · no compliant legal structure.

---

# PART B — PRODUCT REQUIREMENTS

## 2. Phase 1 — Expert Tool (the data engine)

### 2.1 Target user
Translation/legal shops producing Ethiopian legal documents.

### 2.2 Day-one value (solves cold start — independent of the corpus)
The TM is empty at launch, so the day-one wedge is software, not data: best-in-class Ge'ez editing/rendering; built-in Ethiopian-calendar dates + ETB formatting; clean Word/PDF export in shops' delivery formats; glossary/term-base.

### 2.3 Seed strategy
Build a starter reviewed corpus of common lease segments with 1–2 anchor shops (paid pilot), so the memory isn't empty for the next shop.

### 2.4 Features
- Source↔target segment editor with TM matches surfaced.
- AI draft assist (draft/intent only; human edits and approves; capture suggestion **and** correction).
- Clause/template builder; glossary; Ge'ez+Latin rendering; ET-calendar/ETB helpers; export.
- **TMX import/export** — shops bring existing translation memories (industry-standard interchange). Accelerates adoption, partially seeds the corpus, and deepens lock-in via accumulated in-product memory.

### 2.5 Monetization & lock-in
- **Model:** seat-based ETB subscription (+ free tier). **Phase 1 must be at least breakeven on its own**; Phase 2 is upside.
- **Lock-in:** a TM is portable, so stickiness comes from *accumulated* per-shop memory/glossary/templates (data gravity), workflow integration, and client-delivery features — not the tool alone.

### 2.6 Data capture & rules (non-negotiable)
- Capture `source → reviewed target`, language pair, suggestion-vs-final, quality/source tag.
- **Anonymize/redact PII at ingest — before any external call or storage** (§14.7). Train on patterns/clause corrections, never raw identifiable documents.
- Secure explicit, chain-verified data-use rights from the shop (confirm the underlying client consent chain).
- Segment, don't hoard whole client contracts.

## 3. The Corpus & the Gate
- **What:** versioned store of reviewed segment-pairs and reusable clauses, per language pair, with quality weighting and provenance.
- **Targets (set in §1):** coverage = % of a standard lease assemblable from **gold** segments (hypothesis: 80%); volume per language pair (Afaan Oromoo is the long pole — track separately); minimum quality grade.
- **Gate:** Phase 2 does not launch for a document type until it clears coverage + quality in every supported language.

## 4. Quality Assurance & Legal Correctness
Shops vary; they cannot be the final authority on correctness.
- **Trust tiers:** shop output is a **candidate**; it becomes **gold** only after independent review.
- **Independent legal review:** a contracted reviewing lawyer / small board owns correctness — a funded, recurring role, not a spot-check.
- **Gold sets + grading:** maintain gold reference segments; grade shops; weight trusted sources.
- **Hard rule:** only **gold** segments are eligible for Phase 2. Candidate data improves the tool but never reaches a consumer document unreviewed.

## 5. Template Maintenance & Legal Currency
- Versioned templates/clauses with per-language review dates; scheduled review cadence; auto-flag/expire past a freshness threshold.
- **Law-change propagation:** one legal change updates the affected clause across all templates and languages, with re-review before re-promotion to gold.
- Named owner accountable for legal currency.

## 6. Phase 2 — Consumer App (corpus consumer)

### 6.1 Users
Landlords/property managers, tenants, SMBs; plus the counterparty signer (no account, signs in their language, mobile-first).

### 6.2 Templates & editing
Leases assembled from **gold** corpus segments. AI chat does **intent extraction → structured operations** (§14.4), shown as a diff to approve. Inserted clauses resolve to reviewed text per language; shared field values render into each language so versions can't diverge. Retrieval, never free-text generation. Persistent "not legal advice" disclaimer.

### 6.3 Language rollout
Launch **Amharic + English**; add Afaan Oromoo per §0.3.

### 6.4 Execution model (validity ≠ acceptance)
Per the §1.B finding:
- Institutions accept e-signing → full e-sign + audit trail + completion certificate (§14.9).
- Institutions require physical execution → **hybrid**: the app prepares and correctly formats the document for wet-ink signing, witnessing, stamping, and kebele/woreda registration. Meet the existing process.

### 6.5 Post-signing lifecycle
A completed document is immutable (hashed, §14.9). Support **void/cancel** (before completion), and **amendment/addendum** as a *new* version that references the prior document — never an edit of a signed artifact. Each amendment runs its own execution flow.

## 7. Economic Viability & Cost Control

### 7.1 The problem
Costs are USD; revenue is ETB, depreciated ~140%+ since the July 2024 float and projected near 160–165 ETB/USD by mid-2026, with dollars scarce. A naive USD-cost/ETB-revenue SaaS has a structural margin problem.

### 7.2 Controls
- **Minimize AI spend:** cache (legal segments repeat), batch, call models only where they add value.
- **Regional/self-hosted inference for confidential content** — cuts USD cost *and* satisfies the §1.D residency rule.
- **Forex-earning segments:** prioritize USD/forex-paying customers (diaspora, NGOs, international firms) to offset USD costs.
- **Two cost models (don't conflate):** foreign-API path = token-priced; self-hosted in-region path (most volume) = **amortized GPU-hour ÷ throughput** (fixed). Assuming token pricing everywhere under-counts the self-hosted GPU cost — the part most likely to break the margin.
- **Measure in production, not eval:** cost-per-document from production telemetry (§15 `CostTrace`, via Langfuse) on representative traffic.
- **Margin gate:** an ETB subscription must cover its per-path inference + hosting cost with margin at the projected rate, or the model changes before launch.
- **Runway:** Phase 1 funds the company; Phase 2 is upside.

## 8. Legal & Compliance (spans both phases)
- **Structure (UPL):** expert tool = software used *by* licensed professionals; consumer app = licensed-partner arrangement and/or self-help-forms model (tool + no legal advice). Confirm in §1.D.
- **Data residency / cross-border:** no confidential/personal data to foreign AI APIs; anonymize/redact at ingest and/or use regional/self-hosted models (§7.2, §14.7–8).
- **E-signature enforceability:** validate against *Ethiopian* law (ESIGN/UETA/eIDAS are reference models only); pair with §6.4.
- **Audit trail:** immutable, append-only, canonical Gregorian/UTC timestamps.
- **Tamper-evidence:** SHA-256 hash the governing-language version on completion; store/optionally server-sign.
- **Governing-language clause:** every document states which version governs (default Amharic; English for commercial; Oromo for Oromia); others labeled "translation for convenience."
- **Certificate of Completion + consent to e-sign:** in the signer's language and the governing language.
- **Identity (tiered):** email/phone-OTP minimum; Fayda national ID later.
- **Template liability:** lawyer-reviewed per language; review dates tracked (§5); clear disclaimers.

## 9. Localization & Trilingual Content Model
- **No runtime MT of binding text.** MT (Gemini/Translate) only drafts segments a human reviews once before they enter the corpus; fine for non-binding UI/help/marketing.
- **Amharic + English first; Oromo demand-gated** (§0.3).
- **Shared field values** stored once, rendered into each language — cannot diverge.
- **Ethiopian calendar:** EC entry/display on the document face; canonical Gregorian/UTC in the audit trail; user picks EC/GC.
- **Currency/numerals:** ETB; Arabic numerals default, Ge'ez optional.
- **Fonts:** embed Ethiopic + Latin (Noto Sans Ethiopic / Abyssinica SIL); verify Ge'ez rendering in generated PDFs early.
- **UI i18n:** next-intl; per-language content keyed in DB.

## 10. Non-Functional Requirements
- **Security:** encryption at rest/in transit; row-level access control; RBAC (shop admin / translator / reviewer; owner / signer); signed/expiring, single-use signer tokens; secrets server-side.
- **Privacy & residency:** PII minimized and anonymized at ingest; confidential data stays in-region; export/delete on request.
- **Reliability:** signing + audit writes atomic (DB transactions).
- **Connectivity resilience:** autosave + local draft persistence; tolerate intermittent connectivity (Ethiopian network reality); consumer signer flow mobile-first.
- **Performance:** sub-second editing; async PDF/inference; cached retrieval.
- **Accessibility:** keyboard-navigable signing; WCAG-aware.

## 11. Success Metrics & KPIs
- **North star:** reviewed **gold** segments accumulated per week (corpus growth = moat growth).
- **Phase 1:** suggestion-acceptance rate; time saved per segment/document; ratio of corrections vs accepts; shop activation & retention.
- **Corpus:** coverage % per language; gold volume; **Afaan Oromoo volume** (long pole).
- **Phase 2:** completion rate; time-to-sign; **gap rate** (slots without gold coverage); institutional-acceptance rate.
- **Business:** ETB margin per document/shop (per-path cost); forex-segment revenue share.

---

# PART C — TECHNICAL

## 12. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router), Server Actions / Route Handlers |
| DB / ORM | PostgreSQL + Prisma |
| Auth | Auth.js / Clerk; signer flow token-based, no account |
| Editing | TipTap (ProseMirror), constrained to editable regions |
| i18n | next-intl; per-language content in DB |
| PDF | Puppeteer (HTML→PDF) with embedded Ethiopic + Latin fonts |
| Storage | In-region object storage, signed URLs |
| Jobs | pg-boss (Postgres-native) or BullMQ/Redis |
| Email/SMS | Resend (or local provider); SMS for OTP/reminders |
| Payments | Telebirr / Chapa (local) + Stripe (forex segments) |
| Crypto | Node `crypto` — SHA-256 + optional server-key signing |
| Inference serving (self-hosted) | vLLM (OpenAI-compatible endpoint) |
| Semantic TM / retrieval | pgvector (Postgres-native) + a multilingual embedding model (eval-selected) |
| Offline ML (Stage 3+) | Python: Hugging Face PEFT/TRL (LoRA/QLoRA, DPO later); Axolotl/Unsloth |
| Eval metrics | sacreBLEU (chrF/chrF++), COMET; deterministic check suite; promptfoo/custom harness |
| LLM tracing + cost telemetry | Langfuse |
| Model registry / experiments | MLflow or Weights & Biases |

## 13. Deployment Topology & Build Phasing

The split is **online vs offline**, not "AI vs not-AI." Anonymization happens *before* any data crosses into the ML tier, so the ML service only ever sees anonymized data.

```
Next.js / Node workers  (request-path + ingestion)
  owns: users, shops, documents, templates, clauses, approval flow,
        audit events, billing, signer flow,
        PII detection / anonymization (ingestion path),
        pgvector store + query-time vector search
  calls: vLLM for online inference; foreign API only on anonymized content

vLLM  (online model serving)
  online inference for confidential (in-region) + anonymized paths;
  OpenAI-compatible endpoint; router tags each call's path for §15 CostTrace

FastAPI / Python  (OFFLINE only — does NOT exist until Stage 3, §14.13)
  training (PEFT/TRL/LoRA, DPO later),
  eval harness (COMET/sacreBLEU + the §14.14 suites),
  batch embedding of the corpus,
  champion–challenger promotion
  reads/writes Postgres; triggered via the job queue; sees only anonymized data
```

**Rules:** (1) anonymize before data crosses into Python; (2) confidential-path serving and anything touching confidential data stays **in-region**; (3) the offline Python service is not built until §14.13 Stage 3 — until then it's vLLM + batch scripts, and online inference (incl. query-time embeddings) is called directly from the app.

## 14. Technical Breakdown

### 14.1 Architecture
Modular monolith in Next.js with strict internal boundaries; extract async/CPU/security-sensitive concerns into workers from day one (anonymization, PDF render, inference). Full service split is a later optimization.

### 14.2 Module boundaries
| Module | Responsibility | Phase |
|---|---|---|
| `auth` | users, shops, signer tokens, RBAC | both |
| `doc-engine` | structured template/clause/field model (§14.3) | both |
| `workspace` | translation editor, TM matches, TMX I/O | 1 |
| `corpus` | segment store, trust tiers, retrieval | both |
| `ai-orchestration` | intent extraction, draft assist, edit-ops (§14.4–5) | both |
| `anonymization` | PII detection/redaction (§14.7) | both |
| `signing` | hashing, append-only audit, certificate (§14.9) | 2 |
| `render` | HTML→PDF, fonts, EC dates (§14.10) | both |
| `qa` | candidate→gold review workflow (§4) | both |
| `billing` | Telebirr/Chapa/Stripe | both |

### 14.3 Structured document model (core abstraction)
Templates are an ordered tree of typed nodes, not text blobs — this is what makes safe editing, reliable translation, and gap-flagged assembly possible.
```jsonc
{
  "templateId": "lease_residential_v3",
  "governingLanguage": "am",
  "nodes": [
    { "type": "fixed",  "id": "n1", "clauseId": "preamble" },
    { "type": "field",  "id": "n2", "fieldKey": "rent", "dataType": "money" },
    { "type": "clause", "id": "n3", "slot": "deposit", "selected": "deposit_2mo" }
  ]
}
```
`fixed`/`clause` → resolve to **gold** text per language; `field` → shared `FieldValue` rendered identically across languages; `clause` slots have an allowed set (selecting one is an op, never free text).

### 14.4 AI edit-ops contract (the safety boundary)
The model returns **only** a validated operations array referencing existing ids — never prose for binding text.
```jsonc
{
  "ops": [
    { "op": "setField",     "fieldKey": "rent", "value": 15000, "currency": "ETB" },
    { "op": "selectClause", "slot": "deposit", "clauseId": "deposit_2mo" },
    { "op": "removeClause", "slot": "pets" }
  ],
  "explanation": "Set rent to 15,000 ETB and add a 2-month deposit clause."
}
```
Validation: each `fieldKey`/`slot`/`clauseId` must exist, (for clauses) be in the allowed set and **gold**; values type-checked. Reject → ask to rephrase. No op writes raw legal prose.

### 14.5 Intent → ops pipeline
`user message (any lang)` → server → inference (intent extraction → ops JSON) → **validate against this document's allowed ops** → diff → on approval, apply in a DB transaction → write `AiEdit` + `AuditEvent`. Binding text always comes from the gold corpus.

### 14.6 Translation & corpus pipeline (Phase 1)
`ingest` → **anonymize (§14.7)** → segment & align → TM lookup → AI draft assist → human review → **candidate** → QA review → **gold**. Only gold is eligible for Phase 2 (§4).

### 14.7 Anonymization / PII pipeline (before any external call or storage)
Detect via NER + Ethiopian-specific regex (names, phone, Fayda/national ID, bank/account numbers, addresses, kebele references) → redact. Two modes: **reversible session tokenization** (placeholders in a session vault, document stays usable) and **irreversible stripping** for the corpus/training store. Enforcement point for §1.D residency. Runs in the app/worker tier so the ML tier never sees raw PII.

### 14.8 Inference routing & residency
A flag marks content `confidential` vs `anonymized|non-confidential`. Confidential → in-region/self-hosted; else foreign API permitted. Model selection for Amharic/Oromo is an **evaluation task** (benchmark before committing). **Cost basis per path:** API = token-priced; self-hosted = amortized GPU-hour ÷ throughput. Router tags each call's path for §15 `CostTrace`.

### 14.9 Signing, hashing & audit (Phase 2, e-sign mode)
Finalize → canonicalize → **SHA-256 hash the governing-language version** → persist (optionally server-sign) → append-only `AuditEvent`s → Certificate of Completion (PDF) in signer + governing language. Hash + signature + audit commit in **one transaction**. Append-only enforced structurally (no UPDATE/DELETE; hash-chain each event to the prior).

### 14.10 PDF rendering pipeline
Render worker: resolved HTML → PDF via Puppeteer with embedded Ethiopic + Latin fonts; EC/GC date formatting; embed signatures; append certificate. Async via queue.

### 14.11 Retrieval / assembly (Phase 2 endgame)
Assemble from gold clauses/segments; **flag any slot with no gold coverage as a gap** (blocks or routes to human). "Autonomous" = coverage high enough that gaps are rare — never that a model wrote the clauses.

### 14.12 Cross-cutting
- **i18n:** next-intl; user-facing legal content keyed by `(entityId, language)` in DB.
- **Jobs:** anonymization, PDF render, async inference, reminders/expiry, law-change propagation.
- **Observability:** structured logs + the audit trail double as the compliance record; Langfuse for inference traces + cost.

### 14.13 Learning & self-improvement loop
Sequence by cost/risk; **no training pipeline before the data justifies it.**
- **Stage 1 — Retrieval (day one, no training):** TM exact/fuzzy + semantic match (pgvector + multilingual embeddings). More gold → better suggestions immediately; safest (reuses verified text).
- **Stage 2 — Dynamic few-shot:** inject top-k similar gold pairs + glossary terms into the draft-assist prompt. No training.
- **Stage 3 — Fine-tune (only when corpus can show a measurable win):** LoRA/QLoRA on the in-region model from `(source→gold)` and `(suggestion→correction)`; DPO later (corrections are implicit preferences). **This is when the offline Python service (§13) is built.**
- **Gating (champion–challenger):** a new model ships only if it beats the champion on the held-out gold eval (§14.14); versioned in the registry.
- **Hard rules:** train only on anonymized data; a model improvement **never** auto-promotes to gold; keep a clean human gold eval set **never** trained on (model-collapse tripwire); weight human corrections over accepted-as-is suggestions.

### 14.14 Evaluation harness (LLM-as-judge is *not* the gate)
Layered — deterministic checks beat a judge wherever ground truth exists.
- **Intent→ops & retrieval/assembly — deterministic:** compare produced ops / selected gold clauses to a labeled expectation set (set/exact-match, pass@1).
- **Structural & terminology — deterministic, hard-fail:** numbers, dates, names, currency, placeholders preserved exactly; glossary terms-of-art match the term base. A wrong number fails the build.
- **Reference translation metrics — relative signal only:** chrF/chrF++, COMET as regression detectors (weak for low-resource Amharic/Oromo); never an absolute gate.
- **Human review is the gold gate (§4).**
- **LLM-as-judge — advisory only:** (1) **triage** the human queue (order by risk), (2) meaning-preservation flag on higher-resource sides. Bias-mitigated (rubric-constrained, reference-augmented, ensembled). **Measure judge↔human agreement on the gold set; trust only where high — expect unreliability in Afaan Oromoo (the judge inherits the weakness the product exists to fix).** Never promotes to gold, never blocks a human.

**Three targeted suites (test the boundaries, independent of model quality):**
- **PII leakage (§14.7):** feed synthetic Ethiopian PII (fake Fayda, +251 numbers, Addis addresses, Amharic names); **deterministic fail-on-leak**; test both modes. *Caveat:* proves recall on known structured patterns (near-100% via regex); free-text Amharic names depend on weak NER and will leak unseen cases — a green build is a floor, not proof; training-store path keeps human name review.
- **Adversarial / validator (§14.4):** the boundary is the **server-side validator, not model compliance** — a jailbroken model emitting a perfect Amharic clause is harmless because raw prose isn't a valid op. Inject injection attempts *plus* subtler cases (valid-but-non-gold clause, clause not in slot's allowed set, out-of-range values). **Gate:** 0% schema-violation passes.
- **Layout regression (§14.10):** render longest templates per language at max-length field values. **Gate:** **bounding-box / overflow assertions** (no overflow, signature blocks don't spill pages, governing-language clause stays contiguous). Avoid raw pixel-diff (brittle); coarse tolerance-bounded smoke test only, if at all.

## 15. Data Model (sketch)

**Shared / corpus**
- **Segment** — source, reviewed target, language pair, **trust tier (candidate/gold)**, quality grade, provenance, anonymized (bool), version.
- **SegmentEdit** — segment_id, AI suggestion, human correction, reviewer, timestamp (training signal).
- **Clause / ClauseContent** (per language) — reusable reviewed clauses; review date; version.
- **Template / TemplateContent** (per language) — node-tree definition + per-language body; review date; version.
- **Glossary/TermBase** — enforced legal terms per language.

**Phase 1**
- **Shop** — org, data-rights status, quality grade. **ShopUser** (RBAC), **Project/Job**.

**Phase 2**
- **User**, **Document** (template, governingLanguage, calendar mode, execution mode [esign/hybrid], status, completion hash, supersedes_doc_id for amendments), **FieldValue**, **Signer**, **SignatureField**, **AuditEvent** (Gregorian/UTC, append-only, hash-chained), **AiEdit**, **Subscription/Rental**.

**ML / eval**
- **Embedding** — segment_id, language, vector (pgvector).
- **ModelVersion** — base model, training-data snapshot, status (champion/challenger/retired), eval scores.
- **EvalRun** — model_version_id, harness suite, deterministic pass rates, reference metrics, judge↔human agreement, timestamp.
- **TrainingExample** — from gold + correction pairs, anonymized, held-out flag (never-trained eval set).

**Production telemetry (not eval)**
- **CostTrace** — per request/document: inference path (api/self-hosted), model_version_id, prompt/completion tokens (api), latency_ms (avg/p95), attributed cost (token-priced api; amortized GPU self-hosted), via Langfuse. Feeds the §7 margin gate.

---

# PART D — BUILD & VALIDATION

## 16. Build Order (gate-tied — do NOT build all at once)

| Step | Build | Unlocked by / Validates | Excludes |
|---|---|---|---|
| 0 | §1 gates (interviews, landing test, lawyer opinion, econ model) + data-rights contract | — (mostly no code) | everything else until gates pass |
| 1 | **Thin-slice expert tool (§17)** | Builds during §1; validates demand/supply, seeds corpus | training, QA tiers, signing, consumer app, payments |
| 2 | Full Phase 1: corpus store + candidate/gold, QA workflow, Stage-1 retrieval (pgvector), TMX I/O, vLLM if self-hosting | §1 gates pass | offline ML service, consumer app |
| 3 | Phase 2 consumer app: templates/assembly (retrieval), intent→ops chat, signing **or** hybrid (per §1.B), certificate | §3 corpus coverage gate | offline ML service |
| 4 | Offline Python ML (§13): fine-tuning, eval-harness pipeline, champion–challenger | §14.13 Stage 3 (corpus shows measurable win) | — |

## 17. Phase-0 Thin-Slice Build Scope (immediately buildable)

The only thing to build *now* — a real, shippable expert tool that doubles as the validation instrument and corpus seed.

**Build:**
- Next.js (App Router) + PostgreSQL/Prisma + auth (shop users, RBAC).
- Segment editor: source↔target, Ge'ez + Latin rendering, ET-calendar/ETB helpers, glossary CRUD.
- **Anonymization at ingest** (§14.7): structured-PII regex (Fayda, +251, accounts, addresses) + a pluggable NER hook; reversible session tokenization.
- AI draft assist via a **single configurable model endpoint** (start: foreign API on anonymized text; abstract the interface so vLLM swaps in later). Capture suggestion **and** correction.
- Word/PDF export (Puppeteer, embedded fonts).
- **Validation instrumentation** (§18): log suggestion-acceptance rate, edit distance (correction effort), time-per-segment, language usage — the data that answers §1.A/E.
- TMX import (adoption + seed).

**Explicitly exclude (keep data model forward-compatible, don't build yet):** offline Python ML service; full candidate→gold promotion workflow + independent QA; signing/audit/certificate; the consumer app; payments; fine-tuning. Store reviewed pairs as data now; build the gold-promotion machinery in Step 2.

## 18. Validation Instrumentation
The thin slice must measure assumptions, not just function. Instrument from day one: language chosen per document/segment (tests §0.3 + §1.A); suggestion-acceptance vs correction rate and edit distance (tests day-one value, §2.2, and seeds the learning signal); time-per-segment/document vs baseline (tests the productivity wedge); per-shop volume (tests §1.E supply). These feed §11 KPIs and the Step-1→Step-2 decision.

## 19. Risks → Mitigations

| Risk | Mitigation |
|---|---|
| Building all at once before validating | Gate-tied build order; thin slice first (§16, §17) |
| Trilingual demand unproven | Amharic+English first; Oromo demand-gated (§0.3, §1.A) |
| ETB revenue vs USD cost | Per-path cost model + controls + forex segments (§1.C, §7) |
| Thin lease-data moat | System moat: corpus + QA + institutional fit + data gravity (§0.2) |
| Validity ≠ acceptance | Institutional gate + hybrid execution (§1.B, §6.4) |
| Cross-border data | Residency rule + regional/self-hosted + anonymize-before-Python (§7.2, §13, §14.7–8) |
| Unauthorized practice of law | Licensed-partner / self-help-forms structure (§1.D, §8) |
| Cold start (empty TM) | Day-one software value + seed corpus + TMX import (§2.2–2.4) |
| Shops not authoritative on correctness | Independent legal-QA, gold-only to Phase 2 (§4) |
| Templates rot | Versioning + review cadence + law-change propagation (§5) |
| Phase 1 runway | Phase 1 breakeven on its own; Phase 2 upside (§2.5, §7) |
| Models improve, moat erodes | Moat is QA + institutional fit; model gains are a tailwind (§0.2) |
| No lock-in | Per-shop data gravity + accumulated TM/glossary (§2.5) |
| Data supply too small | Supply gate sizing (§1.E) |
| AI generates/translates legal text | Intent→ops + gold retrieval + diff-approve (§14.4–5) |
| Versions diverge | Shared field values + governing-language clause (§8, §9) |
| Ge'ez rendering bugs | Verify embedded-font PDFs early (§9, §14.10) |
| LLM-as-judge unreliable for low-resource legal | Human gold gate; judge as triage, calibrated to agreement (§14.14) |
| Model collapse / feedback loop | Never-trained human eval set; weight corrections; champion–challenger (§14.13) |
| Premature training spend | Retrieval + few-shot first; fine-tune only on a measurable win (§14.13) |
| PII leak via weak Amharic name NER | Leak suite as a floor; human name review on training-store path (§14.7, §14.14) |
| Mis-attributed inference cost breaks margin | Per-path cost model + production CostTrace (§7.2, §14.8, §15) |
| Premature FastAPI/ML service | Online vs offline split; service not built until Stage 3 (§13, §16) |

## 20. Immediate Next Steps
1. Run §1 gates — cheapest, highest-leverage, mostly no code, currently unvalidated.
2. Draft the shop data-rights + anonymization contract (§2.6) before any document enters.
3. Get the one legal opinion (§1.D) — it can reshape the architecture.
4. In parallel, build only the §17 thin slice — it validates demand/supply and seeds the corpus.
5. Let the gate results decide Steps 2–4 of the build order (§16). Do not build ahead of the gates.
