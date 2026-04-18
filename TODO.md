# Fix Build Error: z is not defined

## Status: In Progress

### Steps:
1. [x] Install `zod` dependency (`npm i zod`)
2. [x] Uncomment `import { z } from "zod";` in `constants/index.ts`
3. [x] Fix `next.config.ts` (remove invalid `eslint` and `typescript` options)
4. [x] Run `npm run build` to verify
5. [x] Update eslint-config-next version if needed
6. [ ] Complete task

**Root Cause:** Missing `zod` package and commented import in `constants/index.ts`, causing runtime error during API route evaluation.
