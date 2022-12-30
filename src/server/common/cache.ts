import { prisma } from "../db/client";

export const readFromCache = async <T>(url: string) => {
  const cache = await prisma.cacheDocument.findUnique({
    where: {
      key: url
    }
  });
  if (cache == null) {
    return { loaded: false };
  } else {
    const parse: T = JSON.parse(cache.object);
    return { loaded: true, data: parse };
  }
};

export const saveToCache = <T>(url: string, data: T) => {
  prisma.cacheDocument.create({
    data: {
      key: url,
      object: JSON.stringify(data)
    }
  }).then();
};

