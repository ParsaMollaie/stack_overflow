import HomeChat from '@/components/home/HomeChat';
import { getAllQuestions } from '@/lib/actions/question.action';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
};

export default async function Home() {
  // const res = await getAllQuestions();
  // console.log(res);
  return (
    <>
      <HomeChat />
    </>
  );
}
