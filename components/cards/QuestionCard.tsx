import Link from "next/link";
import RenderTag from "../shared/RenderTag";
import Metric from "../shared/Metric";
import { formatAndDivideNumber } from "@/lib/utils";

interface QuestionProps {
  _id: number;
  title: string;
  tags: {
    _id: number;
    name: string;
  }[];
  author: {
    _id: number;
    name: string;
    picture: string;
  };
  upvotes: number;
  views: number;
  answer: Array<Object>;
  createdAt: Date;
}

const QuestionCard = ({
  _id,
  title,
  tags,
  author,
  upvotes,
  views,
  answer,
  createdAt,
}: QuestionProps) => {
  const dayjs = require("dayjs");
  var relativeTime = require("dayjs/plugin/relativeTime");
  dayjs.extend(relativeTime);
  return (
    <div className="card-wrapper p-9 sm:p-11 rounded-[10px]">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="sm:hidden flex subtle-regular text-dark400_light700 line-clamp-1">
            {dayjs(createdAt).fromNow()}
          </span>
          <Link href={`/question/${_id}`}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
              {title}
            </h3>
          </Link>
        </div>

        {/* if SigneIn add edit and delete action */}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
        ))}
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author.picture}
          alt="user"
          value={author.name}
          title={`-asked ${dayjs(createdAt).fromNow()}`}
          href={`/profile/${author._id}`}
          isAuthor
          textStyle="body-medium text-dark400_light700"
        />
        <Metric
          imgUrl="/assets/icons/like.svg"
          alt="upvotes"
          value={formatAndDivideNumber(upvotes)}
          title=" Votes"
          textStyle="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/message.svg"
          alt="message"
          value={formatAndDivideNumber(answer ? answer.length : 0)}
          title=" Answer"
          textStyle="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/eye.svg"
          alt="eye"
          value={formatAndDivideNumber(views)}
          title=" Views"
          textStyle="small-medium text-dark400_light800"
        />
      </div>
    </div>
  );
};

export default QuestionCard;
