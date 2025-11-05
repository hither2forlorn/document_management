const watermarkPositions = {
  1: {
    imageOption: { opacity: 0.5, x: 150, y: 350 },
    textOption: { opacity: 0.5, x: 200, y: 340 },
  },
  2: {
    imageOption: { opacity: 0.5, x: 290, y: 650 },
    textOption: { opacity: 0.5, x: 350, y: 640 },
  },
  3: {
    imageOption: { opacity: 0.5, x: 30, y: 650 },
    textOption: { opacity: 0.5, x: 60, y: 640 },
  },
  4: {
    imageOption: { opacity: 0.5, x: 300, y: 50 },
    textOption: { opacity: 0.5, x: 350, y: 40 },
  },
  5: {
    imageOption: { opacity: 0.5, x: 50, y: 50 },
    textOption: { opacity: 0.5, x: 80, y: 40 },
  },
  6: {
    imageOption: { opacity: 0.5, diagonally: true },
    textOption: { opacity: 0.5, diagonally: true },
  },
  default: {
    imageOption: { opacity: 0.5, x: 150, y: 350 },
    textOption: { opacity: 0.5, x: 200, y: 340 },
  },
};

const handleWatermarkPosition = (customWatermarkValue) => {
  return watermarkPositions[customWatermarkValue] || watermarkPositions["default"];
};

module.exports = handleWatermarkPosition;
