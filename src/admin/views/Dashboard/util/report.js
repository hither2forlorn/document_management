export const getRandomColor = () => {
  var letters = "123456789ABCDEF";
  var color = "#aa";
  for (var i = 0; i < 4; i++) {
    color += letters[Math.floor(Math.random() * 14)];
  }
  return color;
};

export const animateOption = {
  animation: {
    animateScale: true,
  },
};

export const hideLegend = {
  legend: {
    display: false,
  },
};
