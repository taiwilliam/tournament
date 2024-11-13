// 依照條件重新分組
// teams: 隊伍數據
// [
//     {
//         group_id: 0,
//         teams: [
//             { id: 1, points: 10 },
//             { id: 2, points: 20 },
//             { id: 3, points: 30 },
//             { id: 4, points: 40 }
//         ]
//     }
// ]
// constraints([[id_number],...]): 限制條件 ex: [[1,8],[2,3,5]...]
export const regroupWithConstraints = (teams, group_num, constraints) => {

    // 若條件中的排除數量大於group_num共幾組，則條件錯誤
    if (constraints.some(condition => condition.length > group_num)) {
        throw new Error('無法滿足所有條件進行分組')
    }

    // 無條件 直接返回原數據
    if (constraints.length == 0) {
        return teams
    }

    const flatList = [] // 存放所有元素
    const conflictMap = new Map()
    const groupSize = teams[0].teams.length
    const groupCount = teams.length

    // 建立衝突映射表
    constraints.forEach(group => {
        group.forEach((id, _, arr) => {
            if (!conflictMap.has(id)) conflictMap.set(id, new Set())
            arr.forEach(conflictId => {
                if (id !== conflictId) conflictMap.get(id).add(conflictId)
            })
        })
    })

    // 將所有元素平放成一個一維陣列
    teams.forEach(group => flatList.push(...group.teams))

    // 初始化新的組別資料
    const newGroups = Array.from({ length: groupCount }, (_, i) => ({
        group_id: i,
        teams: []
    }))
    const used = new Set()

    // 使用回溯法分組
    const success = backtrack(flatList, newGroups, groupSize, conflictMap, used)
    if (!success) throw new Error('無法滿足所有條件進行分組')

    return newGroups
}

// 回溯法：
// 使用回溯法嘗試逐一分配每個元素到新組別中，當遇到不符合條件的情況時進行回溯，嘗試其他可能的組合。
function backtrack(flatList, newGroups, groupSize, conflictMap, used, index = 0) {
    if (index >= flatList.length) return true

    const item = flatList[index]

    for (let group of newGroups) {
        if (group.teams.length < groupSize && canPlaceInGroup(group.teams, item, conflictMap)) {
            group.teams.push(item)
            used.add(item.id)
            if (backtrack(flatList, newGroups, groupSize, conflictMap, used, index + 1)) {
                return true
            }
            group.teams.pop()
            used.delete(item.id)
        }
    }

    return false
}

// 衝突檢查：
// 在將一個元素放入組別之前，使用 canPlaceInGroup 函數檢查是否存在衝突。
function canPlaceInGroup(newGroup, item, conflictMap) {
    return newGroup.every(g => !conflictMap.get(g.id)?.has(item.id))
}
