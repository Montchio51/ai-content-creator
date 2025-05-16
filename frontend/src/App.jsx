import React, { useState } from "react";
import axios from "axios";
import "./App.css";

/**
 * AI Content Generator Frontend
 * Features:
 * - Form for entering content prompts
 * - Displays generated LinkedIn post and image
 * - Responsive design with loading states
 */
function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Handles content generation
   * - Validates input
   * - Calls backend API
   * - Manages loading states
   */
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a topic");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse("");
    setImage("");
    
    try {
      const { data } = await axios.post("http://localhost:5000/generate", { 
        prompt 
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      setResponse(data.text);
      setImage(data.image);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.error || "Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Content Generator</h1>
        <p>Create professional LinkedIn posts with AI</p>
      </header>

      <main>
        <section className="input-section">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your topic (e.g., Teamwork, AI Trends...)"
            disabled={isLoading}
          />
          
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate Content"}
          </button>

          {error && <p className="error">{error}</p>}
        </section>

        {response && (
          <section className="results">
            <div className="post-result">
              <h2>Generated Post</h2>
              <p>{response}</p>
            </div>
            
            {image && (
              <div className="image-result">
                <h2>Generated Image</h2>
                <img src={image} alt="AI generated content" />
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;