import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { transcript, metadata } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const prompt = `
      Based on the following transcript, create an engaging blog post.
      Make it informative, well-structured, and engaging.
      Include a catchy title and format the content with proper paragraphs.

      Rules:
      1. Write in first person and remember that you are the author of the video AND post
      2. Do not mention price
      3. No questions - use curiosity-inducing statements instead
      4. Make it SEO-friendly (use h1-h2-h3 headers appropriately)
      5. If you use an h3 under a h2, make sure there are at least 2 h3s under that h2
      6. instead of <h> tags, use # for h1, ## for h2, and ### for h3
      
      Transcript:
      ${transcript}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional blog writer who creates engaging, well-structured content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const generatedContent = completion.choices[0].message.content || '';
    const [title, ...contentParts] = generatedContent.split('\n\n');

    return NextResponse.json({
      title: title.replace('Title: ', ''),
      content: contentParts.join('\n\n')
    });

  } catch (error) {
    console.error('Blog generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog post' },
      { status: 500 }
    );
  }
} 