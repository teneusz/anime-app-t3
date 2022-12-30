import { SeriesLink } from "../server/trpc/router/anime";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import React from "react";

const SeriesCard = ({ series, originLink }: { series: SeriesLink, originLink: string }) => {
  const episodes = trpc.anime.getEpisodes.useQuery({
    link: series.url,
    originLink
  });

  const maxEpisode = Math.max(...(episodes.data?.map(e => parseInt(e.episode)) ?? [0]));

  return <div className={"bg-black bg-opacity-60 text-white font-mono font-black w-full flex flex-col"}>
    <div className={"justify-center content-center w-full flex border-amber-100 border-b-2"}>
      <a href={series.url}>{series.label}</a>
    </div>
    <div className={" flex flex-col overflow-y-auto"}>
      {episodes?.data?.map(e => {
        return <Link href={`/anime/${e.anime}/series/${e.seriesName}/${e.episode}/${maxEpisode}`}
                     key={e.url}>{e.label}</Link>;
      })}
    </div>
  </div>;
};

export default SeriesCard;
