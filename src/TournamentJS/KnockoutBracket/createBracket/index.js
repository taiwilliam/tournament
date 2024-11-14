import { sort_strategy } from '../../stratery'


// 生成淘汰賽順序
// 參數
// teams: 選手陣列 [id,id...]
// seeds: 種子選手陣列
// fixed_seed: 固定的種子序(所謂固定就是依照蛇形排列的方式排序種子，但有些情況你可能只需要前四種子固定，5~8種子隨機)
// 預設情況下所有填入的種子都是固定的
// 若你填入了固定種子，則會依照固定種子排序，剩餘種子腳位隨機填充

// 範例
// input: teams: [1,2,3,4,5,6,7], seeds: [1,2,3,4]
export function createBracket(teams, seeds, fixed_seed = seeds.length) {
    // 創建種子陣列
    // [1, 2, 3, 4, 7, 6, 5, null]
    const filledSeedsArray = createSeedsArray(teams, seeds, fixed_seed)

    // 序列格式化種子陣列
    // [
    //   [1, undefined, undefined, null],
    //   [4, undefined, undefined, 7],
    //   [3, undefined, undefined, 6],
    //   [2, undefined, undefined, 5]
    // ]
    const seedDataSorted = generateSnakeSeedData(filledSeedsArray)

    // 攤平序列格式化種子陣列
    // [1, undefined, undefined, null, 4, undefined, undefined, 7, 3, undefined, undefined, 6, 2, undefined, undefined, 5]
    const seedFlatDataSorted = seedDataSorted.flat(Infinity)

    // 移除多餘undefined腳位
    // [1, 4, 3, 2, 7, 6, 5, null]
    const result = seedFlatDataSorted.filter(element => element !== undefined)

    return result
}

// 序列化最終種子陣列
// 目標是創建一個陣列，從種子選手開始排序，接著隨機填充非選手種子，最後剩餘腳位舔入null
// 參數
// teams: 選手陣列 [id,id...]
// seeds: 種子選手陣列
// fixed_seed: 固定的種子序(所謂固定就是依照蛇形排列的方式排序種子，但有些情況你可能只需要前四種子固定，5~8種子隨機)
// 範例
// input: teams: [1,2,3,4,5,6,7], seeds: [1,2,3,4]
// output: [1,2,3,4,7,6,5,null]
function createSeedsArray(teams, seeds, fixed_seed) {
    const playerLength = teams.length // 選手總數
    const seedLength = seeds.length // 種子選手總數
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(playerLength))) // 腳位總數
    const filledTeams = [...teams, ...Array(bracketSize - playerLength).fill(null)] // 填滿選手陣列的腳位 [1,2,3,4,5,6,7,null]
    const remainingTeams = filledTeams.filter(p => !seeds.includes(p) && p !== null) // 種子之外的剩餘選手陣列 [5,6,7]
    const randomRemainingTeams = sort_strategy['r'](remainingTeams) // 找到剩餘選手並隨機排序 [7,6,5] (隨機排序)
    const isRandomSeed = fixed_seed !== seedLength // 是否隨機種子

    // 若種子非全部固定則要另外處裡
    const seedArray = isRandomSeed ? getRandomSeedArray(seeds, fixed_seed) : seeds // 種子陣列
    const filledSeeds = [...seedArray, ...Array(bracketSize - seedLength).fill(null)] // 填滿種子選手陣列的腳位 [1,2,3,4,null,null,null,null]

    // 按照順序組成最終種子陣列
    // 1. 填充種子選手
    // 2. 填充剩餘隨機選手
    // 3. 填充null
    const result = [...filledSeeds] // 填充種子選手
    const randomRemainingTeams_ = [...randomRemainingTeams] // 剩餘隨機選手陣列

    result.forEach((seed, i) => {
        if (seed == null && randomRemainingTeams_.length > 0) {
            result[i] = randomRemainingTeams_.shift() // 填充剩餘隨機選手
        }
    })

    return result
}


// 獲得隨機種子序列
// seedArray: 種子陣列
// fixedSeed: 固定種子數量(必定從前面開始算)
// 範例
// fixedSeed: 4 但表前四種子固定，5~8種子隨機
// fixedSeed: default = seedArray.length 代表全部種子都固定
function getRandomSeedArray(seedArray, fixedSeed) {
  const seeds_ = [...seedArray]
  const fixedSeeds = seeds_.splice(0, fixedSeed);
  const remainingSeeds = [...seeds_]
  const randomRemainingSeeds = sort_strategy['r'](remainingSeeds)
  const randomSeeds = [...fixedSeeds, ...randomRemainingSeeds] // 隨機種子陣列

  return randomSeeds
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
        // 為了顯示上的需求，將最底層的奇數種子序順序反轉，顯示畫面剛好讓種子離最遠
        const isEven = i % 2 === 0 // 是否為偶數
        const snakeSeedData = generateSnakeSeedData(result[i])

        result[i] = isEven ? snakeSeedData : snakeSeedData.reverse()
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
