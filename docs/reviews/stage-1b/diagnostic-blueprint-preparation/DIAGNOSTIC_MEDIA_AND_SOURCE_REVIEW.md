# Diagnostic media and source review

2026-10-24 · Step 2 audit only. Physical integrity PASS; semantic/source review conditional; Listening auditory alignment BLOCKED. No source edited, recording uploaded or learner media opened.

## Source association and readable stimuli

[src/data.ts:48](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/src/data.ts:48) contains four inline Reading paragraphs, rendered by [src/features/Diagnostic.tsx:240](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/src/features/Diagnostic.tsx:240). No PDF/image is required for these five items. `public/sample-reading.pdf` and `public/garden-plan.svg` are unrelated available sample assets; their existence cannot validate this diagnostic. Visual inspection of those unrelated assets was not necessary. Reading source is UTF-8 text, parsed and manually read in full:

**Paragraph 1**

Urban green spaces are often described as places for plants, but their value can extend far beyond appearance. In crowded cities, even a small park, community garden, or tree-lined street can change how people experience their neighbourhood. These spaces can offer a break from traffic, concrete and noise, while also creating opportunities for social interaction.

**Paragraph 2**

Community gardens are a particularly interesting example. Residents who share a garden may begin by caring for separate plots, yet the work often creates small opportunities to talk and cooperate. Someone who has gardened for decades may teach a new volunteer how to prepare soil, while a younger resident may help an older neighbour with a phone-based booking system. Over time, a space that began as a collection of plants can become a place where relationships grow as well.

**Paragraph 3**

Green spaces can also provide practical environmental benefits. Trees and other plants can offer shade, support insects such as bees and butterflies, and make streets feel less severe during very hot periods. Vegetation cannot solve every urban environmental problem, however. A garden still needs water, planning and people who are willing to maintain it. Without regular care, a once-useful area can quickly become neglected.

**Paragraph 4**

For this reason, the strongest projects usually involve residents in both planning and maintenance. Community participation can make people more likely to notice problems, share responsibility and protect the space over time. This does not mean that every city needs a large garden on every street. Rather, even modest green areas can have meaningful effects when they are designed around local needs and treated as shared community resources.

R1: P1/P3/P4 synthesis. R2: P2 cross-age cooperation. R3: the exact phrase “less severe” is present in P3. R4: P3/P4 neglect inference, with stronger “usually” wording noted. R5: P4 participation plus P2 relationship synthesis; narrower final-paragraph wording could be improved later. All five keys are content-supported candidates; no official-paper or calibrated-difficulty claim follows. Individual alternative reviews are in the key audit CSV.

## Audio physical integrity — actual PASS

[src/features/Diagnostic.tsx:246](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/src/features/Diagnostic.tsx:246) references `/listening-diagnostic.wav`. Existing public, dist and standalone copies are byte-identical:

- SHA-256: `0e6c831770433da34f962cb03f9d4ddea33b335316f47b5f32b1640457dcd3c2`.
- Each 2,378,292 bytes; RIFF/WAVE uncompressed PCM; mono, 16-bit, 22,050 Hz.
- 1,189,124 frames decoded; duration 53.928526 seconds; all expected sample bytes present.
- Peak amplitude 32,148; RMS 3,177.26; no full-scale clipped samples detected. These are signal checks, not speech/audibility certification.

Python standard-library WAV decoding was executed. Browser/hardware playback was not exercised in this audit; container/PCM compatibility does not guarantee playback on every browser/device.

## Audio semantic alignment — BLOCKED, not inferred

[src/data.ts:55](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/src/data.ts:55) declares this script:

Community gardens are more than places to grow plants. In many cities, they give neighbours a reason to meet, share knowledge and take responsibility for a common place. Older residents may pass along gardening knowledge to younger volunteers, while younger people often bring digital skills that help organize schedules or events. Plants can also provide shade during hot weather and create habitats for insects. But these benefits are not automatic. Without regular care, a neglected garden can become less attractive and may stop providing the same social and environmental benefits. The most successful projects therefore treat the garden as a shared community space rather than a decoration. People plan it together, maintain it together, and gradually build stronger local relationships.

The five stored keys match this **declared text** individually: L1 main theme, L2 older residents' knowledge, L3 shade, L4 lost benefits, L5 shared relationships/learning/responsibility. All five are option B. No human auditory signoff or independently verified transcript/timecodes tied to the actual WAV was found. No usable installed Windows speech recognizer was returned by a local read-only recognizer inventory; no STT package/service was installed or called. The reviewer has not verified the spoken waveform content. Therefore L1–L5 remain excluded from validated Listening scoring.

Required resolution: a named reviewer must listen to this exact hashed WAV, provide a timecoded transcript, map each L1–L5 evidence span, and check pronunciation, intelligibility, accidental answer cues and whether the declared script is actually spoken. Record reviewer/date/hash and any limitations. If the recording differs, approve a new immutable content/media version rather than changing an existing assignment. A timecoded verification alone does not establish redistribution rights.

## Replay, timing and independence

[src/components/MediaControls.tsx:6](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/src/components/MediaControls.tsx:6) marks playback used when `play()` resolves, not when audio ends. Test mode hides native pause/seek/transcript and disables another play when the persisted flag is true. Refresh does not restore allowance. A mid-play failure can consume the allowance; reload does not reset the saved flag. No recording-ended condition is required to advance once an answer and played flag exist. These are observed source rules, not a freshly tested browser guarantee. Owner must approve interruption/recovery and accessibility accommodations before freeze.

The one-play convention resembles the official Listening format, but this short talk is not a full IELTS assessment. [Official Listening format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening).

Reading and Listening share community-garden facts and near-parallel questions; Reading is served first. Prior Reading exposure can support Listening answers without hearing. The same static content is also accessible to other prototype modules through shared data imports. This reduces independence and makes repeated exposure/retakes unsuitable for proficiency claims. Proposed action: retain the seven-domain diagnostic shape, but approve whether Listening should receive a distinct stimulus in a future version; do not randomize or replace it now.

## Authorship, authenticity and rights — SOURCE_REVIEW / BLOCKED freeze

Local historical notes describe original illustrative samples. No item-specific author attestation, license, audio-speaker/TTS generation record, voice redistribution permission, official source URL or rights grant was found for these exact stimuli/tasks. Public IELTS pages verify format facts, not the origin/license of local questions. Provenance remains UNKNOWN, not proven infringement and not certified permission. Needed: owner records origin/author, creation or source date, permitted uses/redistribution, voice/media rights, attribution requirements and exact file/content digest. Do not label these items IELTS-official or use them as a calibrated bank.

## Productive input media

Writing is a private text draft with 180-word advance threshold and 20-minute guidance; the stated 180–250 target is a shortened diagnostic. Official Task 2 expects at least 250 words with about 40 minutes suggested. [Official Writing resources](https://ielts.org/take-a-test/preparation-resources/writing-test-resources). The discrepancy needs clear labeling, not an automatic change to official timing.

Speaking requests local microphone permission, uses MediaRecorder and constructs a Blob URL only in component state; cleanup stops tracks/revokes URLs. No persisted recording was found in the diagnostic model, and no actual learner media was inspected. The diagnostic callback keeps only status/duration and discards the no-microphone fallback marker. Real recording and fallback thus cannot be distinguished after reload. Submission can precede asynchronous blob finalization; duration/status alone do not establish valid audio. Capture identity, nonempty decodable blob validation, session-only versus durable evidence and approved retention need a future contract. No objective or IELTS Speaking score is supported.
