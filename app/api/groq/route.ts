import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { message } = await req.json();

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const response = completion.choices[0]?.message?.content || '...';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ response: 'Error contacting Cisco AI.' }, { status: 500 });
  }
}
