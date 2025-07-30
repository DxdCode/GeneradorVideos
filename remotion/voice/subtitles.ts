import fs from 'fs';
import path from 'path';

export function saveSubtitles(text: string, filename = 'subtitle.srt') {
  const outputDir = path.resolve(__dirname, '..', 'public', 'subtitles');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Divide el texto en frases simples por punto (.)
  const sentences = text.split('.').map(s => s.trim()).filter(Boolean);

  let srtContent = '';

  sentences.forEach((sentence, index) => {
    const startSeconds = index * 3;
    const endSeconds = (index + 1) * 3;

    // Formato de tiempo para srt: HH:MM:SS,mmm
    const formatTime = (s: number) => {
      const hrs = Math.floor(s / 3600).toString().padStart(2, '0');
      const mins = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
      const secs = Math.floor(s % 60).toString().padStart(2, '0');
      const ms = '000';
      return `${hrs}:${mins}:${secs},${ms}`;
    };

    srtContent += `${index + 1}\n`;
    srtContent += `${formatTime(startSeconds)} --> ${formatTime(endSeconds)}\n`;
    srtContent += `${sentence}.\n\n`;
  });

  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, srtContent);

  return outputPath;
}
