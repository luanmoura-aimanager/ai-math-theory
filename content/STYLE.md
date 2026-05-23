# Content tone & voice guide

This guide is loaded by every authoring session that touches `content/`.
Read it before writing or editing any `.mdx`. It is intentionally short.

## 1. The voice

The prose should read like Luan thinking through a derivation with the
reader at his side. Not a textbook reciting, not a tutorial selling.
Dense, specific, honest about what is hard.

When choosing between two phrasings, prefer the one that:

1. Reads closest to how a competent person would say it out loud while
   working at a whiteboard.
2. Carries more technical content per word.
3. Uses commas, colons, semicolons, or a full stop in place of an
   em-dash.
4. Does not announce itself with intensifiers.

## 2. Patterns to remove on sight

These are the recurring tells of "artificial textbook voice". Each row
gives the symptom, why it fails, and the fix posture.

### 2.1 Em-dashes used as drama or punchline

`Bad:` `returns the linear part — period.`
`Why:` the dash plus "period" is a rhetorical drum hit; in math prose it
reads like a slogan.
`Fix:` use a colon, a comma, or end the sentence. Drop the punchline.

### 2.2 Vague threat or promise lines

`Bad:` `Mix them and you suffer.`
`Why:` it warns without saying what breaks.
`Fix:` replace the vague consequence with the concrete one
("produces transposed gradients that look right but are not").

### 2.3 Standalone intensifiers

`Bad:` `it is literally PyTorch's backward().` `exactly the outer product`
`Why:` `literally`, `exactly`, `simply`, `clearly`, `obviously`,
`actually` rarely add information and usually overstate the claim.
`Fix:` delete the intensifier and let the sentence stand. If the
sentence then feels weak, the problem is the sentence.

### 2.4 First-person plural pedagogy

`Bad:` `Let's compute element-wise...`
`Why:` "let's" is the voice of a classroom prompt; the rest of the
document is not in that voice.
`Fix:` state the operation in third person or as a direct instruction
("Computing element-wise...", "The cleanest route is...").

### 2.5 Colorful descriptors in headings

`Bad:` `## 3. Derivative with respect to W — the slippery point`
`Why:` headers should label, not editorialise.
`Fix:` drop the descriptor, or replace with a technical qualifier
("the subtle case", "the matrix-input case").

### 2.6 Punitive or sing-song closings

`Bad:` `If you end up with X in the wrong place, re-read §1.`
`Why:` reads as a wagged finger; tone shifts from peer to instructor.
`Fix:` state what went wrong, not what the reader should do
("If X shows up where Y should be, the layout convention slipped").

### 2.7 Empty connective phrases

Avoid `it follows that`, `we see that`, `as we will see`, `note that`,
`recall that` when the math already shows the step. They pad without
teaching.

## 3. Editing posture: surgical first, structural only when needed

When fixing an artificial passage, default to **surgical**: leave the
sentence structure alone and remove the offending word or dash. Reach
for **structural** rewriting only when surgical exposes that the
sentence was not saying anything concrete.

**Heuristic.** Read the original out loud with the artificial element
mentally deleted. If the sentence still teaches the thing it was meant
to teach, go surgical. If it now teaches nothing, the original was
substituting tone for content; rewrite the sentence to carry the
content the tone was hiding.

Concretely:

| Trigger | Posture |
|---|---|
| Em-dash punchline, "literally", "exactly", "let's", colorful header | Surgical |
| Vague threat ("you suffer"), punitive closing, hand-wavy claim | Structural |

## 4. Worked examples

These are the canonical references. New rewrites should resemble these.

### 4.1 Vague threat (structural)

Before:
> I pick numerator because it makes the chain rule stack matrices in
> the natural multiplication order. Mix them and you suffer.

After:
> I pick numerator because it makes the chain rule stack matrices in
> the natural multiplication order. Mixing conventions silently breaks
> every chain-rule expansion that follows.

### 4.2 Em-dash punchline (surgical)

Before:
> Intuition: differentiating an affine map with respect to its input
> returns the linear part — period.

After:
> The intuition is direct: differentiating an affine map with respect
> to its input recovers its linear part.

### 4.3 Colorful header (surgical)

Before:
> ## 3. Derivative with respect to W — the slippery point

After:
> ## 3. Derivative with respect to W

### 4.4 First-person plural pedagogy (surgical)

Before:
> Let's compute element-wise and only afterwards decide how to store it.

After:
> The cleanest route is to differentiate index by index; the storage
> shape will fall out at the end.

### 4.5 Em-dash plus intensifier (surgical)

Before:
> ...whose (j,k) entry is δ_j x_k — exactly the outer product:

After:
> ...with (j,k) entry δ_j x_k, which is the outer product

### 4.6 Standalone intensifier (surgical)

Before:
> chained across all layers, it is literally PyTorch's backward().

After:
> chained across all layers, this is exactly what PyTorch's backward()
> accumulates.

(Note: `exactly` is kept here because it disambiguates a precise claim
about what is being computed, not because it intensifies.)

### 4.7 Punitive closing (structural)

Before:
> If you end up with W^T y x^T in the wrong place, re-read §1.

After:
> If W^T y x^T shows up in the slot where δ x^T should be, the
> convention from §1 was crossed.

## 5. Things this guide is not

This is not a ban on personality or first-person voice. Luan writes the
book; the prose is allowed to sound like Luan. The targets are
*artificial* tells: dramatic dashes, empty intensifiers, classroom
"let's", colorful filler, punitive closings, vague threats.

When in doubt, write the sentence the way you would explain the step
to a colleague who has just sat down next to you. That voice is the
target.
