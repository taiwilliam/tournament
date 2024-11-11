import { group_data } from './data'

console.log(groupTeams(group_data, 4, 's', 'points'))

// sort: 's' 依據 `rely` 屬性降序排序
// sort: 'r' 隨機打亂數組
// sort: ''  依照傳入順序分組
function groupTeams(teams, numGroups, sort = '', rely = '') {
  // 深拷貝以避免修改原始數據
  let teamArray = [...teams];
  // 初始化分組
  const groups = initModel(numGroups)

  // 按照參數進行排序
  if (sort === 's' && rely) {
    // 依據 `rely` 屬性降序排序
    teamArray.sort((a, b) => b[rely] - a[rely]);
  } else if (sort === 'r') {
    // 隨機打亂數組
    teamArray = teamArray.sort(() => Math.random() - 0.5);
  }
  
  // 分配團隊
  if (sort === 's' && rely) {
    // 盡量平衡分數分組（輪循分配）
    teamArray.forEach((team, index) => {
      console.log(team, index, [index % numGroups])
      groups[index % numGroups].teams.push(team);
    });
  } else {
    // 其他情況按照順序分配
    teamArray.forEach((team, index) => {
      groups[index % numGroups].teams.push(team);
    });
  }


  function initModel(numGroups) {
    return Array.from({ length: numGroups }, (_, i) => ({
      group_id: i,
      teams: []
    }));
  }

  return groups;
}