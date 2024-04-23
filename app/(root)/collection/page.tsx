import QuestionCard from '@/components/cards/QuestionCard';
import Filter from '@/components/shared/Filter';
import NoResult from '@/components/shared/NoResult';
import Pagination from '@/components/shared/Pagination';
import LocalSeachbar from '@/components/shared/search/LocalSeachbar';
import { QuestionFilters } from '@/constants/filters';
import { IQuestion } from '@/database/question.model';
import { getSavedQuestion } from '@/lib/actions/user.action';
import { SearchParamsProps } from '@/types';
import { auth } from '@clerk/nextjs';

export default async function Page({ searchParams }: SearchParamsProps) {
  const { userId } = auth();
  if (!userId) return null;

  const result = await getSavedQuestion({
    clerkId: userId,
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  });
  console.log(result);

  return (
    <>
      <h2 className="h1-bold text-dark100_light900">Saved Questions</h2>

      <div className="flex mt-11 justify-between gap-5 sm:items-center max-sm:flex-col">
        <LocalSeachbar
          route="/collection"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={QuestionFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {result.questions.length > 0 ? (
          result.questions.map((question: IQuestion) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There's no saved question to show!"
            description="You can save your favorite questions"
            link="/"
            linkTitle="Home"
          />
        )}
      </div>
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams?.page ? +searchParams.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  );
}
