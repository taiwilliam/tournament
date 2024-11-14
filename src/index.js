import './style/index.css'

// import './single_elimination'
// import './single_elimination_'

// import './double_elimination'
// import './round_robin'

// 分組函數
// import './roundRobin'

// 生成淘汰賽順序
function generateBracket(players, seeds) {
    const numPlayers = players.length
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(numPlayers)))
    const filledPlayers = [...players, ...Array(bracketSize - numPlayers).fill(null)]

    // 初始化 bracket 並填充種子選手
    const bracket = Array(bracketSize).fill(null)
    seeds.forEach((seed, index) => {
        bracket[index] = seed // 種子選手按間隔填入
    })

    // 找到剩餘選手並隨機排序
    const remainingPlayers = filledPlayers.filter(p => !seeds.includes(p) && p !== null)
    remainingPlayers.sort(() => Math.random() - 0.5)

    // 將剩餘選手填入空位
    let remainingIndex = 0
    for (let i = 0; i < bracket.length; i++) {
        if (bracket[i] === null && remainingIndex < remainingPlayers.length) {
            bracket[i] = remainingPlayers[remainingIndex]
            remainingIndex++
        }
    }

    // // 配對頭尾選手
    // const matches = []
    // for (let i = 0; i < bracketSize / 2; i++) {
    //     matches.push([bracket[i], bracket[bracketSize - 1 - i]])
    // }

    // // 攤平函數
    // const flatMatchArr = matches.flat(Infinity)

    // console.log(bracket, flatMatchArr)
    const seedDataSorted = generateSnakeSeedData(bracket)
    const seedFlatDataSorted = seedDataSorted.flat(Infinity)
    const result = seedFlatDataSorted.filter(element => element !== undefined);

    return result
}

// 測試範例
const players = [1, 2, 3, 4, 5, 6, 7]
const seeds = [1, 2, 3, 4]
console.log(generateBracket(players, seeds));

// const s = generateBracketOrder(128)
// console.log('_____________________________________________________________')
// console.log(s, getArrayDimensions(s))

// 如何生成以下淘汰賽順序
// 此函數只接受 4, 8, 16, 32, 64, 128 數量的array
function generateBracketOrder(count) {
    const seedArray = Array.from({ length: count }, (_, i) => i + 1)

    return generateSnakeSeedData(seedArray)
}

// 處理種子陣列序列化 (使用種子蛇行排序)
// 將單淘汰數據格式tree化，當輸入為4的倍數將多一層tree
// 4 => 2層 [[1],[4],[3],[2]]
// 16 => 3層 [[[1,16],[8,9]], [[4,13],[5,12]], [[3,14],[6,11]], [[2,15],[7,10]]]
function generateSnakeSeedData(seedArray) {
    const SEED_UNIT = 4 // 種子最小單位
    const seedArray_ = [...seedArray] // [種子序列: 選手編號...]
    const seedLength = seedArray_.length // 種子總數
    const isBottom = seedLength <= SEED_UNIT // 若傳入的只有四個選手內 代表到底層了
    const seedGroupArray = chunk(seedArray_, SEED_UNIT) // 將種子陣列分割成四個一組

    // 蛇行排序種子序列
    const snakeSeedGroupArray = snakeSortSeed(seedGroupArray)
    // 重新排列種子序列
    const result = rearrangeBaseSeeding(snakeSeedGroupArray)

    // 若到底層則返回結果
    if (isBottom) return result

    // 若未到底層則將結果遞迴處理
    // 為什麼迴圈四次 因為單淘汰資料結構有點像是一個樹狀結構
    // 且樹狀結構最低單位為四個分支且要使用這樣的排序(1,4,3,2)處理
    for (let i = 0; i < SEED_UNIT; i++) {
        result[i] = generateSnakeSeedData(result[i])
    }

    return result
}

// 將種子陣列依據[0,3,2,1]順序重新排列
// seedArray [index: value] index: 種子序列, value: 選手編號
// input: [1,2,3,4]
// return: [1,4,3,2]
function rearrangeBaseSeeding(seedArray) {
    const seedArray_ = deepClone(seedArray)
    const result = []
    const order = [0, 3, 2, 1] // 種子順序
    order.forEach((v, i) => {
        result[i] === undefined && result.push([])
        result[i] = seedArray_[v]
    })
    return result
}

// 蛇形排序種子序列
// seedGroupArray: 種子分組陣列(將種子陣列每4個分組後的結果)
// 此函數會將種子分組陣列依照蛇形排序
// input: [[1,2,3,4],[5,6,7,8]]
// return: [[1,8],[4,5],[3,6],[2,7]]
function snakeSortSeed(seedGroupArray) {
    const result = []
    const seedGroupArray_ = deepClone(seedGroupArray)

    let direction = true // 方向 (蛇形排序需要)
    seedGroupArray_.forEach(seeds => {
        const sortSeeds = direction ? [...seeds] : [...seeds].reverse()
        sortSeeds.forEach((seed, i) => {
            result[i] === undefined && result.push([])
            result[i].push(seed)
        })
        // 改變方向
        direction = !direction
    })

    return result
}

// 將陣列分割成指定大小的子陣列
function chunk(array, size) {
    const result = []
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size))
    }
    return result
}

// 深拷貝函數
function deepClone(obj) {
    try {
        return JSON.parse(JSON.stringify(obj))
    } catch (e) {
        console.error('Deep clone failed:', e)
        return null
    }
}

// 深度儲存函數
function getArrayDimensions(arr) {
    if (!Array.isArray(arr)) {
        return 0 // 如果不是陣列，返回 0 維
    }

    let dimension = 1 // 起始維度為 1
    let subArray = arr

    while (Array.isArray(subArray[0])) {
        dimension++
        subArray = subArray[0] // 繼續深入檢查子陣列
    }

    return dimension
}

// [1,2,3,4]
// [1,4,3,2]

// [1,2,3,4,5,6,7,8]
// [
//  [1,8],
//  [4,5],
//  [3,6],
//  [2,7]
// ]

// [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
// [
//   [
//     [1,16],[8,9]
//   ],
//   [
//     [4,13],[5,12]
//   ],
//   [
//     [3,14],[6,11]
//   ],
//   [
//     [2,15],[7,10]
//   ]
// ]

// [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]
// [
//   [
//     [1,32],[16,17],[9,24],[8,25]
//   ],
//   [
//     [4,29],[13,20],[12,21],[5,28]
//   ],
//   [
//     [3,30],[14,19],[11,22],[6,27]
//   ],
//   [
//     [2,31],[15,18],[10,23],[7,26]
//   ]
// ]
