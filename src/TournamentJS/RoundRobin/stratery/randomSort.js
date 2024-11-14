export const randomSort = (array) => {
  const shuffled = [...array]; // 先複製一份，保持純函數性質
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 隨機索引
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // 交換元素
  }
  return shuffled;
}