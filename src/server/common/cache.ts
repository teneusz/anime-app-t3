import { prisma } from "../db/client";

export const readFromCache = async <T>(url: string) => {

  // const fileName = url.replaceAll(":", "_").replaceAll("/", "_").replaceAll(".", "_");
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
//   // console.log({ msg: `check if file exists ${fileName}` });
//   if (fs.existsSync(`${process.env.CUSTOM_CACHE_URL}/${fileName}.json`)) {
//     // console.log({ msg: `try to read file ${fileName}` });
//     try {
//       const text = fs.readFileSync(`${process.env.CUSTOM_CACHE_URL}/${fileName}.json`, "utf8");
//       // console.log({ msg: `file readedf ${fileName}` });
//       if (text.length > 0) {
//         const parse: T = JSON.parse(text);
//         return { loaded: true, data: parse };
//       }
//     } catch (e) {
//       console.error({
//       file: fileName,
//         error: e
//       });
//     }
//   }
//   return { loaded: false };
// };
};

export const saveToCache = <T>(url: string, data: T) => {
  // const fileName = url.replaceAll(":", "_").replaceAll("/", "_").replaceAll(".", "_");
  // fs.writeFileSync(`${process.env.CUSTOM_CACHE_URL}/${fileName}.json`, JSON.stringify(data));
  prisma.cacheDocument.create({
    data: {
      key: url,
      object: JSON.stringify(data)
    }
  }).then();
};

