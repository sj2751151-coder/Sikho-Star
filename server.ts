import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper: check if valid Gemini API key is configured
  const isApiKeyConfigured = () => {
    const key = process.env.GEMINI_API_KEY;
    return Boolean(key && key.trim() !== '' && key !== 'MY_GEMINI_API_KEY');
  };

  const getAiClient = () => {
    if (!isApiKeyConfigured()) return null;
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Endpoint to check AI configuration status
  app.get('/api/ai-status', (req, res) => {
    const configured = isApiKeyConfigured();
    res.json({
      configured,
      textModel: 'gemini-3.1-flash-lite',
      ttsModel: 'gemini-3.8-flash-lite-tts',
      voice: 'Kore',
      instructions: configured
        ? 'Guru Star AI is online and connected with Gemini 3.1 Flash Lite & Gemini 3.8 Flash TTS.'
        : 'GEMINI_API_KEY is not set. Add it in AI Studio Secrets to unlock dynamic AI responses and natural voice.',
    });
  });

  // Server-side AI Teacher chat route
  app.post('/api/chat', async (req, res) => {
    const { message, language = 'en', childName = 'Little Star' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ ok: false, error: 'Question message is required.' });
      return;
    }

    if (!isApiKeyConfigured()) {
      res.status(503).json({
        ok: false,
        configured: false,
        error: 'AI_KEY_NOT_CONFIGURED',
        message:
          language === 'hi'
            ? 'एआई शिक्षक सक्रिय करने के लिए AI Studio में GEMINI_API_KEY जोड़ें।'
            : 'To activate the real AI Teacher, configure GEMINI_API_KEY in the AI Studio Secrets panel.',
      });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(500).json({ ok: false, error: 'AI Client could not be initialized.' });
      return;
    }

    const systemPrompt = `You are "Guru Star" (गुरु स्टार), a kind, super-enthusiastic, and caring AI Teacher and mentor for young children (ages 5-11).
The child's name is "${childName}".
Preferred language: ${language === 'hi' ? 'Hindi (हिंदी)' : 'English'}.

Rules:
1. Speak in ${
      language === 'hi'
        ? 'warm, simple, pure Hindi using Devanagari script with kid-friendly, clear vocabulary'
        : 'clear, simple, cheerful English'
    }.
2. Always keep explanations short (under 110 words), relatable (use ice cream, superheroes, stars, puppies, toys, nature), and delightfully positive!
3. Add cheerful emojis (🌟, 🚀, 🦁, 🎨, 🌈, 💡) to make reading fun.
4. If asked something complex, break it down into 2-3 fun bite-sized points.
5. Never talk about adult, scary, violent, or unsafe topics. If asked, playfully steer to cool topics like rockets, animals, or colors.
6. Always end with a sweet encouraging praise and a mini curiosity question for the child!`;

    // Resilient model invocation: Try 'gemini-3.1-flash-lite' first (high reliability & low latency)
    // with fallback to 'gemini-3.8-flash' if needed.
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[GuruStar Chat] Trying model ${model} for question: "${message.substring(0, 40)}..."`);
        const response = await ai.models.generateContent({
          model,
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        const text = response.text || '';
        if (text.trim().length > 0) {
          console.log(`[GuruStar Chat] SUCCESS with model ${model}`);
          res.json({
            ok: true,
            answer: text,
            modelUsed: model,
          });
          return;
        }
      } catch (err: any) {
        console.warn(`[GuruStar Chat] Error with model ${model}:`, err?.message || err);
        lastError = err;
      }
    }

    // If both models failed
    console.error('[GuruStar Chat] All models failed:', lastError);
    let friendlyError =
      language === 'hi'
        ? 'गुरु स्टार अभी बहुत व्यस्त हैं! कृपया कुछ सेकंड बाद पुनः प्रयास करें। 🌟'
        : 'Guru Star is experiencing a high volume of questions right now! Please try asking again in a few moments. 🌟';

    const errorStr = lastError?.message || '';
    if (errorStr.includes('API key not valid') || errorStr.includes('API_KEY_INVALID')) {
      friendlyError =
        language === 'hi'
          ? 'GEMINI_API_KEY अमान्य है। कृपया AI Studio Secrets में सही कुंजी जोड़ें।'
          : 'The GEMINI_API_KEY is invalid. Please check your key in the AI Studio Secrets panel.';
    }

    res.status(200).json({
      ok: false,
      error: errorStr,
      friendlyMessage: friendlyError,
    });
  });

  // Server-side Natural AI Voice (Text-to-Speech) using Gemini 3.8 Flash Lite TTS
  app.post('/api/tts', async (req, res) => {
    const { text, language = 'en' } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ ok: false, error: 'Text is required for speech synthesis.' });
      return;
    }

    if (!isApiKeyConfigured()) {
      res.status(503).json({
        ok: false,
        error: 'AI_KEY_NOT_CONFIGURED',
        fallbackToBrowser: true,
        message: 'GEMINI_API_KEY not configured for natural voice.',
      });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(500).json({ ok: false, error: 'AI client failed to initialize.', fallbackToBrowser: true });
      return;
    }

    // Strip markdown formatting symbols and extra emojis that could distort TTS
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500); // keep speech concise and snappy for kids

    try {
      console.log(`[GuruStar TTS] Generating natural speech for: "${cleanText.substring(0, 50)}..."`);
      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style:
                    language === 'hi'
                      ? 'Warm, affectionate Indian teacher speaking natural, cheerful Hindi to a young schoolchild with sweet, clear pronunciation'
                      : 'Warm, encouraging, friendly teacher speaking cheerful, clear English to a young schoolchild',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        console.log(`[GuruStar TTS] SUCCESS! Generated audio (${base64Audio.length} chars)`);
        res.json({
          ok: true,
          audioBase64: base64Audio,
          format: 'audio/wav',
          voice: 'Kore',
          isNativeGeminiAudio: true,
        });
        return;
      }

      throw new Error('No audio returned in candidates');
    } catch (ttsErr: any) {
      console.error('[GuruStar TTS] Error generating natural speech:', ttsErr?.message || ttsErr);
      res.json({
        ok: false,
        error: ttsErr?.message || 'TTS generation failed',
        fallbackToBrowser: true,
      });
    }
  });

  // Setup Vite dev server middlewares or static production files
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SeekhoStar] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SeekhoStar] Failed to start server:', err);
  process.exit(1);
});
