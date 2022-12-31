import { z } from "zod";

import { publicProcedure, router } from "../trpc";
import axios from "axios";
import * as cheerio from "cheerio";
import axiosInstance from "../../../utils/AxiosInstance";
import { readFromCache, saveToCache } from "../../common/cache";

export const animeRouter = router({
  getAll: publicProcedure.query(async () => {
    const url = "https://wbijam.pl";

    const cache = await readFromCache<AnimeListItem[]>(url);
    if (cache.loaded) {
      return cache.data;
    }
    console.log("leci " + url);
    return await axios.get(url).then(async response => {
      // console.log({msg:"leci request", link:url})
      const $ = cheerio.load(response.data);
      const result: AnimeListItem[] = [];
      $("#myTopnav div.dropdown:nth-child(4) a.sub_link").each((idx, el) => {
        const animeUrl = el.attribs["href"] ?? "";
        if (!animeUrl.includes("inne.wbijam.pl")) {
          result.push({
            url: animeUrl,
            name: $(el).text(),
            id: idx
          });
        }
      });
      saveToCache(url, result);
      return result;
    });
  }),
  getOther: publicProcedure
    .input(z.object({ link: z.string() }))
    .query(async ({ input }) => {
      const cache = await readFromCache<AnimeListItem[]>(input.link);
      if (cache.loaded) {
        return cache.data;
      }
      console.log("leci " + input.link);
      return await axios.get(input.link).then(e => {
        const result: AnimeListItem[] = [];
        try {
          const $ = cheerio.load(e.data);
          $("div.tresc").each((idx, element) => {

            const subPage = cheerio.load(element);
            const rawName = $(element.children[6]).text();
            const name = rawName.slice(0, rawName.length - 1).trim();
            const subPageUrl = subPage("a")[0]?.attribs["href"] ?? 0;
            result.push({
              url: input.link + subPageUrl,
              name: name,
              id: idx
            });
          });
          saveToCache(input.link, result);
          return result;
        } catch (error) {
          console.log({ msg: "pobranie innych", error });
        }
        return [];
      });
    }),
  getSeriesLink: publicProcedure
    .input(z.object({ link: z.string() }))
    .query(async ({ input }) => {
      const cache = await readFromCache<SeriesLink[]>(input.link);
      if (cache.loaded) {
        return cache.data;
      }
      return await axios.get(input.link).then(response => {
        const $ = cheerio.load(response.data);
        const result: SeriesLink[] = [];

        $("ul.pmenu:nth-child(6) li a").each((idx, el) => {
          result.push({
            url: input.link + (el.attribs["href"] ?? ""),
            label: $(el).text(),
            id: idx
          });
        });

        saveToCache(input.link, result);
        return result;
      });

    }),
  getEpisodesForOther: publicProcedure
    .input(z.object({ link: z.string() }))
    .query(async ({ input }) => {
      const cache = await readFromCache<OtherSeries[]>(input.link);
      if (cache.loaded) {
        return cache.data;
      }
      return await axios.get(input.link).then(response => {
        const $ = cheerio.load(response.data);
        const result: OtherSeries[] = [];

        $(".lista").each((idx, element) => {
          //TODO :)
          // const seriesName = element.previousSibling ? $(element.previousSibling)?.text() ?? "" : ""; //h1 with name
          // element; //table with episodes
        });

        saveToCache(input.link, result);
        return result;
      });

    }),
  getEpisodes: publicProcedure
    .input(z.object({ link: z.string(), originLink: z.string() }))
    .query(async ({ input }) => {
      const cache = await readFromCache<EpisodeLink[]>(input.link);
      if (cache.loaded) {
        return cache.data;
      }
      return await axios.get(input.link).then(response => {
        try {
          const $ = cheerio.load(response.data);
          const result: EpisodeLink[] = [];
          $(".lista tr a").each((idx, el) => {
            const url = input.originLink + (el.attribs["href"] ?? "");
            const [seriesName, episode] = url.substring(url.lastIndexOf("/") + 1).replaceAll(".html", "").split("-");
            const anime = url.slice(url.indexOf("/") + 2, url.indexOf("."));
            result.push({
              url: url,
              label: $(el).text(),
              id: idx,
              anime,
              seriesName: seriesName ?? "",
              episode: episode ?? "0"
            });
          });
          saveToCache(input.link, result);
          return result;
        } catch (e) {
          console.log(e);
        }
        return [];
      });

    }),
  getEpisode: publicProcedure
    .input(z.object({ anime: z.string(), series: z.string(), episode: z.string() }))
    .query(async ({ input }) => {
      const url = `https://${input.anime}.wbijam.pl/${input.series.replace("-", "_")}-${input.episode.length == 1 ? "0" + input.episode : input.episode}.html`;
      const cache = await readFromCache<{ stream: string, videoLink: string }[]>(url);
      if (cache.loaded) {
        return cache.data;
      }
      return await axios.get(url)
        .then(async response => {
            try {
              const $ = cheerio.load(response.data);
              const arr: { stream: string, videoLink: string }[] = [];
              const result: { stream: string, videoLink: string }[] = [];
              $(".lista tr").each((idx, el) => {
                const element = cheerio.load(el);
                const videoRel = element("td:nth-child(5) span").get()[0]?.attribs["rel"] ?? "";
                arr.push({ stream: element("td:nth-child(3)").text(), videoLink: videoRel });
              });
              for (const arrElement of arr) {
                if (arrElement.videoLink == null || arrElement.videoLink.length == 0) {
                  continue;
                }
                const strimingurl = `https://${input.anime}.wbijam.pl/odtwarzacz-${arrElement.videoLink}.html`;
                const videoUrl = await axios.get(strimingurl).then(subPage => {
                  const videoSubPage = cheerio.load(subPage.data);
                  return videoSubPage("iframe").get()[0]?.attribs["src"] ?? "";
                });
                if (videoUrl != "")
                  result.push({ stream: arrElement.stream, videoLink: videoUrl });
              }

              saveToCache(url, result);
              return result;
            } catch (e) {
              console.log(e);
            }
            return [] as { stream: string, videoLink: string }[];
          }
        );

    }),
  getAnimeInfo: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      if (input.name === "Saga Winlandzka") return null;
      const url = `anilist-${input.name}`;
      const cache = await readFromCache<AniListResponse<AniListMedia>>(url);
      if (cache.loaded) {
        return cache.data;
      }
      return await axiosInstance.post<AniListResponse<AniListMedia>>("https://graphql.anilist.co/", {
        query:
          `
           {
            Media(search: "${input.name}", type: ANIME) {
              title {
                romaji
                english
                native
                userPreferred
              }
              source
              idMal
              bannerImage
              coverImage {
                extraLarge
                large
                medium
                color
              }
              episodes
            }
          }
        `,
        variables: { "anime_name": input.name }
      }, {
        headers: { "Accept-Encoding": "gzip,deflate,compress" }
      }).then(e => {
        saveToCache(url, e.data);
        return e.data;
      }).catch((e) => {
        console.log({ msg: "Ani error", error: e });
      });

    })
});

export type AniListResponse<T> = {
  data: T
}

type AniListSource =
  "ORIGINAL"
  | "MANGA"
  | "LIGHT_NOVEL"
  | "VISUAL_NOVEL"
  | "VIDEO_GAME"
  | "OTHER"
  | "NOVEL"
  | "DOUJINSHI"
  | "ANIME"
  | "WEB_NOVEL"
  | "LIVE_ACTION"
  | "GAME"
  | "COMIC"
  | "MULTIMEDIA_PROJECT"
  | "PICTURE_BOOK";
export type AniListMedia = {
  Media: {
    title: {
      romaji: string,
      english: string,
      native: string,
    },
    source: AniListSource,
    idMal: number,
    bannerImage: string,
    coverImage: {
      extraLarge: string,
      large: string,
      medium: string
    },
    episodes: number | null
  }
}
export type AnimeListItem = {
  name: string, url: string, id: number
}

export type SeriesLink = {
  label: string,
  url: string,
  id: number
}

export type EpisodeLink = {
  label: string,
  url: string,
  id: number,
  anime: string,
  seriesName: string,
  episode: string
}

export type OtherSeries = {
  label: string,
  url: string,
  episodes: (SeriesLink & { streams: { stream: string, videoLink: string }[] })[]

}
