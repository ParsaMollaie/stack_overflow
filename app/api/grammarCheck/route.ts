import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
  try {
    const { title, explanation } = await request.json();

    if (!title || !explanation || typeof title !== 'string' || typeof explanation !== 'string') {
      return NextResponse.json({ error: 'Invalid input format.' }, { status: 400 });
    }

    // OpenAI payload for grammar correction
    const openAiPayload = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a grammar assistant. Correct any grammar, spelling, or punctuation mistakes.',
        },
        {
          role: 'user',
          content: `Title: ${title}\nContent: ${explanation}`,
        },
      ],
      temperature: 0.0,
      max_tokens: 500,
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

    const correctedText = responseData.choices[0].message.content.trim();
    
    // Respond with the corrected text and the original text
    return NextResponse.json({
      original: { title, explanation },
      corrected: correctedText
    });
  } catch (error: any) {
    console.error('Error during API request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
