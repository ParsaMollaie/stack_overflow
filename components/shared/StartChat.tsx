import React from 'react';
import Image from 'next/image';

interface Props {
  title: string;
  description: string;
}

const StartChat = ({ title, description }: Props) => {
  return (
    <div className="mt-20 flex flex-col justify-center items-center w-full ">
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
    </div>
  );
};

export default StartChat;
