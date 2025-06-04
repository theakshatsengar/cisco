import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const history = [
    {
      role: 'system',
      content: `You are Cisco, a helpful assistant for Akshat Sengar, a full-stack developer familiar with React, Node, Firebase, Docker, and more. Be helpful, contextual, and concise.`,
    },
    ...messages.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages: history,
      model: 'llama-3.3-70b-versatile',
    });

    const response = completion.choices[0]?.message?.content || 'No reply.';
    return NextResponse.json({ response });
  } catch (err) {
    console.error('Groq error:', err);
    return NextResponse.json({ response: 'LLM error occurred' }, { status: 500 });
  }
}
