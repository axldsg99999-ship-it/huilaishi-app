# Voice asset provenance and release status

This file is a release control, not a claim that the current audio is original human voice acting or native-teacher approved.

## Current fixed and optional audio

- Provider/voice family recorded by the generation metadata: Microsoft prebuilt neural voices.
- Chinese voices: `zh-CN-XiaoxiaoNeural` and `zh-CN-XiaoyiNeural`.
- Thai voice: `th-TH-PremwadeeNeural`.
- Generation client recorded by the project workflow: `edge-tts`.
- Processing: rate adjustment, segmentation, silence trimming and loudness normalization; no custom voice model was trained.
- Disclosure: the application must identify these tracks as synthetic learning demonstrations, not human recordings or an original proprietary voice.
- Native-language review: pending.

## Commercial release gate

**Status: not approved for commercial distribution.**

Microsoft's current Product Terms state that commercial use of audio output from prebuilt neural voices is permitted for customers of the paid TTS tier. This repository does not contain an Azure invoice, resource identifier, generation job record, account-tier attestation or equivalent evidence showing that the published files were generated under that paid tier.

Official terms checked on 2026-08-22:

- https://www.microsoft.com/licensing/terms/en-US/productoffering/MicrosoftAzure/allprograms
- https://learn.microsoft.com/en-us/azure/ai-services/speech-service/faq-tts

Before a commercial release, replace the pending status with an immutable evidence record containing:

1. provider and service name;
2. paid-tier subscription/resource evidence;
3. generation date and applicable terms version;
4. exact generation script revision and voice parameters;
5. input-text provenance and rights;
6. output inventory hash;
7. native-language approval reference;
8. project-owner approval date.

If paid-tier evidence cannot be recovered, regenerate all distributed tracks through an eligible paid service or replace them with properly licensed human recordings. Do not silently mark the existing files as commercially approved.
