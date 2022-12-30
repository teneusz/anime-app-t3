import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { animeRouter } from "./anime";
import { streamingRouter } from "./streaming";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  anime: animeRouter,
  streaming: streamingRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
