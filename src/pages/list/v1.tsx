import { trpc } from "../../utils/trpc";
import { AnimeListItem } from "../../server/trpc/router/anime";
import React from "react";
import Layout from "../../layout/Layout";
import { useWbijam } from "../../server/common/useWbijam";
import SeriesCard from "../../layout/SeriesCard";

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


export default List;
