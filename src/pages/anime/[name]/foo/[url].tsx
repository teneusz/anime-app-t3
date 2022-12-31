import { useRouter } from "next/router";
import { trpc } from "../../../../utils/trpc";
import Layout from "../../../../layout/Layout";
import React from "react";
import { EpisodeLink, SeriesLink } from "../../../../server/trpc/router/anime";
import Link from "next/link";

const AnimePage = () => {
  const { query: { url, name } } = useRouter();
  const anime = (name as string);
  const originalUrl = `https://${(url as string)?.replaceAll("_", "/")}`;
  const other = originalUrl?.includes("inne.");
  if (other) {
    return <OtherSeries anime={anime} originalUrl={originalUrl} />;
  }
  return <NormalSeries anime={anime} originalUrl={originalUrl} />;
};


const OtherSeries = ({ originalUrl, anime }: { originalUrl: string, anime: string }) => {
  return <>{originalUrl} {"==>"} {anime}</>;
};
const NormalSeries = ({ originalUrl, anime }: { originalUrl: string, anime: string }) => {
  const query = trpc.anime.getSeriesLink.useQuery({ link: originalUrl });
  const aniList = trpc.anime.getAnimeInfo.useQuery({ name: anime }).data;

  return <Layout>
    <div className={"p-3 bg-blue-300 bg-contain bg-no-repeat  bg-cover h-max max-w-full"}>
      <AnimeTitle aniTitle={aniList?.data?.Media.title.romaji ?? ""} ogName={anime} originalUrl={originalUrl} />
      <div className={`grid `}>
        {query.data?.map(e => (
          <SeriesEpisodes series={e} key={`${e.id}-${e.label}-${originalUrl}`} originLink={originalUrl} />)) ?? <></>}
      </div>
    </div>
  </Layout>;
};

const AnimeTitle = ({ aniTitle, ogName, originalUrl }: { aniTitle: string, ogName: string, originalUrl: string }) => {
  return <div className={" bg-black bg-opacity-60 p-2"}>
    <a href={originalUrl}
       className={"text-white font-mono font-black"}>{aniTitle} - {ogName}</a>
  </div>;
};

const SeriesEpisodes = ({ series, originLink }: { series: SeriesLink, originLink: string }) => {
  const episodes = trpc.anime.getEpisodes.useQuery({
    link: series.url,
    originLink
  });
  const maxEpisode = Math.max(...(episodes.data?.map(e => parseInt(e.episode)) ?? [0]));

  return <div className={"flex flex-col overflow-auto max-w-full"}>
    <div>
      {series.label}
    </div>
    <div className={"flex flex-row gap-2 overflow-auto max-w-full"}>
      {episodes.data?.sort((ep1, ep2) => ep1.label.localeCompare(ep2.label)).map((ep) => {
        return <EpisodeCard episode={ep} key={ep.url} maxEpisode={maxEpisode} />;
      })
      }
    </div>
  </div>;
};

const EpisodeCard = ({ episode, maxEpisode }: { episode: EpisodeLink, maxEpisode: number }) => {
  return <Link href={`/anime/${episode.anime}/series/${episode.seriesName}/${episode.episode}/${maxEpisode}`}>
    <div className={"bg-black bg-opacity-60 h-60 w-60"}>
      {episode.label}
    </div>
  </Link>;
};


export default AnimePage;
