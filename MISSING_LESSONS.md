# Missing-lesson brief (gaps vs. ai-knowledge-tree)

> **Status:** specification only. This file deliberately does **not** touch
> `content/` — authoring is Cowork's lane (CLAUDE.md §3). It records *what* to
> write and *where*, so Cowork (who has the dissertation PDF + `content/STYLE.md`
> loaded) can write the prose. Confirm chapter placement / numbering with Luan
> before authoring; the slugs below are proposals, not decisions.

## Why these

A topic-level comparison of the **"LLM Researcher"** learning path in
`../ai-knowledge-tree` (subsections `A2, A3, D1, D3, E3, E4, E8, H6`) against the
full amt curriculum found five topics the path advertises that amt does **not**
teach as a dedicated session. Two are true gaps (no coverage at all); three are
"mention-only" (the term appears inside other lessons but has no session of its
own). None requires restructuring an existing chapter — each is an *additive*
session.

| # | Topic | amt today | akt source |
|---|-------|-----------|-----------|
| 1 | PEFT — LoRA / QLoRA / DoRA | mention-only (in 9.2, 9.6, 9.10, …) | E4 |
| 2 | Scalable oversight / weak-to-strong generalization | absent | E8 |
| 3 | Attention-free recurrence — RWKV / RetNet / Hyena | mention-only (8.8) | D3 |
| 4 | Linear / sub-quadratic attention | mention-only (6.2, 6.12, 8.8) | D3 |

(#3 and #4 are closely related and could ship as one session or two — author's call.)

---

## 1. Parameter-efficient fine-tuning (LoRA / QLoRA / DoRA)

- **Proposed slug:** `content/ch9-alignment/9.2a-peft-lora-qlora.mdx`
  (sits right after `9.2-sft.mdx`; PEFT is how SFT/DPO are run in practice).
- **Order:** between 9.2 and 9.3.
- **Goal:** "Derive low-rank adaptation: why ΔW = BA with rank r ≪ d trains
  <1% of parameters at near-full-FT quality, and how QLoRA's 4-bit base + DoRA's
  magnitude/direction split extend it."
- **Prerequisites:** `["ch9-alignment/9.2-sft", "ch0-math-foundations/0.2-matrix-calculus"]`
  (low-rank factorisation leans on the matrix-calculus / rank material).
- **Must cover:** the low-rank update and its rank/`alpha` scaling; memory math
  vs. full fine-tuning; QLoRA (NF4 + double quant + paged optimisers); a one-line
  note on DoRA; a numpy/torch sketch injecting `B @ A` into a linear layer.

## 2. Scalable oversight & weak-to-strong generalization

- **Proposed slug:** `content/ch11-interpretability-frontier/11.8a-scalable-oversight.mdx`
  (next to `11.8-emergent-abilities-debated.mdx` / `11.9-where-the-frontier-is-now.mdx`).
- **Goal:** "State the scalable-oversight problem (supervising models stronger
  than their supervisors) and what the weak-to-strong generalization results do
  and don't show."
- **Prerequisites:** `["ch9-alignment/9.13-rlaif-constitutional"]`.
- **Must cover:** the oversight gap as capability outruns evaluatability;
  weak-to-strong setup (weak labels → strong student) and the recovered-
  performance-gap metric; debate / recursive reward modeling as proposed
  mechanisms; honest statement of open problems. Likely `codeExempt`-style
  conceptual (confirm amt's frontmatter convention for code-free sessions).

## 3. Attention-free recurrence (RWKV / RetNet / Hyena)

- **Proposed slug:** `content/ch8-modern-llm-architectures/8.9-attention-free-recurrence.mdx`
  (after `8.7-state-space-models-mamba` and `8.8-hybrid-architectures`).
- **Goal:** "Show how RWKV, RetNet, and Hyena reach sub-quadratic sequence
  mixing without softmax attention, and the parallel-train / recurrent-infer
  duality they share with SSMs."
- **Prerequisites:** `["ch8-modern-llm-architectures/8.7-state-space-models-mamba"]`.
- **Must cover:** RWKV's WKV recurrence; RetNet's retention (parallel vs.
  recurrent vs. chunkwise forms); Hyena's long convolution + gating; how each
  trades the attention matrix for O(n) or O(n log n) mixing.

## 4. Linear / sub-quadratic attention

- **Proposed slug:** `content/ch8-modern-llm-architectures/8.10-linear-attention.mdx`
  (or fold into #3 — they answer the same "kill the n² cost" question).
- **Goal:** "Derive linear attention from the kernel-feature view
  (softmax → φ(q)·φ(k)) and the associativity trick that turns O(n²d) into
  O(n d²), and state where it loses to full attention."
- **Prerequisites:** `["ch6-attention-transformer/6.2-scaled-dot-product-attention"]`.
- **Must cover:** the feature-map reformulation; the
  `(φ(K)ᵀ V)` running-sum that removes the n² matrix; Performer/linear-attention
  quality trade-offs; relation to the recurrence view in #3.

---

### Not gaps (already covered, listed to pre-empt double-work)

The path's other advertised topics already have amt sessions: ALiBi (`6.A`,
`6.13`), RoPE (`6.7`), MoE (`8.6`), GQA/MQA (`8.3`), scaling laws (`7.11`,
`7.12`), DPO/GRPO/PPO/RLAIF (ch9), SAEs / mech-interp / induction heads (ch11).
A few path items are intentionally *out of amt's scope* (classical convex-
optimisation theory — KKT, BFGS, proximal methods; probability breadth — Markov
chains, conjugate priors, information geometry); those live in akt's foundation
pillars and are not proposed here.
