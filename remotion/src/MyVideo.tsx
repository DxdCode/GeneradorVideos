import React, { useEffect, useMemo, useState } from 'react';
import { Audio, Sequence, AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { parseSrt, Caption as CaptionType } from '@remotion/captions';
import { interpolate } from 'remotion';

type Cap = CaptionType & { startFrame: number; durationFrames: number };
const emojis = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣',
  '🦆', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
  '🐌', '🐞', '🐜', '🦟', '🦗', '🐢', '🐍', '🦎', '🐙', '🦑',
  '🦀', '🐡', '🐠', '🐬', '🐳', '🐊', '🐅', '🦓', '🦍', '🐘',
];

export const MyVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const [subs, setSubs] = useState<Cap[]>([]);

  useEffect(() => {
    const fetchSrt = async () => {
      const response = await fetch(staticFile('subtitles/voice.srt'));
      const srtText = await response.text();
      const { captions } = parseSrt({ input: srtText });

      const mapped = captions.map((c) => ({
        ...c,
        startFrame: Math.floor((c.startMs / 1000) * fps),
        durationFrames: Math.ceil(((c.endMs - c.startMs) / 1000) * fps),
      }));
      setSubs(mapped);
    };

    fetchSrt();
  }, [fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('voice-generated/voice.mp3')} />
      {subs.flatMap((sub, idx) => {
        const words = sub.text.split(' ');
        const chunks: string[][] = [];

        for (let i = 0; i < words.length; i += 3) {
          chunks.push(words.slice(i, i + 3));
        }

        const framePerChunk = Math.floor(sub.durationFrames / chunks.length) || 1;

        return chunks.map((chunk, chunkIndex) => (
          <ChunkedSubtitle
            key={`${idx}-${chunkIndex}`}
            text={chunk.join(' ')}
            from={sub.startFrame + chunkIndex * framePerChunk}
            duration={framePerChunk}
          />
        ));
      })}
    </AbsoluteFill>
  );
};

const ChunkedSubtitle: React.FC<{
  text: string;
  from: number;
  duration: number;
}> = ({ text, from, duration }) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - from;

  const words = text.split(' ');
  const numWords = words.length || 1;
  const durationPerWord = duration / numWords;

  // Generamos un emoji aleatorio para este chunk una sola vez (memo)
  const emoji = useMemo(() => {
    return emojis[Math.floor(Math.random() * emojis.length)];
  }, [text]);

  // Animación de rebote para el emoji
  const bounce = interpolate(frame % 30, [0, 15, 30], [0, -10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Sequence from={from} durationInFrames={duration}>
      <>
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            width: '100%',
            textAlign: 'center',
            fontSize: 85,
            fontFamily: '"Lilita One", cursive',
            textShadow: '0 0 10px rgba(0,0,0,0.6)',
            padding: '0 30px',
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5ch',
            flexWrap: 'wrap',
            userSelect: 'none',
          }}
        >
          {words.map((word, idx) => {
            const wordFrame = relativeFrame - idx * durationPerWord;
            const isAnimating = wordFrame >= 0 && wordFrame <= durationPerWord;

            const scale = isAnimating
              ? interpolate(wordFrame, [0, 5, durationPerWord], [1.4, 1, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })
              : 1;

            const colorValue = isAnimating
              ? interpolate(wordFrame, [0, 5], [1, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }) > 0.5
                ? '#22f10fff'
                : 'white'
              : 'white';

            return (
              <span
                key={idx}
                style={{
                  transform: `scale(${scale})`,
                  color: colorValue,
                  transition: 'transform 0.3s, color 0.2s',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Emoji fijo abajo, centrado */}
        <div
          style={{
            position: 'absolute',
            bottom: 50,
            width: '100%',
            textAlign: 'center',
            fontSize: 60,
            transform: `translateY(${bounce}px)`,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          aria-label="emoji"
          role="img"
        >
          {emoji}
        </div>
      </>
    </Sequence>
  );
};