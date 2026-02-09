# Frontend Build Scripts

## Overview

This directory contains scripts for verifying frontend build health during development and deployment.

## Scripts

### `frontend-build-check.sh`

A comprehensive frontend-only build verification script that runs two phases:

1. **TypeScript Type Check**: Validates all TypeScript code without emitting files
2. **Vite Build**: Performs a full production build

#### Usage

**Local development:**
