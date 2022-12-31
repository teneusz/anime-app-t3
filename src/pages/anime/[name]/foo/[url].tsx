import { useRouter } from "next/router";
import { trpc } from "../../../../utils/trpc";
import Layout from "../../../../layout/Layout";
import React from "react";
import SeriesCard from "../../../../layout/SeriesCard";

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


export default AnimePage;
