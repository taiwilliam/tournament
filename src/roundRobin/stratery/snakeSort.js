export const snakeSort = (array, group_num, key) => {
  // 根據 key 對陣列降序排序
  const sortedArr = [...array].sort((a, b) => b[key] - a[key]);

  // 分組
  const rows = [];
  for (let i = 0; i < sortedArr.length; i += group_num) {
    const row = sortedArr.slice(i, i + group_num);
    // 每隔一行反轉，實現蛇行效果
    if (rows.length % 2 === 1) {
      row.reverse();
    }
    rows.push(row);
  }

  // 將每列元素依次攤平
  const result = [];
  for (let col = 0; col < group_num; col++) {
    for (let row = 0; row < rows.length; row++) {
      if (rows[row][col] !== undefined) {
        result.push(rows[row][col]);
      }
    }
  }

  return result;
}