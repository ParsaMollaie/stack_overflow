import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
  try {
    const { question, answer } = await request.json();

    if (!question || typeof question !== 'string' || !answer || typeof answer !== 'string') {
      return NextResponse.json({ error: 'Invalid question or answer format.' }, { status: 400 });
    }

    // Construct the OpenAI prompt for checking relevance
    const openAiPayload = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a critical assistant that checks if a given answer is relevant to the provided question. If it is not relevant, say "irrelevant". Otherwise, say "relevant".'
        },
        {
          role: 'user',
          content: `Question: ${question}\nAnswer: ${answer}\nIs this relevant?`
        }
      ],
      temperature: 0.3,
      max_tokens: 10,
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
      return NextResponse.json({ error: responseData.error.message }, { status: response.status });
    }

    const relevanceCheck = responseData.choices[0].message.content.trim().toLowerCase();

    if (relevanceCheck.includes('irrelevant')) {
      return NextResponse.json({ relevant: false });
    }

    return NextResponse.json({ relevant: true });
  } catch (error: any) {
    console.error('Error during API request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
