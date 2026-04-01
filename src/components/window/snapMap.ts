export default function getSnapMap() {
  if (typeof window === 'undefined') {
    return {
      left: { width: 0, height: 0, x: 0, y: 0 },
      right: { width: 0, height: 0, x: 0, y: 0 },
      'top-left': { width: 0, height: 0, x: 0, y: 0 },
      'top-right': { width: 0, height: 0, x: 0, y: 0 },
      'bottom-left': { width: 0, height: 0, x: 0, y: 0 },
      'bottom-right': { width: 0, height: 0, x: 0, y: 0 },
    } as const;
  }

  const halfWidth = window.innerWidth / 2;
  const halfHeight = window.innerHeight / 2;
  const fullHeight = window.innerHeight;

  return {
    left: {
      width: halfWidth,
      height: fullHeight,
      x: 0,
      y: 0,
    },
    right: {
      width: halfWidth,
      height: fullHeight,
      x: halfWidth,
      y: 0,
    },
    'top-left': {
      width: halfWidth,
      height: halfHeight,
      x: 0,
      y: 0,
    },
    'top-right': {
      width: halfWidth,
      height: halfHeight,
      x: halfWidth,
      y: 0,
    },
    'bottom-left': {
      width: halfWidth,
      height: halfHeight,
      x: 0,
      y: halfHeight,
    },
    'bottom-right': {
      width: halfWidth,
      height: halfHeight,
      x: halfWidth,
      y: halfHeight,
    },
  } as const;
}
