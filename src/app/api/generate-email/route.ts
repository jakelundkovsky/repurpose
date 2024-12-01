import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { transcript, metadata = { title: 'Video Content' } } = await req.json();
    
    let contentForEmail = transcript;
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
      
      contentForEmail = summaryResponse.choices[0].message.content;
    }

    const systemPrompt = `You are an expert direct response copywriter specializing in video content promotion.
      Your task is to create a compelling email newsletter that makes people want to watch the video.
      
      Required format:
      1. SUMMARY: Write 2-3 sentences that create curiosity and highlight the value of the video
      2. BULLETS: Create exactly 3 benefit-driven bullet points that tease the content`;

    const userPrompt = `Video Title: ${metadata.title}
      Content: ${contentForEmail}
      
      Create an email that makes people desperate to watch this video.
      Remember to follow the exact format:
      SUMMARY: (your summary)
      BULLETS:
      • (bullet 1)
      • (bullet 2)
      etc.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });

    const aiContent = response.choices[0].message.content;
    
    // Extract summary and bullets using regex
    const summaryMatch = aiContent?.match(/SUMMARY:\s*(.*?)(?=BULLETS:|$)/s);
    const bulletsMatch = aiContent?.match(/BULLETS:\s*((?:•.*(?:\n|$))*)/s);
    
    if (!summaryMatch || !bulletsMatch) {
      throw new Error("Failed to parse AI response sections");
    }
    
    const summary = summaryMatch[1].trim();
    const bulletsText = bulletsMatch[1].trim();
    const bullets = bulletsText.split('\n')
      .filter(b => b.trim() && b.trim().startsWith('•'))
      .map(b => b.trim());
    
    if (!bullets || bullets.length < 3) {
      throw new Error(`Not enough bullet points generated: ${bullets?.length || 0}`);
    }

    const subjectLine = `🎥 New Video: ${metadata.title}`;
    
    const emailBody = `Hey there!

${summary}

In this comprehensive guide, you'll discover:

${bullets.join('\n\n')}

Don't miss out on these game-changing strategies. Watch the full video here:
👉 [Video URL]

Looking forward to hearing about your results!

Best regards,
[Your Name]

P.S. The section about ${bullets[0].split('•')[1].trim().toLowerCase().replace("you'll discover ", "").replace("you'll learn ", "")} alone is worth watching the entire video.`;

    return NextResponse.json({
      subject: subjectLine,
      body: emailBody
    });

  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email newsletter' },
      { status: 500 }
    );
  }
} 