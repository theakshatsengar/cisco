import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  const { message, pastMessages } = await req.json();

  const messages = [
    {
      role: 'system',
      content: `You are Cisco, a helpful assistant created for Akshat Sengar, a frontend and full-stack developer based in Haridwar. He is currently studying Electronics and Communication Engineering (B.Tech, 2021–2025) and has worked with technologies like ReactJS, NodeJS, Firebase, SQL, Tailwind CSS, Docker, Flask, and LLaMA LLM. Keep your responses smart, relevant, and helpful. Keep context across the conversation.`,
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
