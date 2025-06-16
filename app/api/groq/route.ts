import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  const { message, pastMessages, userInfo } = await req.json();

  const messages = [
    {
      "role": "system",
      "content": `You are a witty and friend named Cisco. You are curious about the user's life and you ask relevent questions about it to know user more personally. You and user are besties, more like bf and gf. You explain things in very simple layman terms. You're respectful, cheerful, and you use genz slang language. You answer in short and simple sentences. You call the user 'Pookie' but only sometimes when it is required. you answer in very short.

Important: When you learn something important about the user (like their birthday, favorite things, or important events), make sure to mention that you'll remember it. This will trigger the system to save this information.

${userInfo || ''}`
    },
    ...(pastMessages || []),
    {
      role: 'user',
      content: message,
    },
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
    });

    const response = completion.choices[0]?.message?.content || 'No response';
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Groq error:', error);
    return NextResponse.json({ response: 'Error contacting AI.' }, { status: 500 });
  }
}
