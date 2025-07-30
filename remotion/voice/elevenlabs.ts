import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

export async function generateAudio(text: string, filename = 'voice.mp3') {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 1.0,            // 100%
          similarity_boost: 1.0,     // 100%
          style_exaggeration: 0.0,   // 0%
          speed: 1.18                // velocidad
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
      }
    );

    const outputDir = path.resolve(__dirname, '..', 'public', 'voice-generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputPath = path.join(outputDir, filename);
    const writer = fs.createWriteStream(outputPath);

    response.data.pipe(writer);

    return new Promise<string>((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error generando audio:', error);
    throw error;
  }
}
