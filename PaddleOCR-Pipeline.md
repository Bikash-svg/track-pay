# PaddleOCR Pipeline — Reference and Implementation Guide

**Status:** Stage 1 complete (Python, validated). Stage 2 (React Native integration) not started.
**Supersedes:** 4-B.5b (crop+upscale workaround for ML Kit).
**Owner decision:** 2026-11-07 — Replace ML Kit with PaddleOCR entirely.
**Companion docs:** `LOG.md` (decision trail), `baseline_hybrid.py` (reference implementation), `baseline_hybrid_output.json` (parity ground truth).

---

## 1. Why this document exists

Track Pay's current OCR layer is Google ML Kit (`rn-mlkit-ocr`). Device testing proved ML Kit **cannot read the large-font amount** rendered by GPay, PhonePe, and Navi — the OCR output from those apps contains **no amount digits at all** (GPay 376 chars, PhonePe 414 chars, zero amount). Only Paytm works.

An independent Python pipeline built and validated in November 2026 (44 screenshots, 6 apps, 95%+ amount accuracy, **zero fine-tuning**) proved PaddleOCR solves this. This doc is the complete reference for porting that pipeline into the React Native app.

Everything below is backed by measurements in `LOG.md`. Nothing here is speculative.

---

## 2. Headline results

| Metric | ML Kit (current) | PaddleOCR (validated) |
|---|---|---|
| Amount — GPay | 0/6 | 6/6 |
| Amount — PhonePe | 0/4 | 4/4 |
| Amount — Navi | 0/6 | 6/6 |
| Amount — BHIM | 0/12 | 12/12 |
| Amount — FamPay | 0/4 | 3/4 |
| Amount — Paytm | 4/4 | 4/4 |
| **Total across 44 screenshots** | **~5/44** | **42/44 (95%)** |
| Date / time / direction / counterparty / app / status | partly broken | **44/44 (100%)** |
| Fine-tuning required | n/a | **None** |
| Network required | No (bundled) | No (bundled) |

Remaining 2 amount failures (`famPay-3`, `navi-1`) are honest manual-entry cases. Manual entry already exists in the app.

---

## 3. Setup — Python side (laptop)

### 3.0 When to use this section

This section is for setting up the Python pipeline **from scratch on a new machine**.

If `source venv/bin/activate` works and `python -c "import paddle"` prints a version, you are already set up — skip to Section 4.

**Two locations matter:**

- `~/my_things/code-stuff/projects/OCR-train/` — the Python pipeline (this section). Used for: ONNX export (§6), parity testing reference (`baseline_hybrid.py`).
- **The Track Pay app repo** — where Sections 6, 7, 8, 9 apply. This is a **different folder**, not `OCR-train/`.

Do not confuse the two. `OCR-train/` is a Python scratch project; Track Pay is the React Native app.

### 3.1 Python version

**Python 3.12 required.** PaddlePaddle 3.3.0 does not support Python 3.14.

```bash
# If not already installed (Ubuntu)
sudo apt install software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3.12-dev