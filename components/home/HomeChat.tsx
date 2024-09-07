'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Input } from '../ui/input';
import ReactHtmlParser from 'html-react-parser';
import { useUser } from '@clerk/nextjs';
import { toast } from '../ui/use-toast';
import { CiWarning } from 'react-icons/ci';
import { MdErrorOutline } from 'react-icons/md';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const HomeChat = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestionType, setSuggestionType] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [similarQuestions, setSimilarQuestions] = useState<null | Array<{
    id: string;
    title: string;
  }>>(null);

  const { user } = useUser();
  const router = useRouter();

  //   Load history from localStorage
  useEffect(() => {
    if (user) {
      const storedHistory = localStorage.getItem('chatHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    }
  }, [user]);

  // Clear localStorage on logout
  useEffect(() => {
    if (!user) {
      localStorage.removeItem('chatHistory');
    }
  }, [user]);

  const handleSubmit = async (forceNewAnswer = false) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/askQuestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, forceNewAnswer }),
      });

      const data = await response.json();

      if (data.similarQuestions && !forceNewAnswer) {
        // Set the similar questions state
        setSimilarQuestions(data.similarQuestions);
      } else {
        setAnswer(data.answer);
        setSuggestion(data.suggestion || null);
        setSuggestionType(data.suggestionType || null);

        const temp = [...history, data.answer];
        setHistory(temp);
        setQuestion('');
        setSimilarQuestions(null);
        localStorage.setItem('chatHistory', JSON.stringify(temp));
      }
    } catch (error) {
      console.error('Error fetching AI answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSimilar = async (id: string) => {
    try {
      const response = await fetch('/api/askQuestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId: id }),
      });

      const data = await response.json();

      if (data.answer && data.answer.content) {
        setAnswer(data.answer.content);
        const temp = [...history, data.answer.content];
        setHistory(temp);
        setSimilarQuestions(null);
        setQuestion('');
        localStorage.setItem('chatHistory', JSON.stringify(temp));
      } else {
        return toast({
          variant: 'destructive',
          title: 'No Answer',
          description: 'No answer found for the selected question.',
        });
      }
    } catch (error) {
      console.error('Error fetching the existing answer:', error);
      return toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while fetching the answer.',
      });
    }
  };

  const handleAskAnyway = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(true);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen">
      {similarQuestions && similarQuestions.length > 0 && (
        <div className="w-full p-6 card-wrapper rounded mb-4 flex-col items-start justify-center gap-8">
          <h2 className="sm:h3-semibold base-semibold text-center text-dark200_light900 mb-2">
            Similar Questions Found in System:
          </h2>
          <ul className="list-disc mt-8">
            {similarQuestions.map((q) => (
              <li key={q.id} className="mt-4">
                <p className="text-dark200_light900 mt-1">
                  <span className="text-dark100_light900 font-bold">
                    Question Title: {''}
                  </span>
                  {q.title}
                </p>
                <Button
                  className="w-fit primary-gradient text-light-900 mt-2"
                  onClick={() => handleAcceptSimilar(q.id)}
                >
                  View Answer
                </Button>
              </li>
            ))}
          </ul>
          <Button
            className="text-primary-500 mt-8 dark:border-primary-100 border-primary-500"
            variant="outline"
            onClick={handleAskAnyway}
          >
            Ask AI Anyway
          </Button>
        </div>
      )}
      <div className="w-full flex flex-col gap-4 mb-auto overflow-y-auto">
        {history.map((ans, idx) => (
          <div key={idx} className="p-4 card-wrapper rounded mb-2">
            <h2 className="sm:h3-semibold base-semibold text-dark200_light900 mb-2">
              Answer:
            </h2>
            <div className="text-dark200_light900 whitespace-pre-wrap">
              {typeof ans === 'string'
                ? ReactHtmlParser(ans)
                : 'Invalid answer format'}
            </div>
            {suggestion && suggestionType === 'button' && (
              <div className="flex items-center justify-start gap-2 mt-8">
                <MdErrorOutline size={20} className="dark:text-red-500" />
                <Button
                  className="text-primary-500 mt-8 dark:border-primary-100 border-primary-500"
                  variant="outline"
                  onClick={() => router.push('/ask-question')}
                >
                  Ask the community
                </Button>
              </div>
            )}
            {suggestion && suggestionType === 'link' && (
              <div className="flex items-center justify-start gap-2 mt-8">
                <CiWarning size={20} className="dark:text-primary-500" />
                <span className="text-dark200_light900"> {suggestion}</span>
                <Link
                  href="/ask-question"
                  className="text-primary-500 underline"
                >
                  Ask Here
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="relative flex items-center w-full">
          <Input
            type="text"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            id="question"
            className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 border min-h-[56px]"
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white rounded-full p-2 cursor-pointer"
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <Image
                src="/assets/icons/star.svg"
                width={25}
                height={25}
                alt="generate"
                className="cursor-pointer"
              />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default HomeChat;
