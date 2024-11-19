import { InMemoryDatabase } from 'brackets-memory-db'
import { BracketsManager, helpers } from '../../vendors/brackets-manager.js-master/src'
import { BracketsViewer } from '../../vendors/brackets-viewer.js-master/src'
import { managerConfigSetting } from './constants'
import { asyncForEach } from '../utility'

// 創建儲存庫(模擬DB)
// stageData 有點像資料庫就是 manager.get.stageData(0) return這樣的資料
// 未來會儲存stageData 若讀取後還想要透過manager管理 則要注入回去
export function createStorage(stageData = null) {
    // InMemoryDatabase 類的作用是實現一個基於記憶體的資料庫 為了將接下來的manager物件模擬成一個資料庫
    const storage = new InMemoryDatabase()

    // 若有stageData則注入
    if(stageData !== null) storage.data = stageData
    return storage
}

// 創建賽事管理者
export function createManager(storage) {
    return new BracketsManager(storage)
}

// 創建賽程管理工具
export function createConfig(
    config = {
        // 通用參數
        name: '', // 賽事名稱
        tournamentId: '', // 賽事ID
        type: '', // "single_elimination", "double_elimination", "round_robin"
        participants: [], // 參賽者
        matchesChildCount: '', // 幾戰幾勝 填入勝場數即可
        // 循環賽
        groupCount: '', // 循環賽的分組數量
        roundRobinMode: 'simple', // 循環賽的比賽模式：simple, double
        // 淘汰賽
        grandFinal: 'none', // 雙敗淘汰賽的冠軍決賽模式
        //   none: 無冠軍決賽。
        //   simple: 冠軍決賽為單場比賽，贏家即為該階段的冠軍。
        //   double: 若 WB 的冠軍在冠軍決賽中失利，將進行最終決賽。
        consolationFinal: false // 是否要比出三四名
        // skipFirstRound: false, // 是否跳過雙敗淘汰賽首輪，將後面半部的選手直接視為敗部 (太少用到，暫時不開放)
    }
) {
    if (!config) {
        throw new Error('config is required')
    }
    if (
        !config.name ||
        !config.type ||
        !config.participants ||
        config.tournamentId == null ||
        config.tournamentId == undefined
    ) {
        throw new Error('name, type, participants, tournamentId are required')
    }
    if (config.type === 'round_robin' && !config.groupCount) {
        throw new Error('groupCount is required')
    }

    return formatTournamentConfig(config)
}

// 格式化賽事參數
function formatTournamentConfig(config) {
    // 種子排序及輪空分配 都交由TournamentJS處理所以這裡不需要考慮
    const size = config.participants.length // 參賽者數量依賴傳入的參賽者總數
    const seedOrdering = ['natural'] // 不用做任何排序
    const balanceByes = false // 不用填入輪空

    return {
        name: config.name,
        tournamentId: config.tournamentId,
        type: config.type,
        seeding: config.participants,
        settings: {
            size,
            seedOrdering,
            balanceByes,
            // 循環賽
            groupCount: Number(config.groupCount),
            roundRobinMode: config.roundRobinMode,
            // 淘汰賽
            grandFinal: config.grandFinal,
            consolationFinal: config.consolationFinal
            // skipFirstRound: config.skipFirstRound,
        }
    }
}

// 創建賽程圖類
export function createBracketsViewer() {
    return new BracketsViewer()
}

