import { GoogleGenAI } from "@google/genai";

declare const process: {
  env: {
    API_KEY: string;
  }
};

// Vercel/Vite uses import.meta.env for environment variables, 
// but Google GenAI guidelines require process.env.API_KEY.
// We assume the bundler replaces process.env.API_KEY with the actual key.
const API_KEY = process.env.API_KEY || '';

export const resizeImage = async (base64Str: string, maxWidth: number = 300, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      // Only resize if the image is actually larger than maxWidth
      if (width > maxWidth) {
        const scale = maxWidth / width;
        width = maxWidth;
        height = height * scale;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Fill background white just in case of transparency (Canvas converts transparent to black for JPEGs otherwise)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Return compressed jpeg
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = (e) => reject(e);
  });
};

export const generateHeadshot = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  try {
    if (!API_KEY) throw new Error("API Key is missing. Please check your Vercel settings.");
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // OPTIMIZATION: Resize image before sending to API.
    // Extremely large base64 strings (from 4k images) often cause the API to timeout or return empty responses.
    // 1536px is sufficient resolution for the model to reference identity.
    const optimizedImage = await resizeImage(imageBase64, 1536, 0.95);
    
    // Extract mime type and clean base64
    let mimeType = 'image/jpeg';
    let cleanBase64 = optimizedImage;
    
    // Regex to capture mime type and the data
    const match = optimizedImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      cleanBase64 = match[2];
    } else {
      cleanBase64 = optimizedImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // "nano banana" model
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `Generate a high-quality photorealistic portrait based on this image. ${prompt} Keep the person's identity recognizable but upgrade the style. Return ONLY the image.`,
          },
        ],
      },
      config: {
        // Adjust safety settings to prevent over-filtering of styles like "Erotic" or "Sexy"
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }

      // If no image found, check if there is a text refusal
      for (const part of parts) {
        if (part.text) {
          console.warn("Gemini returned text instead of image:", part.text);
          throw new Error(part.text);
        }
      }
    }

    throw new Error('No image generated in response. The model may have blocked the request.');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

export const generateVeoPrompt = async (
  imageBase64: string,
  motionInstruction: string
): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Extract mime type and clean base64
  let mimeType = 'image/jpeg';
  let cleanBase64 = imageBase64;
  const match = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    cleanBase64 = match[2];
  } else {
    cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: `You are an expert video prompt engineer for Google Veo. 
          Analyze this image and write a highly detailed text prompt that describes the subject, clothing, lighting, and background. 
          Then, seamlessly integrate the following motion instruction: "${motionInstruction}".
          The prompt must be cinematic, descriptive, and ready to use in a video generation model.
          Output ONLY the prompt text.`,
        },
      ],
    },
  });

  return response.text || "Failed to generate prompt.";
};

export const generateHeadshotVideo = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  try {
    if (!API_KEY) throw new Error("API Key is missing.");
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Extract mime type and clean base64
    let mimeType = 'image/jpeg';
    let cleanBase64 = imageBase64;
    const match = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      cleanBase64 = match[2];
    } else {
      cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    }

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: cleanBase64,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16' // Portrait aspect ratio typical for headshots
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    if (operation.error) {
        throw new Error(operation.error.message || "Video generation failed");
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("No video URI returned");
    }

    // Fetch the video content with the API key appended
    const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error('Gemini Video API Error:', error);
    throw error;
  }
};