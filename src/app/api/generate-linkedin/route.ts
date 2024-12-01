import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { transcript, metadata = { title: 'Video Content' } } = await req.json();
    
    let contentForPost = transcript;
    if (transcript.length > 6000) {
      const summaryPrompt = `Extract the main points, strategies, and actionable advice from this transcript. 
        Focus on specific techniques, numbers, and strategies mentioned.`;
      
      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
          { role: "user", content: `${summaryPrompt}\n\nTranscript: ${transcript}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });
      
      contentForPost = summaryResponse.choices[0].message.content;
    }

    const systemPrompt = `You are an expert content creator writing viral LinkedIn posts.
      Create an engaging post that summarizes the key points while maintaining a professional yet conversational tone.
      
      Rules:
      1. Post must be under 3000 characters
      2. First paragraph should hook the reader
      3. Include specific numbers, techniques, and actionable tips
      4. Break up text into short, scannable paragraphs
      5. End with a call to action to watch the full video
      6. Do not use hashtags
      7. No clickbait or overly salesy language
      8. Focus on providing value and insights
      9. Use line breaks strategically for readability
      10. Write in first person and remember that you are the author of the video AND post
      11. Do not mention price
      12. No questions - use curiosity-inducing statements instead`;

    const userPrompt = `Video Title: ${metadata.title}
      Content: ${contentForPost}
      
      Create a LinkedIn post that makes people want to watch this video.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });

    const post = response.choices[0].message.content || '';

    // Validate length and truncate if needed
    const truncatedPost = post.length > 3000 ? post.slice(0, 2997) + '...' : post;

    // Add video link placeholder
    const postWithLink = `${truncatedPost}\n\nWatch the full video here: [Video URL]`;

    return NextResponse.json({ post: postWithLink });

  } catch (error) {
    console.error('Error generating LinkedIn post:', error);
    return NextResponse.json(
      { error: 'Failed to generate LinkedIn post' },
      { status: 500 }
    );
  }
} 