export function renderTournamentViewer(viewer, elementString, tournamentData, config) {
    return viewer.render(
        {
            stages: tournamentData?.stage,
            matches: tournamentData?.match,
            matchGames: tournamentData?.match_game,
            participants: tournamentData?.participant
        },
        {
            onMatchClick: () => {},
            onMatchLabelClick: (arg) => console.log(arg),
            customRoundName: arg => setCustomRoundName(arg),
            clear: true, // 使否清除之前的資料
            selector: elementString,
            participantOriginPlacement: 'before', // "none" | "before" | "after" UI設定: id的位置
            separatedChildCountLabel: true, // session上的label 資訊是否放在同一邊 true: Bo3 會顯示在右邊
            showSlotsOrigin: true, // 是否顯示槽的來源
            showLowerBracketSlotsOrigin: true, // 是否顯示槽位的起源（在淘汰階段的下括號中） 雙敗淘汰適用
            highlightParticipantOnHover: true, // hover團隊路徑
            showPopoverOnMatchLabelClick: true, // 點擊label 出現彈窗
            showRankingTable: true, // 循環賽階段是否顯示排名表
            ...config // 透過config設定
        }
    )
}

// 清除畫面元素
function clearViewElement(elementString) {
    const bracketsViewerNode = document.querySelector(elementString)
    bracketsViewerNode?.replaceChildren()
}

// 取得賽事資料
async function getStageData(manager, tournament_id) {
    return await manager.get.stageData(tournament_id)
}

// 注入球員大頭照
export function setParticipantImages(viewer, tournamentData, participantImagesArray) {
    return viewer.setParticipantImages(
        tournamentData.participant.map(participant => {
            const renderInt = Math.floor(Math.random() * 20) + 1
            return {
                participantId: participant.id,
                imageUrl: `https://mighty.tools/mockmind-api/content/human/${renderInt}.jpg`
            }
        })
    )
}

// 更新比賽成績
export async function updateMatch(matchData, manager, force = false) {
    try {
        await manager.update.match(matchData, force)
    } catch (error) {
        console.log(error, matchData)
    }
}

// 設定roundRobinMode
function setCustomRoundName(arg) {
    const {
        fractionOfFinal, // 決賽階段的比例
        finalType, // 決賽階段的類型 grand-final
        groupType, // 賽制
        roundCount, // 淘汰賽用總共幾輪
        roundNumber // 第幾輪
    } = arg

    const ROUND_NAME_STRATEGY = {
        'round-robin': () => `第 ${roundNumber} 回合`, // 循環賽
        'single-bracket': () => {}, // 單敗淘汰賽
        'winner-bracket': () => {}, // 雙敗淘汰賽 - 勝部
        'loser-bracket': () => {}, // 雙敗淘汰賽 - 敗部
        'final-group': () => {} // 決賽
    }
    // todo: 未完成，待i18翻譯後再補上
    // return ROUND_NAME_STRATEGY[groupType](arg)
}

// 淘汰賽中 清除影響到的下一場賽事
// 通常用在更新成績前，需要清除影響到的上層腳位
export async function resetNextMatchByElimination(match, manager) {
    // 獲得所有關聯腳位賽事
    const nextMatches = await findAllNextMatches(match, manager)

    // 遍歷所有關聯腳位賽事
    await asyncForEach(nextMatches, async match => {
        // 若比賽已經完成才需要清除
        if (helpers.isMatchCompleted(match)) {
            // 清除比賽結果
            await updateMatch(getEmptyMatchResult(match), manager, true)
        }
    })
}

// 尋找淘汰賽中，所有上層的賽事
async function findAllNextMatches(match, manager) {
    const result = [] // 結果

    // 遞回尋找所有下一層賽事
    const findAllNextMatchesRecursion = async (match, manager) => {
        // 獲取下一場賽事
        const nextMatches = await manager.find.nextMatches(match.id)

        // 沒有下一場就結束遞迴
        if (nextMatches.length == 0) return

        // 繼續尋找所有賽事直到結束
        await asyncForEach(nextMatches, async match => {
            if (helpers.isMatchCompleted(match)) {
                result.push(match)
                return await findAllNextMatchesRecursion(match, manager)
            }
        })
    }

    // 執行遞回
    await findAllNextMatchesRecursion(match, manager)

    // 回傳結果
    return result
}

// 獲取空的Match成績資格式
export function getEmptyMatchResult(match) {
    return {
        id: match.id,
        opponent1: {},
        opponent2: {}
    }
}
