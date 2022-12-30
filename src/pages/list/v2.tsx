import { trpc } from "../../utils/trpc";
import type { AnimeListItem } from "../../server/trpc/router/anime";
import React from "react";
import Link from "next/link";
import Layout from "../../layout/Layout";
import { useWbijam } from "../../server/common/useWbijam";


const Listv2 = () => {
  const useQuery = useWbijam();
  return <Layout>
    <div className="grid gap-2 bg-green-200 w-full h-full hover:bg-gray-400 justify-items-center overflow-auto" style={{
      gridTemplateColumns: "repeat(auto-fill, minmax(min(100%,250px), 1fr)"
    }}>
      {
        useQuery.map((e, idx) => {
          if (e.url.includes("inne.")) {
            return <ListItem item={e} key={idx} tabIndex={idx} other={true} />;
          } else {
            return <ListItem item={e} key={idx} tabIndex={idx} />;
          }
        }) ?? <></>
      }
    </div>
  </Layout>;
};

const ListItem = ({ item, tabIndex }: { item: AnimeListItem, tabIndex: number, other?: boolean }) => {
  const aniList = trpc.anime.getAnimeInfo.useQuery({ name: item.name }).data;

  return <Link href={`/anime/${item.name}/foo/${item.url.replace("https://", "").replaceAll("/", "_")}`}>
    <div title={aniList?.data.Media.title.romaji ?? item.name} style={{
      backgroundImage: `url(${aniList?.data.Media.coverImage.large ?? ""})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      width: "230px",
      height: "320px"
    }}
         className={"flex items-end focus:border-blue-100 focus:bg-blue-400 focus:scale-125 hover:scale-125 transition-transform"}
         tabIndex={tabIndex}
    >
      <div className="text-white bg-black w-full h-20 bg-opacity-60 text-center">
        {aniList?.data.Media.title.romaji ?? item.name}
      </div>

    </div>
  </Link>;
};

export default Listv2;
