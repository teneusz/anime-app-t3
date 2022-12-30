import { z } from "zod";

import { publicProcedure, router } from "../trpc";
import axios from "axios";


export const streamingRouter = router({
  sibnet: publicProcedure
    .input(z.object({ src: z.string() }))
    .query(async ({ input }) => {

      return await axios.get<string>(input.src)
        .then(async response => {
          const part = "player.src([{src: \"";
          const str1 = response.data.substring(response.data.indexOf("player.src([{src: \"") + part.length);
          const str2 = str1.substring(0, str1.indexOf("\""));
          return await axios.get(`https://video.sibnet.ru${str2}`, {
            headers: { "Referer": "https://video.sibnet.ru" },
            maxRedirects: 1
          }).then(subResponse => (subResponse.request._options.href));
        })
        .catch(e => {
          return e.request._options.href;
        });
    })
});


export type StreamingResponse = {
  src: string
}
