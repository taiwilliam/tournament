import { group_data } from '../data'
import { snakeSort, randomSort } from './stratery'

const sort_strategy = {
    s: (array, group_num, key) => snakeSort(array, group_num, key),
    r: array => randomSort(array)
}
// console.log(groupTeams(group_data, 4, 's', 'points'))
// console.log(groupTeams(group_data, 4, 'r'))
const s_data = groupTeams(group_data, 4, 's', 'points')
console.log('s_data', s_data)
// 假設某些 id 不能同組
const excludedPairs = [
    [10, 5], // id = 10 和 5 不能在同一組
    [1, 2] // id = 1 和 2 不能在同一組
]
const s_data2 = adjustGroups(s_data, excludedPairs, 'points')
console.log('s_data2', s_data2)

// sort: 's' 依據 `key` 屬性降序排序
// sort: 'r' 隨機打亂數組
// sort: ''  依照傳入順序分組
function groupTeams(teams, group_num, sort = '', key = '') {
    // 深拷貝以避免修改原始數據
    let teamArray = [...teams]

    if (sort === 's' && key === '') {
        throw new Error('`key` 參數不能為空')
    }

    if (sort === 's' && teams[0][key] === undefined) {
        throw new Error('`key` 參數不正確')
    }

    // 按照參數進行排序
    if (sort === 's' && key) {
        // 依據 `key` 屬性降序排序
        teamArray = sort_strategy['s'](teamArray, group_num, key)
    } else if (sort === 'r') {
        // 隨機打亂數組
        teamArray = sort_strategy['r'](teamArray)
    }

    // 分配團隊
    const result = groupArray(teamArray, group_num)

    return result
}

// 將陣列分組並回傳結果格式
function groupArray(arr, group_num) {
    const result = []

    // 以 group_num 為間隔，分組陣列
    for (let i = 0; i < arr.length; i += group_num) {
        result.push({
            group_id: result.length, // 當前 result 長度即為 group_id
            teams: arr.slice(i, i + group_num) // 擷取當前組別的元素
        })
    }

    return result
}

// 檢查兩個 `id` 是否在同一組
function areInSameGroup(group, id1, id2) {
    return group.some(team => team.id === id1) && group.some(team => team.id === id2)
}

// 在分組後進行二次調整，處理不應同組的條件
function adjustGroups(groups, excludedPairs, key) {
    const groups_ = deepCopy(groups)

    // 遍歷每個組
    for (let group of groups_) {
        for (let i = 0; i < excludedPairs.length; i++) {
            const [id1, id2] = excludedPairs[i]

            // 如果這組中有不該同組的 ID
            if (areInSameGroup(group.teams, id1, id2)) {
                // 嘗試交換 ID，使得這兩個 ID 不同組
                let team1 = group.teams.find(team => team.id === id1)
                // 尋找最接近的隊伍進行交換
                let closestTeam1 = findClosestTeam(team1, groups_, key)

                console.log('closestTeam1', closestTeam1)
                console.log('team1', team1)

                const tt = swapTeam(groups_, team1.id, closestTeam1.id)
                console.log(tt)
            }
        }
    }
    return groups_
}

// 找到與指定隊伍最接近的隊伍
function findClosestTeam(team, groups, key) {
    // 最接近的隊伍
    let closestTeam = null
    // 最接近的差(key)
    let closestDistance = Infinity

    for (let group of groups) {
        const hasThisGroup = group.teams.some(t => t.id === team.id)
        // 不要在自己的組中尋找
        if (hasThisGroup) continue

        for (let otherTeam of group.teams) {
            // 排除自己的組別
            if (team.id !== otherTeam.id) {
                // 計算兩個隊伍的差距
                const distance = Math.abs(team[key] - otherTeam[key])
                if (distance < closestDistance) {
                    // 更新最接近的隊伍
                    closestDistance = distance
                    // 全部更新完及會找到最接近的隊伍
                    closestTeam = otherTeam
                }
            }
        }
    }

    return closestTeam
}

// 深拷貝
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

