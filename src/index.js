import './style/index.css'

// import './single_elimination'
// import './single_elimination_'

// import './double_elimination'
// import './round_robin'

// 分組函數
// import './roundRobin'

// 若我用一個array 當做一個單敗淘汰的參賽選手表示，[1,2,3,4,5,6,7]
// 7 個人代表我需要一個8人制的淘汰賽，以此類推16人需要16人制的淘汰賽，19人需要32人制的淘汰賽
// [1,2] 代表一個淘汰賽的腳位，1代表選手1，2代表選手2
// [3,null] 代表這個腳位，3代表選手3，null代表輪空 也就是3號選手這場比賽直接晉級

// 我希望輸入種子序列，及參賽隊伍，然後輸出淘汰賽賽程
// 這排名最高的兩名參賽者分開兩線比賽，只可能在決賽才會相遇，同樣前四名只可能在準決賽才會相遇，並依次類推。
// 理想情況下，如無意外賽果，在半準決賽中1號種子將對陣8號種子，2號對7號，3號對6號，4號對5號。
// array的index代表種子序，value代表選手id，也就是說[1,2,3,4,5,6,7] 代表種子為1的選手是1號選手，種子為2的選手是2號選手
// 像是種子為[1, 6]
// 代表第一種子跟第二種子必須最後一場才能打到並且輪空的優先權 在第一種子可能會變成這樣
// 會變成 [[1,null],[3,2],[5,4],[7,6]]

// 種子為[1, 6, 4, 7]
// 會變成 [[1,null],[3,7],[4,5],[2,6]]
// 3、4、5 隨機分配

// 種子為[1, 6, 4, 7, 2, 3, 5]
// 會變成 [[1,null],[2,7],[4,3],[5,6]]

// 幫我寫一個JS函數 做這件事
// 我想邏輯為 先填充空位把 [1,2,3,4,5,6,7] => [1,2,3,4,5,6,7,null]
// 然後根據種子序填充選手，再填充剩餘選手剩餘選手先為隨機後為輪空
// 選手=> [1,2,3,4,5,6,7] 種子序=> [1, 6]
// 會變成 [1, 6, 3, 4, 5, 7, 2, null]  3, 4, 5, 7, 2 隨機分配

// 接下來把頭尾對應的選手配對，第二個跟倒數第二個配對，依此類推
// [[1, null], [6, 2], [3, 7], [4, 5]]

// 先做到這部分

function generateBracket(players, seeds) {
  const numPlayers = players.length;
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(numPlayers)));
  const filledPlayers = [...players, ...Array(bracketSize - numPlayers).fill(null)];

  // 初始化 bracket 並填充種子選手
  const bracket = Array(bracketSize).fill(null);
  seeds.forEach((seed, index) => {
      bracket[index] = seed; // 種子選手按間隔填入
  });

  // 找到剩餘選手並隨機排序
  const remainingPlayers = filledPlayers.filter(p => !seeds.includes(p) && p !== null);
  remainingPlayers.sort(() => Math.random() - 0.5);


  // 將剩餘選手填入空位
  let remainingIndex = 0;
  for (let i = 0; i < bracket.length; i++) {
      if (bracket[i] === null && remainingIndex < remainingPlayers.length) {
          bracket[i] = remainingPlayers[remainingIndex];
          remainingIndex++;
      }
  }

  // 配對頭尾選手
  const matches = [];
  for (let i = 0; i < bracketSize / 2; i++) {
      matches.push([bracket[i], bracket[bracketSize - 1 - i]]);
  }

  return matches;
}

// 測試範例
const players = [1, 2, 3, 4, 5, 6, 7];
const seeds = [1, 6];
console.log(generateBracket(players, seeds));

// [
//   [1, null],
//   [6, 7],
//   [5, 3],
//   [4, 2]
// ]

// 應該要變成

// [
//   [1, null], // 第一組
//   [4, 2]  // 第四組
//   [5, 3], // 第三組
//   [6, 7], // 第二組
// ]