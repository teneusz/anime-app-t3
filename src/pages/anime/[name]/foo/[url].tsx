import Link from "next/link";
import { useRouter } from "next/router";
import { SeriesLink } from "../../../../server/trpc/router/anime";
import { trpc } from "../../../../utils/trpc";
import Layout from "../../../../layout/Layout";
import React from "react";

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
  return <></>;
};
const NormalSeries = ({ originalUrl, anime }: { originalUrl: string, anime: string }) => {
  const query = trpc.anime.getSeriesLink.useQuery({ link: originalUrl });
  const aniList = trpc.anime.getAnimeInfo.useQuery({ name: anime }).data;

  return <Layout>
    <div className={"p-3 bg-blue-300 min-w-fit w-full min-h-max bg-contain bg-no-repeat  bg-cover "} style={{
      backgroundPosition: "50% 35%",
      height: "400px",
      backgroundImage: `url('${aniList?.data.Media.bannerImage ?? ""}')`
    }}>
      <div className={" flex flex-col flex-auto h-full w-full "}>
        <div className={" bg-black bg-opacity-60 p-2"}>
          <a href={originalUrl}
             className={"text-white font-mono font-black"}>{aniList?.data?.Media.title.romaji} - {anime}</a>
        </div>
        <div className={`flex flex-row gap-2 h-5/6 p-2 `}>
          {query.data?.map(e => (
            <SeriesCard series={e} key={`${e.id}-${e.label}-${originalUrl}`} originLink={originalUrl} />)) ?? <></>}
        </div>
      </div>
    </div>
  </Layout>;
};

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


export default AnimePage;
