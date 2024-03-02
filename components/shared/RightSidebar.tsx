import Image from "next/image";
import Link from "next/link";
import React from "react";
import RenderTag from "./RenderTag";

const RightSidebar = () => {
  const hotQuestions = [
    { _id: 1, title: "Is it only me or the font is bolder than necessary?" },
    {
      _id: 2,
      title:
        "Best practices for data fetching in a Next.js application with Server-Side Rendering (SSR)?",
    },
    { _id: 3, title: "Is it only me or the font is bolder than necessary?" },
    { _id: 4, title: "Async/Await Function Not Handling Errors Properly" },
    { _id: 5, title: "Is it only me or the font is bolder than necessary?" },
  ];

  const popularTags = [
    { _id: 1, name: "JS", totalQuestions: 200 },
    { _id: 2, name: "React", totalQuestions: 350 },
    { _id: 3, name: "Java", totalQuestions: 100 },
    { _id: 4, name: "Ruby", totalQuestions: 50 },
    { _id: 5, name: "C++", totalQuestions: 5 },
  ];

  return (
    <section
      className="background-light900_dark200 light-border sticky right-0 top-0 flex flex-col 
    pt-36 h-screen overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden w-[350px] custom-scrollbar"
    >
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="flex flex-col gap-[30px] mt-7 w-full">
          {hotQuestions.map((question) => (
            <Link
              href={`/questions/${question._id}`}
              key={question._id}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">
                {question.title}
              </p>
              <Image
                src="/assets/icons/chevron-right.svg"
                alt="chevron-right"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="flex mt-7 flex-col gap-4">
          {popularTags.map((tag) => (
            <RenderTag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              totalQuestions={tag.totalQuestions}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
