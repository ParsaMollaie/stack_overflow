import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

interface Props {
  title: string;
  description: string;
  link: string;
  linkTitle: string;
}

const NoResult = ({ title, description, link, linkTitle }: Props) => {
  return (
    <div className="mt-10 flex flex-col justify-center items-center w-full ">
      <Image
        src="/assets/images/light-illustration.png"
        alt="no result"
        width={270}
        height={200}
        className="dark:hidden object-contain block"
      />

      <Image
        src="/assets/images/dark-illustration.png"
        alt="no result"
        width={270}
        height={200}
        className="dark:flex object-contain hidden"
      />

      <h2 className="h2-bold text-dark200_light900 mt-8">{title} </h2>
      <p className="text-center max-w-md body-regular my-3.5 text-dark500_light700">
        {description}
      </p>
      <Link href={link}>
        <Button
          className="paragraph-medium mt-5 min-h-[46px] rounded-lg bg-primary-500 hover:bg-orange-600
            px-4 py-3 text-light-900 dark:bg-primary-500 dark:text-light-900 dark:hover:bg-orange-600
        "
        >
          {linkTitle}
        </Button>
      </Link>
    </div>
  );
};

export default NoResult;
