import { NextResponse } from 'next/server';

import { getAllQuestions } from '@/lib/actions/question.action';
import { getSingleAnswer } from '@/lib/actions/answer.action';
import { connectToDatabse } from '@/lib/mongoose';
import { cosineSimilarity } from '@/lib/utils';

export const POST = async (request: Request) => {
  try {
    const { question, forceNewAnswer, questionId } = await request.json();

    if (questionId) {
      const answer = await getSingleAnswer({ questionId });
      return NextResponse.json({ answer });
    }

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Invalid question format.' }, { status: 400 });
    }

    await connectToDatabse();
    const existingQuestions = await getAllQuestions();

    const threshold = 0.8; // Increased threshold
    const minTokenMatch = 2; // Define minimum token match

    let similarQuestion = null;

    for (const existingQuestion of existingQuestions) {
      const similarity = cosineSimilarity(question, existingQuestion.title);
      
      // Token matching logic
      const questionTokens = question.toLowerCase().split(' ');
      const existingTokens = existingQuestion.title.toLowerCase().split(' ');
      const tokenMatchCount = questionTokens.filter(token => existingTokens.includes(token)).length;

      if (similarity > threshold && tokenMatchCount >= minTokenMatch) {
        similarQuestion = existingQuestion;
        break;
      }
    }

    if (similarQuestion && !forceNewAnswer) {
      return NextResponse.json({
        message: 'A similar question already exists:',
        similarQuestion: {
          id: similarQuestion._id,
          title: similarQuestion.title,
          answer: similarQuestion.answer,
        },
      });
    }

    const openAiPayload = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a highly skilled coding assistant...',
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

// import { getSingleAnswer } from '@/lib/actions/answer.action';
// import { connectToDatabse } from '@/lib/mongoose';
// import { globalSearch } from '@/lib/actions/general.action';

// export const POST = async (request: Request) => {
//   try {
//     const { question, forceNewAnswer, questionId } = await request.json();

//     if (questionId) {
//       const answer = await getSingleAnswer({ questionId });
//       return NextResponse.json({ answer });
//     }

//     if (!question || typeof question !== 'string') {
//       return NextResponse.json({ error: 'Invalid question format.' }, { status: 400 });
//     }

//     await connectToDatabse();

//     // Perform a global search on questions only
//     const searchResults = await globalSearch({ query: question, type: 'question' });
//     const parsedResults = JSON.parse(searchResults);

//     const similarQuestion = parsedResults.length > 0 ? parsedResults[0] : null;

//     if (similarQuestion && !forceNewAnswer) {
//       return NextResponse.json({
//         message: 'A similar question already exists:',
//         similarQuestion: {
//           id: similarQuestion.id,
//           title: similarQuestion.title,
//           answer: similarQuestion.answer,
//         },
//       });
//     }

//     const openAiPayload = {
//       model: 'gpt-3.5-turbo',
//       messages: [
//         {
//           role: 'system',
//           content: 'You are a highly skilled coding assistant...',
//         },
//         {
//           role: 'user',
//           content: `Please help me with this coding question: ${question}`,
//         },
//       ],
//       temperature: 0.6,
//       max_tokens: 700,
//     };

//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify(openAiPayload),
//     });

//     const responseData = await response.json();

//     if (!response.ok) {
//       return NextResponse.json({ error: responseData.error.message }, { status: response.status });
//     }

//     const reply = responseData.choices[0].message.content.trim();

//     return NextResponse.json({ reply });
//   } catch (error: any) {
//     console.error('Error during API request:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// };




// import { NextResponse } from 'next/server';

// import { getAllQuestions } from '@/lib/actions/question.action';
// import { getSingleAnswer } from '@/lib/actions/answer.action';
// import { connectToDatabse } from '@/lib/mongoose';
// import { cosineSimilarity } from '@/lib/utils';


// export const POST = async (request: Request) => {
//   try {
//     const { question, forceNewAnswer, questionId } = await request.json();

//     if (questionId) {
//       // If a questionId is provided, fetch the single answer for it
//       const answer = await getSingleAnswer({ questionId });
//       return NextResponse.json({ answer });
//     }

//     if (!question || typeof question !== 'string') {
//       return NextResponse.json({ error: 'Invalid question format.' }, { status: 400 });
//     }

//     // Connect to the database
//     await connectToDatabse();

//     // Fetch all existing questions
//     const existingQuestions = await getAllQuestions();

//     // Find a similar question
//     const threshold = 0.8; // Define a threshold for similarity (0 to 1)
//     let similarQuestion = null;

//     for (const existingQuestion of existingQuestions) {
//       const similarity = cosineSimilarity(question, existingQuestion.title);

//       if (similarity > threshold) {
//         similarQuestion = existingQuestion;
//         break;
//       }
//     }

//     // If a similar question is found and the user doesn't force a new answer, return the existing answer
//     if (similarQuestion && !forceNewAnswer) {
//       return NextResponse.json({
//         message: 'A similar question already exists:',
//         similarQuestion: {
//           id: similarQuestion._id,
//           title: similarQuestion.title,
//           answer: similarQuestion.answer,
//         },
//       });
//     }

//     // If no similar question is found or if the user wants a new answer, proceed with the OpenAI API request
//     const openAiPayload = {
//       model: 'gpt-3.5-turbo',
//       messages: [
//         {
//           role: 'system',
//           content: 'You are a highly skilled coding assistant. Provide accurate, efficient, and well-explained solutions to coding-related questions. Ensure that your explanations are clear and accessible to both beginners and experienced developers.',
//         },
//         {
//           role: 'user',
//           content: `Please help me with this coding question: ${question}`,
//         },
//       ],
//       temperature: 0.6,
//       frequency_penalty: 0,
//       presence_penalty: 0,
//       max_tokens: 700,
//     };

//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify(openAiPayload),
//     });

//     const responseData = await response.json();

//     if (!response.ok) {
//       return NextResponse.json({ error: responseData.error.message }, { status: response.status });
//     }

//     const reply = responseData.choices[0].message.content.trim();

//     return NextResponse.json({ reply });
//   } catch (error: any) {
//     console.error('Error during API request:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// };




// import { NextResponse } from 'next/server';

// export const POST = async (request: Request) => {
//   try {
//     const { question } = await request.json();

//     if (!question || typeof question !== 'string') {
//       return NextResponse.json({ error: 'Invalid question format.' }, { status: 400 });
//     }

//     const openAiPayload = {
//       model: 'gpt-3.5-turbo',
//       messages: [
//         {
//           role: 'system',
//           content: 'You are a highly skilled coding assistant. Provide accurate, efficient, and well-explained solutions to coding-related questions. Ensure that your explanations are clear and accessible to both beginners and experienced developers.'
//         },
//         {
//           role: 'user',
//           content: `Please help me with this coding question: ${question}`
//         }
//       ],
//       temperature: 0.6,
//       frequency_penalty: 0, 
//       presence_penalty: 0,
//       max_tokens: 700, 
//     };

//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify(openAiPayload),
//     });

//     const responseData = await response.json();

//     if (!response.ok) {
//       return NextResponse.json({ error: responseData.error.message }, { status: response.status });
//     }

//     const reply = responseData.choices[0].message.content.trim();

//     return NextResponse.json({ reply });
//   } catch (error: any) {
//     console.error('Error during API request:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// };

