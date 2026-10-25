import { ThresholdAlgorithm } from './constants';

/** Short suffix per algorithm used in generated export filenames. */
const ALGORITHM_SHORT_NAMES: Record<ThresholdAlgorithm, string> = {
  'simple': 'simple',
  'floyd-steinberg': 'floyd',
  'false-floyd-steinberg': 'false-floyd',
  'ordered-dither': 'ordered',
  'atkinson': 'atkinson',
  'jarvis-judice-ninke': 'jarvis',
  'sierra': 'sierra',
  'sierra-lite': 'sierra-lite',
  'burkes': 'burkes',
  'stucki': 'stucki',
  'riemersma': 'riemersma'
};

export function getAlgorithmShortName(algorithm: ThresholdAlgorithm): string {
  return ALGORITHM_SHORT_NAMES[algorithm] ?? 'image';
}

/**
 * Builds a descriptive export filename:
 * `<base>-<algorithm>-<timestamp>` (e.g. `poster-atkinson-123456`).
 */
export function buildSmartFilename(baseName: string, algorithm: ThresholdAlgorithm): string {
  const timestamp = Date.now().toString().slice(-6);
  const base = baseName && baseName.trim() ? baseName.trim() : 'image';
  return `${base}-${getAlgorithmShortName(algorithm)}-${timestamp}`;
}