// 交換兩個隊伍的位置
function swapTeam(groups, id1, id2) {
    // 生成 groups 的副本，防止修改原始資料
    const groups_ = deepCopy(groups)

    // 查找 id1 和 id2 所在的隊伍並交換位置
    let group1, group2
    let index1, index2

    // 找到 id1 和 id2 的隊伍所在組別與位置
    for (let group of groups_) {
        const teamIndex1 = group.teams.findIndex(team => team.id === id1)
        const teamIndex2 = group.teams.findIndex(team => team.id === id2)

        if (teamIndex1 !== -1) {
            group1 = group
            index1 = teamIndex1
        }
        if (teamIndex2 !== -1) {
            group2 = group
            index2 = teamIndex2
        }
    }

    // 若找到了 id1 和 id2 的隊伍，交換他們的位置
    if (group1 && group2 && index1 !== undefined && index2 !== undefined) {
        const temp = group1.teams[index1]
        group1.teams[index1] = group2.teams[index2]
        group2.teams[index2] = temp
    }

    // 返回交換後的資料
    return groups_
}


// 我有一個二維的組別陣列
// {
//     [
//         { id: 1, points: 10 },
//         { id: 2, points: 20 },
//         { id: 3, points: 30 },
//     ],
//     [
//         { id: 4, points: 40 },
//         { id: 5, points: 50 },
//         { id: 6, points: 60 },
//     ],
//     [
//         { id: 7, points: 70 },
//         { id: 8, points: 80 },
//         { id: 9, points: 90 },
//     ]
// }

// 我希望傳入一個條件陣列，告訴我哪些 id 不應該在同一組

// 像是
// [
//     [1,2,3],
//     [4,5]
// ]

// 該函數就會回傳一個新的組別陣列，滿足條件


// 衝突檢查
// 在將一個元素放入組別之前，使用 canPlaceInGroup 函數檢查是否存在衝突。
function canPlaceInGroup(newGroup, item, conflictMap) {
    // 檢查當前元素是否可以加入這個組別
    return newGroup.every(g => !conflictMap.get(g.id)?.has(item.id));
}

// 回溯法
// 使用回溯法嘗試逐一分配每個元素到新組別中，當遇到不符合條件的情況時進行回溯，嘗試其他可能的組合。
function backtrack(flatList, newGroups, groupSize, conflictMap, used, index = 0) {
    if (index >= flatList.length) return true; // 所有元素已經分配完成

    const item = flatList[index];
    
    for (let group of newGroups) {
        if (group.length < groupSize && canPlaceInGroup(group, item, conflictMap)) {
            group.push(item);
            used.add(item.id);
            if (backtrack(flatList, newGroups, groupSize, conflictMap, used, index + 1)) {
                return true; // 成功找到解法
            }
            group.pop(); // 回溯
            used.delete(item.id);
        }
    }

    return false; // 無法分配當前元素，回溯
}

function regroupWithConstraints(originalGroups, constraints) {
    const flatList = [];       // 用來存放所有元素
    const conflictMap = new Map();
    const groupSize = originalGroups[0].length;
    const groupCount = originalGroups.length;

    // 建立衝突映射表
    constraints.forEach(group => {
        group.forEach((id, _, arr) => {
            if (!conflictMap.has(id)) conflictMap.set(id, new Set());
            arr.forEach(conflictId => {
                if (id !== conflictId) conflictMap.get(id).add(conflictId);
            });
        });
    });

    // 將所有元素平放成一個一維陣列
    originalGroups.forEach(group => flatList.push(...group));

    // 初始化新組別
    const newGroups = Array.from({ length: groupCount }, () => []);
    const used = new Set();

    // 使用回溯法分組
    const success = backtrack(flatList, newGroups, groupSize, conflictMap, used);
    if (!success) throw new Error("無法滿足所有條件進行分組");

    return newGroups;
}

// 測試
const originalGroups = [
    [
        { id: 1, points: 10 },
        { id: 2, points: 20 },
        { id: 3, points: 30 }
    ],
    [
        { id: 4, points: 40 },
        { id: 5, points: 50 },
        { id: 6, points: 60 }
    ],
    [
        { id: 7, points: 70 },
        { id: 8, points: 80 },
        { id: 9, points: 90 }
    ]
];

const constraints = [
    // [1, 2, 3],  // 這些 id 不可以在同一組
    // [4, 5, 6],
    [7, 8],
];

const newGroups = regroupWithConstraints(originalGroups, constraints);
console.log(newGroups);
