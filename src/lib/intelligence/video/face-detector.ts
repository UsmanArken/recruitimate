export interface DetectedFace {
  boundingBox: DOMRectReadOnly;
}

export interface FaceDetector {
  detect(image: ImageBitmapSource): Promise<DetectedFace[]>;
}

export interface FaceDetectorConstructor {
  new (options?: { fastMode?: boolean; maxDetectedFaces?: number }): FaceDetector;
}

interface WindowWithFaceDetector extends Window {
  FaceDetector?: FaceDetectorConstructor;
}

export function getFaceDetector(): FaceDetector | null {
  if (typeof window === "undefined") return null;
  const Ctor = (window as WindowWithFaceDetector).FaceDetector;
  if (!Ctor) return null;
  try {
    return new Ctor({ fastMode: true, maxDetectedFaces: 1 });
  } catch {
    return null;
  }
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name);
}

export function isVideoRecordingPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return /\.(mp4|webm|mov)$/i.test(path);
}
