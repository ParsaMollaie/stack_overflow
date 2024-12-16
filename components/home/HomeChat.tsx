'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useUser } from '@clerk/nextjs';
import { toast } from '../ui/use-toast';
import { CiWarning } from 'react-icons/ci';
import { MdErrorOutline } from 'react-icons/md';
import { GiArtificialIntelligence } from 'react-icons/gi';
import { AiOutlineWechat } from 'react-icons/ai';
import clsx from 'clsx';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StartChat from '../shared/StartChat';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Chat = {
  answer: string;
  suggestion: string;
  suggestionType: string;
};

const HomeChat = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Chat[]>([]);
  const [similarQuestions, setSimilarQuestions] = useState<null | Array<{
    id: string;
    title: string;
  }>>(null);
  const [clearingHistory, setClearingHistory] = useState(false);

  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  //   Load history from localStorage
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const storedHistory = localStorage.getItem('chatHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    }
  }, [isSignedIn, isLoaded]);

  // Clear localStorage on logout
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      localStorage.removeItem('chatHistory');
    }
  }, [isSignedIn, isLoaded]);

  const handleNewChat = () => {
    if (history.length > 0) {
      setClearingHistory(true);

      setTimeout(() => {
        setHistory([]);
        localStorage.removeItem('chatHistory');
        setClearingHistory(false);
        toast({
          title: 'Chat reset',
          description: 'Previous chat history cleared.',
        });
      }, 500);
    }
  };
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
        const sample = {
          answer: data.answer,
          suggestion: data.suggestion,
          suggestionType: data.suggestionType,
        };
        const temp = [...history, sample];
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
        const temp = [
          ...history,
          { answer: data.answer.content, suggestion: '', suggestionType: '' },
        ];
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
    <div className="flex flex-col items-center justify-between min-h-[83dvh]">
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
        {history.length === 0 ? (
          <StartChat
            title="Ask your programming related questions"
            description="Get answers with AI assistance!"
          />
        ) : (
          history.map((chat, idx) => (
            <div key={idx} className="p-4 card-wrapper rounded mb-2">
              <h2 className="sm:h3-semibold base-semibold text-dark200_light900 mb-2">
                Answer:
              </h2>
              <div className="text-dark200_light900 whitespace-pre-wrap max-w-[78vw] overflow-x-auto">
                {typeof chat.answer === 'string' ? (
                  chat.answer.includes('```') ? (
                    chat.answer.split(/```/g).map((block, index) => {
                      if (block.match(/^[a-zA-Z#]+\n/)) {
                        // Extract language and code
                        const [lang, ...code] = block.split('\n');
                        return (
                          <SyntaxHighlighter
                            key={index}
                            language={lang.trim()}
                            style={tomorrow}
                            showLineNumbers
                          >
                            {code.join('\n')}
                          </SyntaxHighlighter>
                        );
                      } else if (index % 2 === 1) {
                        return (
                          <SyntaxHighlighter
                            key={index}
                            language="plaintext"
                            style={tomorrow}
                            showLineNumbers
                          >
                            {block}
                          </SyntaxHighlighter>
                        );
                      }
                      // Non-code text
                      return <p key={index}>{block}</p>;
                    })
                  ) : (
                    <p>{chat.answer}</p>
                  )
                ) : (
                  'Invalid answer format'
                )}
              </div>

              {chat.suggestionType === 'button' && (
                <div className="flex flex-col md:flex-row items-center md:items-start justify-start gap-2 mt-8">
                  <MdErrorOutline
                    size={20}
                    className="dark:text-red-500 max-md:hidden"
                  />
                  <Button
                    className="text-primary-500 mt-8 dark:border-primary-100 border-primary-500"
                    variant="outline"
                    onClick={() => router.push('/ask-question')}
                  >
                    Ask the community
                  </Button>
                </div>
              )}
              {chat.suggestionType === 'link' && (
                <div className="flex flex-col md:flex-row items-center md:items-start justify-start gap-2 mt-8">
                  {chat.suggestion.includes('fairly confident') ? (
                    <CiWarning
                      size={20}
                      className="dark:text-yellow-500 max-md:hidden"
                      title="Certainty Level 2"
                    />
                  ) : (
                    <GiArtificialIntelligence
                      size={20}
                      className="dark:text-green-500 max-md:hidden"
                      title="Certainty Level 3"
                    />
                  )}
                  <span className="text-dark200_light900">
                    {chat.suggestion}
                  </span>
                  <Link
                    href="/ask-question"
                    className="text-primary-500 underline"
                  >
                    Ask Here
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <form
        className="w-full flex flex-row items-center gap-3"
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
              <GiArtificialIntelligence
                size={25}
                className="cursor-pointer"
                title="Start Chat"
              />
            )}
          </Button>
        </div>
        <div className="p-2 md:p-3 rounded-full bg-primary-500">
          <AiOutlineWechat
            size={25}
            className={clsx(
              'cursor-pointer',
              history.length === 0
                ? 'text-gray-200 cursor-not-allowed opacity-50'
                : 'text-white'
            )}
            onClick={() => {
              if (history.length > 0) {
                handleNewChat();
              }
            }}
            title="New Chat"
          />
        </div>
      </form>
    </div>
  );
};
export default HomeChat;
