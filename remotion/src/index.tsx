import {registerRoot} from 'remotion';
import { RemotionRoot } from './Video';  // Aquí importas el archivo que exporta la composición
import '@fontsource/lilita-one'; // Esto inyecta la fuente en el bundle

registerRoot(RemotionRoot);
