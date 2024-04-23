import Image from "next/image";
import Link from "next/link";
import React from "react";
import RenderTag from "./RenderTag";
import { getHotQuestion } from "@/lib/actions/question.action";
import { getTopPopularTags } from "@/lib/actions/tag.action";

const RightSidebar = async () => {
  const hotQuestions = await getHotQuestion();
  const popularTags = await getTopPopularTags();
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
              href={`/question/${question._id}`}
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
              totalQuestions={tag.numberOfQuestions}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
