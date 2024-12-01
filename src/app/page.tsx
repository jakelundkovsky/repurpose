"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [showContent, setShowContent] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setToast({ message: "Successfully copied to your clipboard", type: "success" });
      })
      .catch(() => {
        setToast({ message: "Failed to copy to clipboard", type: "error" });
      });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
                  <div className="p-4 border border-gray-300 rounded mt-2 flex justify-between items-center">
                    <span>{content} Content</span>
                    <button
                      onClick={() => handleCopy(`${content} Content`)}
                      className="ml-4 bg-blue-500 p-2 rounded hover:bg-blue-600 text-white"
                    >
                      📋 Copy
                    </button>
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

        {toast && (
          <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-md ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-4 text-white p-1 rounded bg-transparent">✖</button>
          </div>
        )}
      </main>
    </div>
  );
}
