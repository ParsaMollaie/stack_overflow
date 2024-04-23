import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section>
      <h2 className="h1-bold text-dark100_light900">All Users</h2>
      <div className="mb-12 mt-11 flex-wrap flex gap-5">
        <Skeleton className="h-14 flex-1 bg-gray-400" />
        <Skeleton className="h-14 w-28 bg-gray-400" />
      </div>
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <Skeleton
            key={item}
            className="h-60 w-full rounded-2xl sm:w-[260px] bg-gray-400"
          />
        ))}
      </div>
    </section>
  );
};

export default Loading;
