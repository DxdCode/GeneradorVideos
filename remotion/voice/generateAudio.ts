import { generateAudio } from './elevenlabs';
import { saveSubtitles } from './subtitles';

const text = "Hola, este es un texto generado automáticamente con ElevenLabs. Aquí va la segunda frase.";

async function generateVoiceAndSubtitles() {
  const audioPath = await generateAudio(text, 'voice.mp3');
  console.log('Audio generado en:', audioPath);

  const subtitlePath = saveSubtitles(text, 'voice.srt');
  console.log('Subtítulos guardados en:', subtitlePath);
}

generateVoiceAndSubtitles().catch(console.error);
