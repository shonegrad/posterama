import { LayerConfig } from './constants';

// Blend mode functions
export const applyBlendMode = (
  baseR: number, baseG: number, baseB: number,
  overlayR: number, overlayG: number, overlayB: number,
  blendMode: LayerConfig['blendMode'],
  opacity: number
): [number, number, number] => {
  let resultR: number, resultG: number, resultB: number;
  
  const bR = baseR / 255, bG = baseG / 255, bB = baseB / 255;
  const oR = overlayR / 255, oG = overlayG / 255, oB = overlayB / 255;
  
  switch (blendMode) {
    case 'multiply':
      resultR = bR * oR;
      resultG = bG * oG;
      resultB = bB * oB;
      break;
    case 'screen':
      resultR = 1 - (1 - bR) * (1 - oR);
      resultG = 1 - (1 - bG) * (1 - oG);
      resultB = 1 - (1 - bB) * (1 - oB);
      break;
    case 'overlay':
      resultR = bR < 0.5 ? 2 * bR * oR : 1 - 2 * (1 - bR) * (1 - oR);
      resultG = bG < 0.5 ? 2 * bG * oG : 1 - 2 * (1 - bG) * (1 - oG);
      resultB = bB < 0.5 ? 2 * bB * oB : 1 - 2 * (1 - bB) * (1 - oB);
      break;
    case 'soft-light':
      resultR = oR < 0.5 ? 2 * bR * oR + bR * bR * (1 - 2 * oR) : 2 * bR * (1 - oR) + Math.sqrt(bR) * (2 * oR - 1);
      resultG = oG < 0.5 ? 2 * bG * oG + bG * bG * (1 - 2 * oG) : 2 * bG * (1 - oG) + Math.sqrt(bG) * (2 * oG - 1);
      resultB = oB < 0.5 ? 2 * bB * oB + bB * bB * (1 - 2 * oB) : 2 * bB * (1 - oB) + Math.sqrt(bB) * (2 * oB - 1);
      break;
    case 'hard-light':
      resultR = oR < 0.5 ? 2 * bR * oR : 1 - 2 * (1 - bR) * (1 - oR);
      resultG = oG < 0.5 ? 2 * bG * oG : 1 - 2 * (1 - bG) * (1 - oG);
      resultB = oB < 0.5 ? 2 * bB * oB : 1 - 2 * (1 - bB) * (1 - oB);
      break;
    case 'color-dodge':
      resultR = bR === 1 ? 1 : Math.min(1, oR / (1 - bR));
      resultG = bG === 1 ? 1 : Math.min(1, oG / (1 - bG));
      resultB = bB === 1 ? 1 : Math.min(1, oB / (1 - bB));
      break;
    case 'color-burn':
      resultR = bR === 0 ? 0 : Math.max(0, 1 - (1 - oR) / bR);
      resultG = bG === 0 ? 0 : Math.max(0, 1 - (1 - oG) / bG);
      resultB = bB === 0 ? 0 : Math.max(0, 1 - (1 - oB) / bB);
      break;
    case 'darken':
      resultR = Math.min(bR, oR);
      resultG = Math.min(bG, oG);
      resultB = Math.min(bB, oB);
      break;
    case 'lighten':
      resultR = Math.max(bR, oR);
      resultG = Math.max(bG, oG);
      resultB = Math.max(bB, oB);
      break;
    case 'difference':
      resultR = Math.abs(bR - oR);
      resultG = Math.abs(bG - oG);
      resultB = Math.abs(bB - oB);
      break;
    case 'exclusion':
      resultR = bR + oR - 2 * bR * oR;
      resultG = bG + oG - 2 * bG * oG;
      resultB = bB + oB - 2 * bB * oB;
      break;
    default:
      resultR = oR;
      resultG = oG;
      resultB = oB;
      break;
  }
  
  const opacityFactor = opacity / 100;
  const finalR = Math.round((resultR * opacityFactor + bR * (1 - opacityFactor)) * 255);
  const finalG = Math.round((resultG * opacityFactor + bG * (1 - opacityFactor)) * 255);
  const finalB = Math.round((resultB * opacityFactor + bB * (1 - opacityFactor)) * 255);
  
  return [finalR, finalG, finalB];
};