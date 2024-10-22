import { NextResponse } from 'next/server';
import { globalSearch } from '@/lib/actions/general.action';
import { connectToDatabse } from '@/lib/mongoose';
import { getSingleAnswer } from '@/lib/actions/answer.action';

export const POST = async (request: Request) => {
  try {
    const { question, forceNewAnswer, questionId } = await request.json();

    if (questionId) {
      const answer = await getSingleAnswer({ questionId });
      return NextResponse.json({ answer });
    }

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Invalid question format.' },
        { status: 400 }
      );
    }

    await connectToDatabse();

    // Fetch the global search results, focusing only on questions
    const searchResults = await globalSearch({
      query: question,
      type: 'question',
    });

    const parsedResults = JSON.parse(searchResults).slice(0, 5);

    if (parsedResults.length > 0 && !forceNewAnswer) {
      return NextResponse.json({
        message: 'Similar questions found:',
        similarQuestions: parsedResults.map((result: any) => ({
          id: result.id,
          title: result.title,
        })),
      });
    }

    // Proceed with OpenAI API if no similar question was found
    const openAiPayload = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for a programming forum. When a user enters a programming-related question, your task is to provide an answer along with a certainty level. The certainty level should be based on your confidence in the accuracy of the answer:
          - Certainty Level 3: You are absolutely sure about the answer.
          - Certainty Level 2: You are fairly confident about the answer.
          - Certainty Level 1: You are not confident about the answer.`,
        },
        {
          role: 'user',
          content: `Please help me with this coding question: ${question}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 700,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(openAiPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.error.message },
        { status: response.status }
      );
    }

    const reply = responseData.choices[0].message.content.trim();

    const certaintyMatch = reply.match(/Certainty Level:\s*(\d+)/);
    const answer = reply.replace(/Certainty Level: \d+.*?\n?/, '').trim();

    const certainty_level = certaintyMatch
      ? parseInt(certaintyMatch[1], 10)
      : 3;

    const responseMessage: {
      answer: string;
      suggestion?: string;
      suggestionType?: string;
    } = {
      answer,
    };

    // Add conditional suggestion based on certainty_level
    if (certainty_level === 1) {
      responseMessage.suggestion =
        'The AI is not confident. Please ask your question in specific page for more help.';
      responseMessage.suggestionType = 'button';
    } else if (certainty_level === 2) {
      responseMessage.suggestion =
        'The AI is fairly confident. You may want to ask your question in specific page for more help.';
      responseMessage.suggestionType = 'link';
    } else if (certainty_level === 3) {
      responseMessage.suggestion =
        'The AI is confident about the answer, but you can ask the community for more insights.';
      responseMessage.suggestionType = 'link';
    }

    return NextResponse.json(responseMessage);
  } catch (error: any) {
    console.error('Error during API request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
