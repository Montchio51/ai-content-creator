const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

/**
 * AI Content Generator Backend
 * Features:
 * - Generates LinkedIn posts using GPT-3.5 Turbo
 * - Creates DALL-E images
 * - REST API endpoint: /generate (POST)
 */

const app = express();

// Middleware Configuration
app.use(cors({
  origin: "http://localhost:5173" // Explicitly allow Vite frontend
}));
app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log("Request Body:", req.body);
  next();
});

/**
 * POST /generate
 * Generates LinkedIn content and image
 * Request Body: { prompt: string }
 * Response: { text: string, image: string }
 */
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      console.error("Missing prompt in request");
      return res.status(400).json({ 
        error: "Prompt is required",
        details: "Please provide a 'prompt' in the request body"
      });
    }

    console.log("Generating content for prompt:", prompt);

    // 1. Generate LinkedIn post text
    const textResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a professional LinkedIn content creator." 
          },
          { 
            role: "user", 
            content: `Create a detailed LinkedIn post about: ${prompt}` 
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // 2. Generate matching image
    const imageResponse = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        prompt: `Professional LinkedIn image for: ${prompt}`,
        n: 1,
        size: "512x512",
        response_format: "url"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Successfully generated content");
    
    res.json({
      text: textResponse.data.choices[0].message.content,
      image: imageResponse.data.data[0].url
    });

  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Content generation failed",
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Server Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Endpoint: POST http://localhost:${PORT}/generate`);
});