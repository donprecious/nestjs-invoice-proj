export const GenerateRandom = (min, max) => {
  const randomNum = Math.random() * (max - min) + min;
  return Math.floor(randomNum);
};
