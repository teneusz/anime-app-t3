import { useRouter } from "next/router";
import { trpc } from "../../../../../utils/trpc";
import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../../../../layout/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";

const EpisodePage = () => {
  const { query: { name, series, episode } } = useRouter();

  const episodeQuery = trpc.anime.getEpisode.useQuery({
    anime: (name as string),
    series: (series as string),
    episode: (episode ?? [] as string[])[0] ?? "0"
  });

  const [selected, setSelected] = useState("");

  const entries = foo(episodeQuery.data ?? []);

  const videoElement = () => {
    switch (selected) {
      case "sibnet":
        return <SibnetVideo src={entries.get(selected)} />;
      default:
        return <iframe src={entries.get(selected)} width={800} height={600} />;
    }
  };


  return <Layout>
    <div>
      <div className={"flex flex-row"}>
        <AnimeLink anime={(name as string)} series={(series as string)} episode={parseInt((episode as string)) - 1}
                   next={false} />
        <div>
          <div className={"flex flex-row gap-2"}>
            {
              Array.from(entries.entries()).map(([key, value], idx) => (
                <div key={key} onClick={() => {
                  setSelected(key);
                }}
                     className={`hover:bg-blue-200 p-2 ${selected === key ? "bg-blue-400" : ""}`}
                >{key}</div>))

            }
          </div>
          {videoElement()}
        </div>
        <AnimeLink anime={(name as string)} series={(series as string)} episode={parseInt((episode as string)) + 1}
                   next={true} />
      </div>
    </div>
  </Layout>;

};

const SibnetVideo = (props: { src: string }) => {
  const streamingResult = trpc.streaming.sibnet.useQuery({ src: props.src });
  return <div>
    {
      streamingResult.isSuccess && <VideoComponent src={streamingResult.data ?? ""} />
    }
  </div>;
};

const VideoComponent = ({ src }: { src: string }) => {
  const router = useRouter();
  const [current, max] = router?.query?.episode ?? [] as string[];
  const goToNext = () => {
    if (current === max) {
      return;
    }
    router.push(`/anime/${router.query.name}/series/${router.query.series}/${(parseInt(current ?? "0") + 1)}`).then();
  };

  return <video src={src} width={800} height={600} controls={true} onEnded={goToNext} />;
};

const AnimeLink = ({
                     anime,
                     series,
                     episode,
                     next
                   }: { anime: string, series: string, episode: number, next: boolean }) => {
  const router = useRouter();
  const [current, max] = router.query.episode ?? [] as string[];
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(next ? current === max : parseInt(current ?? "1") === 1);
    // console.log(next ?  parseInt(current ??"0") ===  parseInt(max??"0") : parseInt(current ?? "1") === 1);
  }, [current, next]);

  if (disabled) {
    return <div
      className={`w-8 h-fill bg-opacity-60 bg-gray-200 flex justify-center items-center `}>
      <FontAwesomeIcon icon={next ? faChevronRight : faChevronLeft} />

    </div>;
  }

  return <Link href={`/anime/${anime}/series/${series}/${episode}/${max}`}
               className={`w-8 h-fill bg-opacity-60 bg-black hover:bg-opacity-40 flex justify-center items-center `}>
    <FontAwesomeIcon icon={next ? faChevronRight : faChevronLeft} />
  </Link>;


};

const foo = (data: { stream: string, videoLink: string }[]) => {
  const map = new Map();

  data.forEach(e => {
    map.set(e.stream, e.videoLink);
  });

  return map;
};

export default EpisodePage;
