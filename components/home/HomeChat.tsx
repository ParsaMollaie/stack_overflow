'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Input } from '../ui/input';
import ReactHtmlParser from 'html-react-parser';
import { useUser } from '@clerk/nextjs';

const HomeChat = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [similarQuestion, setSimilarQuestion] = useState<null | {
    id: string;
    title: string;
    answer: string;
  }>(null);

  const { user } = useUser();

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

      if (data.similarQuestion && !forceNewAnswer) {
        // Set the similar question state
        setSimilarQuestion(data.similarQuestion);
      } else {
        // Set the answer and update the history
        setAnswer(data.reply);
        const temp = [...history, data.reply];
        setHistory(temp);
        setQuestion('');
        setSimilarQuestion(null); // Clear similar question if any
        localStorage.setItem('chatHistory', JSON.stringify(temp));
      }
    } catch (error) {
      console.error('Error fetching AI answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSimilar = async () => {
    if (similarQuestion) {
      try {
        const response = await fetch('/api/askQuestion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ questionId: similarQuestion.id }),
        });

        const data = await response.json();

        if (data.answer) {
          setAnswer(data.answer.content);
          const temp = [...history, data.answer.content];
          setHistory(temp);
          setSimilarQuestion(null);
          setQuestion('');
          localStorage.setItem('chatHistory', JSON.stringify(temp));
        }
      } catch (error) {
        console.error('Error fetching the existing answer:', error);
      }
    }
  };

  const handleAskAnyway = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(true);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen">
      {similarQuestion && (
        <div className="w-full p-6 card-wrapper rounded mb-4 flex-col items-start justify-center gap-8">
          <h2 className="sm:h3-semibold base-semibold text-center text-dark200_light900 mb-2">
            Similar Question Found in System:
          </h2>
          <p className="text-dark200_light900 mt-6">
            <span className="text-dark100_light900 font-bold">
              Question Title:
            </span>{' '}
            {similarQuestion.title}
          </p>
          <div className="flex gap-4 mt-8">
            <Button
              className="w-fit primary-gradient text-light-900"
              onClick={handleAcceptSimilar}
            >
              View Answer
            </Button>
            <Button className="text-primary-500" onClick={handleAskAnyway}>
              Ask AI
            </Button>
          </div>
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
