import type { PropsWithChildren } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const Layout = (props: PropsWithChildren) => {

  return <>
    <div className={"bg-amber-50 h-screen w-screen grid grid-flow-col"} style={{
      gridTemplateColumns: "6rem auto"
    }}>
      <div className={"h-full w-24 shadow-2xl grid grid-flow-row items-center justify-center"}>
        <Link href={"/"}>
          <FontAwesomeIcon icon={faHome} className={"text-7xl"} />
        </Link>
      </div>
      {props.children}
    </div>
  </>;

};

export default Layout;
