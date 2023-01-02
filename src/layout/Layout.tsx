import type { PropsWithChildren } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { faBackward } from "@fortawesome/free-solid-svg-icons/faBackward";
import { faSquareCaretLeft } from "@fortawesome/free-regular-svg-icons";

const Layout = (props: PropsWithChildren & { backTo?: string }) => {
  const router = useRouter();
  return <>
    <div className={"bg-amber-50 h-screen w-screen relative"} style={{
      // gridTemplateColumns: "6rem auto"
    }}>
      <div className={"h-full w-10 shadow-2xl grid grid-flow-row items-center justify-center absolute right-2"}>
        <FontAwesomeIcon icon={faSquareCaretLeft} className={"text-2xl"} onClick={() => router.back()} />
        {props.backTo &&
          <Link href={props.backTo}>
            <FontAwesomeIcon icon={faBackward} className={"text-2xl hover:cursor-pointer"} />
          </Link>
        }
        <Link href={"/"}>
          <FontAwesomeIcon icon={faHome} className={"text-2xl"} />
        </Link>
      </div>
      <div style={{
        width: "calc(100% - 2.5rem)"

      }}>
        {props.children}
      </div>
    </div>
  </>;

};

export default Layout;
