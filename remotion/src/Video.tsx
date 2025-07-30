import { useEffect, useState } from 'react';
import { Composition, staticFile, delayRender, continueRender } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { MyVideo } from './MyVideo';

export const RemotionRoot: React.FC = () => {
  const [durationInFrames, setDurationInFrames] = useState<number>(150); // valor por defecto
  const [handle] = useState(() => delayRender());
  const fps = 30;

  useEffect(() => {
    const loadDuration = async () => {
      const durationInSeconds = await getAudioDurationInSeconds(
        staticFile('voice-generated/voice.mp3')
      );
      setDurationInFrames(Math.ceil(durationInSeconds * fps));
      continueRender(handle);
    };

    loadDuration().catch((err) => {
      console.error('Failed to load audio duration', err);
      continueRender(handle);
    });
  }, [fps, handle]);

  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={durationInFrames}
      fps={fps}
      width={1080}
      height={1920}
    />
  );
};
