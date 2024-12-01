"use client";

import { useState } from "react";

export default function Home() {
  const [showContent, setShowContent] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>("");

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

    if (youtubeRegex.test(url)) {
      setShowContent(true);
      setError(null);
    } else {
      setError("Please enter a valid YouTube URL.");
    }
  };

  const handleReset = () => {
    setShowContent(false);
    setActiveDropdown(null);
    setError(null);
    setUrl("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] max-w-4xl mx-auto">
      <main className="flex flex-col gap-8 items-center text-center">
        <h1 className="text-2xl font-bold">10X Your Reach</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
          <input
            type="text"
            name="youtubeUrl"
            placeholder="YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`w-full p-2 border border-gray-300 rounded text-white ${showContent ? 'bg-gray-700' : 'bg-black'}`}
            disabled={showContent}
          />
          {!showContent && (
            <button
              type="submit"
              className="bg-white text-black px-4 py-2 rounded border border-gray-300 shadow-md transform transition-transform duration-200 hover:scale-105 hover:bg-gray-100 flex items-center"
            >
              Repurpose My Content
            </button>
          )}
        </form>

        {error && <div className="text-red-500 mt-2">{error}</div>}

        {showContent && (
          <div className="flex flex-col gap-4 mt-4">
            {["Twitter Thread", "Newsletter (e.g. Beehiiv, Kit, ActiveCampaign)", "Blog Post (e.g. Substack, Medium)", "LinkedIn Post", "Short Form (e.g. YT/IG/TikTok)"].map((content, index) => (
              <div key={index}>
                <button
                  onClick={() => toggleDropdown(content)}
                  className="bg-white text-black px-4 py-2 rounded w-full flex justify-between items-center border border-gray-300 shadow-md transform transition-transform duration-200 hover:scale-105 hover:bg-gray-100"
                >
                  Generated {content}
                  <span className="ml-2">{activeDropdown === content ? "▼" : "➔"}</span>
                </button>
                {activeDropdown === content && (
                  <div className="p-4 border border-gray-300 rounded mt-2">
                    {content} Content
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={handleReset}
              className="bg-white text-black px-4 py-2 rounded border border-gray-300 shadow-md transform transition-transform duration-200 hover:scale-105 hover:bg-gray-100 flex items-center mt-4"
            >
              <span className="mr-2">←</span> Repurpose Another Video
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
