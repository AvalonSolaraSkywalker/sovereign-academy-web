# Sovereign Academy – Front‑End (Next.js)

> A free, open‑source learning platform that teaches individuals how to build and manage their own sovereign digital presence.  
> This repository contains the **Next.js front‑end** (UI) for the Sovereignty Academy project.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Support](#docker-support)
- [Continuous Integration / Continuous Deployment (CI/CD)](#cicd)
- [Contributing](#contributing)
- [License](#license)
- [Contact & Support](#contact--support)

---

## Prerequisites

| Tool | Version | How to install |
|------|---------|----------------|
| **Node.js** | `>=20` | `brew install node` (or use the provided `Brewfile`) |
| **pnpm** | `>=10` | `npm i -g pnpm` |
| **Homebrew** (macOS) | latest | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| **Docker** (optional) | latest | `brew install --cask docker` |

### Install all Homebrew‑managed tools with a single command

```bash
# From the repository root
brew bundle --file=Brewfile
