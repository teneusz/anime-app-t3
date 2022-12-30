import { trpc } from "../../utils/trpc";

export const useWbijam = () => {
  const allAnime = trpc.anime.getAll.useQuery();
  const otherAnime = trpc.anime.getOther.useQuery({ link: "https://inne.wbijam.pl/" });

  return [...(allAnime.data ?? []), ...(otherAnime.data ?? [])].sort((e1, e2) => {
    if (e1?.name === undefined) {
      console.log({ e1, e2 });
    }
    return e1.name.localeCompare(e2.name);
  });
};
