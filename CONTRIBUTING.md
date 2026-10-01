# Contributing to meshlet-culling-wgsl

Thank you for your interest in contributing to `meshlet-culling-wgsl`!

## Architectural Principles
1. Zero Runtime Dependencies: Core mesh partitioning, geometric math, and compute kernels must remain 100% dependency-free.
2. Comprehensive Test Coverage: All geometric routines must be accompanied by mathematical unit tests in `tests/`.
3. Strict Type Safety: Maintain TypeScript strict mode with no implicit `any`.

## Testing
Run tests prior to submitting pull requests:
```bash
npm test
```
