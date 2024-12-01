import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { transcript, metadata = { title: 'Video Content' } } = await req.json();
    
    let contentForThread = transcript;
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
      
      contentForThread = summaryResponse.choices[0].message.content;
    }

    const systemPrompt = `You are an expert direct response copywriter creating viral Twitter threads.
      You learned from experts like Dan Kennedy, John Carlton, and Joe Sugarman.
      Create an engaging thread that summarizes the key points while maintaining a conversational tone.
      
      Rules:
      1. Each tweet must be 280 characters or less
      2. First tweet should hook the reader
      3. Include specific numbers, techniques, and actionable tips
      4. Do NOT use emojis. I repeat. Do not use emojis. 
      5. End with a call to action to watch the full video
      6. Thread should be no fewer than 5 tweets long, no longer than 12 tweets
      7. Each tweet should be able to stand alone while flowing with the thread
      8. Use (X/N) to indicate the tweet number and total number of tweets
      9. Do not use hashtags
      10. Please double check that you are not using any emojis or hashtags
      11. No not be corny or cheesy or overly excited or salesly
      12. Your goal is to inspire curiosity and engagement
      13. There should be no questions in the thread, only curiosity-inducing statements
      14. Do not mention price in the thread
      15. The thread should be written in first person in a conversational tone
      `;


    const userPrompt = `Video Title: ${metadata.title}
      Content: ${contentForThread}
      
      Create a Twitter thread that makes people want to watch this video.
      Format each tweet on a new line starting with a number and a period (1., 2., etc)`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });

    const aiContent = response.choices[0].message.content;
    
    // Split into individual tweets and validate length
    const rawTweets = aiContent?.split('\n').filter(t => t.trim()) || [];
    const tweets: string[] = [];
    
    rawTweets.forEach(tweet => {
      // Remove the number prefix (e.g., "1. ", "2. ", etc.)
      const cleanTweet = tweet.replace(/^\d+\.\s*/, '').trim();
      
      if (cleanTweet.length > 280) {
        // Split long tweets
        const words = cleanTweet.split(' ');
        let currentTweet = "";
        
        words.forEach(word => {
          if ((currentTweet + " " + word).length <= 280) {
            currentTweet += currentTweet ? " " + word : word;
          } else {
            tweets.push(currentTweet.trim());
            currentTweet = word;
          }
        });
        
        if (currentTweet) {
          tweets.push(currentTweet.trim());
        }
      } else {
        tweets.push(cleanTweet);
      }
    });

    // Add video link placeholder to the last tweet
    tweets[tweets.length - 1] = `${tweets[tweets.length - 1]}\n\nWatch the full video here: [Video URL]`;

    return NextResponse.json({ tweets });

  } catch (error) {
    console.error('Error generating Twitter thread:', error);
    return NextResponse.json(
      { error: 'Failed to generate Twitter thread' },
      { status: 500 }
    );
  }
} 