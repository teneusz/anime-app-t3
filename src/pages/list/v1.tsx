import { trpc } from "../../utils/trpc";
import { AnimeListItem, SeriesLink } from "../../server/trpc/router/anime";
import React from "react";
import Link from "next/link";
import Layout from "../../layout/Layout";
import { useWbijam } from "../../server/common/useWbijam";

const List = () => {
  const useQuery = useWbijam();
  return <Layout>
    <div
      className="flex flex-row flex-wrap gap-4 p-5 h-full 0 overflow-auto ">
      {
        useQuery.sort((e1, e2) => e1.name.localeCompare(e2.name)).map(e => {
          return <ListItem item={e} key={e.id} />;
        }) ?? <></>
      }
    </div>
  </Layout>;
};
const ListItem = ({ item }: { item: AnimeListItem }) => {
  const query = trpc.anime.getSeriesLink.useQuery({ link: item.url });
  const aniList = trpc.anime.getAnimeInfo.useQuery({ name: item.name }).data;

  return <div className={"p-3 bg-blue-300 min-w-fit w-full min-h-max bg-contain bg-no-repeat  bg-cover "} style={{
    backgroundPosition: "50% 35%",
    height: "400px",
    backgroundImage: `url('${aniList?.data.Media.bannerImage ?? ""}')`
  }}>
    <div className={" flex flex-col flex-auto h-full w-full "}>
      <div className={" bg-black bg-opacity-60 p-2"}>
        <a href={item.url}
           className={"text-white font-mono font-black"}>{aniList?.data?.Media.title.romaji} - {item.name}</a>
      </div>
      <div className={`flex flex-row gap-2 h-5/6 p-2 `}>
        {query.data?.map(e => (
          <SeriesCard series={e} key={`${e.id}-${e.label}-${item.url}`} originLink={item.url} />)) ?? <></>}
      </div>
    </div>
  </div>;
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

export default List;
