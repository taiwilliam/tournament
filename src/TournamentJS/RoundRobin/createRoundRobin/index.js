import { sort_strategy } from '../stratery'

// 創建循環賽分組
// teams([{ id: number, points: number }]): 隊伍數據
// group_num(number): 分幾組
// sort(string):
//     's' 依據 `key` 屬性降序排序
//     'r' 隨機打亂數組
//     ''  依照傳入順序分組
// key(string): 依據 `key` 屬性排序 (sort 為 's' 時必填)
export const createRoundRobin = (teams, group_num, sort = '', key = '') => {
  // 深拷貝以避免修改原始數據
  let teams_ = [...teams]
  const teamsLength = teams_.length

  if(group_num <= 0 || group_num > teamsLength){
    throw new Error('分組數量無效')
  }

  if (sort === 's' && key === '') {
      throw new Error('`key` 參數不能為空')
  }

  if (sort === 's' && teams[0][key] === undefined) {
      throw new Error('`key` 參數不正確')
  }

  // 按照參數進行排序
  if (sort === 's' && key) {
      // 依據 `key` 屬性降序排序
      teams_ = sort_strategy['s'](teams_, group_num, key)
  }

  if (sort === 'r') {
      // 隨機打亂數組
      teams_ = sort_strategy['r'](teams_)
  }

  // 將排序好的陣列 分組
  const group_teams = chunkByGroups(teams_, group_num)
  // 將分組後的陣列格式化
  const result = formatGroupData(group_teams)

  return result
}

// 將陣列分組
// 類似chuck 但傳入參數為分組數量 而不是每組的成員數量
// group_num: 分幾組
function chunkByGroups(array, numGroups) {
  if (numGroups <= 0) return []; // 避免 numGroups <= 0 的情況

  const result = [];
  const totalItems = array.length;
  const baseSize = Math.floor(totalItems / numGroups); // 每組的基本大小
  let remainder = totalItems % numGroups; // 餘數，表示需要多分配的組數

  let startIndex = 0;

  for (let i = 0; i < numGroups; i++) {
      // 當前組的大小：基本大小 + 若有餘數則多分 1 個元素
      const currentGroupSize = baseSize + (remainder > 0 ? 1 : 0);
      remainder--; // 減少餘數

      // 使用 slice 分割子陣列
      const chunkArray = array.slice(startIndex, startIndex + currentGroupSize);
      result.push(chunkArray);

      // 更新起始索引
      startIndex += currentGroupSize;
  }

  return result;
}


// 格式化分組數據
function formatGroupData(group_data) {
  return group_data.map((group, i) => ({
      group_id: i,
      teams: group
  }));
}