import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Invalid question format.' }, { status: 400 });
    }

    const openAiPayload = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an insightful and articulate assistant. Provide clear, thorough, and contextually relevant information to help the user with their inquiry.'
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7, 
      frequency_penalty: 0, 
      presence_penalty: 0, 
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

    const reply = responseData.choices[0].message.content.trim();

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Error during API request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};


// import { NextResponse } from 'next/server';

// export const POST = async (request: Request) => {
//   const { question } = await request.json();

//   try {
//     const response = await fetch(
//       'https://api.openai.com/v1/chat/completions',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
//         },
//         body: JSON.stringify({
//           model: 'gpt-3.5-turbo',
//           messages: [
//             {
//               role: 'system',
//               content:
//                 'You are a knowlegeable assistant that provides quality information.'
//             },
//             {
//               role: 'user',
//               content: `Tell me ${question}`
//             }
//           ]
//         })
//       }
//     );

//     const responseData = await response.json();
//     console.log(responseData);

//     const reply = responseData.choices[0].message.content;

//     return NextResponse.json({ reply });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message });
//   }
// };