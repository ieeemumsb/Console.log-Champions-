import Image from "next/image";
import "./game.css"

const layout = ({ children }:{children:React.ReactNode}) => {
  return <div className="flex flex-col items-center ">  <Image src="/groot.png" alt="Groot" className="w-48 mb-6 fixed mt-24 left-[40%]" width={192} height={192} />{children}</div>;
};

export default layout;
