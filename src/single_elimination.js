import { InMemoryDatabase } from 'brackets-memory-db'
// import { BracketsManager, helpers } from 'brackets-manager'
import { BracketsManager, helpers } from 'brackets-manager'
import 'brackets-viewer/dist/brackets-viewer.min.js'
import 'brackets-viewer/dist/brackets-viewer.min.css'
import { renderMatchScore, asyncForEach, clearViewElement, getEmptyMatchResult } from './utils'
import { participants_16 } from './data'
import { RoundRobin, KnockoutBracket } from './TournamentJS'

const bracket = new KnockoutBracket({
    teams: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    seeds: [15,11,10,1,9,12],
    // fixedSeed: 0
})
const bracketData = bracket.create()
console.log(bracket.create())
const PARTICIPANTS_ = bracketData.map((id, index) => {
     
    const p = participants_16.find(participant => participant?.id === id)
    return p ? p : null
})

console.log(PARTICIPANTS_, participants_16)


// ParticipantResult
// id: number | null 如果是null 則參與者待訂
// position: number 參與者來自哪裡
// result: 結果 'win' | 'draw' | 'loss'
// score: 分數 number
// forfeit: 棄賽 boolean 另一邊自動獲勝

// opponent1: { score: 0, result: '' },
// opponent2: { score: 0, result: '', forfeit: true }

// match status
/** 这两场比赛还没有完成。 */
// Locked = 0
/** 一名參與者已準備好並等待另一名參與者。 */
// Waiting = 1
/** 雙方參與者都已準備好開始。 */
// Ready = 2
/** 比賽正在進行中。 */
// Running = 3
/** 比賽結束。 */
// Completed = 4
/** 至少有一名參與者完成了下一場比賽。 */
// Archived = 5

const storage = new InMemoryDatabase()
const manager = new BracketsManager(storage)

const TOURNAMENT_ID = 0
const PARTICIPANTS = PARTICIPANTS_
const ELEMENT_STRING = '.brackets-viewer'
const STAGE_TYPE = 'single_elimination'  // "single_elimination", "double_elimination", "round_robin"
const SIZE = 16 // 4 / 8 | 16 | 32 | 64 | 128

// 創建賽事管理者 createBracketsManager
await createBracketsManager(TOURNAMENT_ID)
// 1. 利用// tournamentData.match 創建後端match資料表

// 2. 渲染賽程圖
initBracketsViewer(ELEMENT_STRING, await getStageData(TOURNAMENT_ID))

console.log(await getStageData(TOURNAMENT_ID))

// 創建賽程管理工具
async function createBracketsManager(tournamentId) {
    await manager.create.stage({
        
        name: '雙敗淘汰賽測試',
        tournamentId: tournamentId, // 賽事ID
        type: STAGE_TYPE, // "single_elimination", "double_elimination", "round_robin"
        seeding: PARTICIPANTS,
        settings: {
            size: SIZE, // 淘汰賽尺寸
            seedOrdering: ['natural'], // 種子設定 natural 即是不多做排序 指參照participants順序， "reverse_half_shift", "reverse"
            balanceByes: false, // 是否平均分配輪空
            matchesChildCount: 3, // 循環賽階段的小組數量
            skipFirstRound: false, // 是否跳過雙敗淘汰賽首輪，將後面半部的選手直接視為敗部
            // grandFinal: 'double', 
            // by double_elimination
            // - If `none` 則沒有總決賽
            // - If `simple` 則決賽為單場比賽，勝利者就是舞台的勝利者，勝者會變單淘汰
            // - If `double` 勝者如果輸了，則可以再次進行決賽 (更為公平，所有選手都要雙敗才會出局)
            consolationFinal: true // 是否要比出三四名
        }
    })
}

// 初始化賽程圖
async function initBracketsViewer(elementString, tournamentData = null) {
    // 渲染前必須清除畫面元素
    clearViewElement(elementString)

    // 防呆
    if (!tournamentData || tournamentData.participant == null) return

    // 點擊事件
    onMatchClicked(window.bracketsViewer, elementString)

    // 注入球員頭貼資訊
    setParticipantImages(tournamentData)

    renderBracketsViewer(elementString, tournamentData)
}

// 渲染賽程圖(更新資料用)
async function renderBracketsViewer(elementString, tournamentData) {
    // 渲染前必須清除畫面元素
    clearViewElement(elementString)
    
    // bracketsViewer 依賴 bracketsManager 的資料做渲染
    bracketsViewer.render(
        {
            stages: tournamentData?.stage,
            matches: tournamentData?.match,
            matchGames: tournamentData?.match_game,
            participants: tournamentData?.participant
        },
        {
            // clear: true, // 使否清除之前的資料
            selector: elementString, // 渲染在哪個element
            participantOriginPlacement: 'before', // "none" | "before" | "after" UI設定: id的位置
            separatedChildCountLabel: true, // 顯示每個session上的label
            showSlotsOrigin: true, // 是否顯示槽的來源（只要可能）
            showLowerBracketSlotsOrigin: true, // 是否顯示槽位的起源（在淘汰階段的下括號中） 雙敗淘汰適用
            showPopoverOnMatchLabelClick: true, // 點擊label 出現彈窗
            highlightParticipantOnHover: true, // hover團隊路徑
            // showRankingTable: true // 循環賽階段是否顯示排名表
        }
    )
}

// 注入球員大頭照
function setParticipantImages(tournamentData) {
    bracketsViewer.setParticipantImages(
        tournamentData.participant.map(participant => {
            return {
                participantId: participant.id,
                imageUrl: 'https://github.githubassets.com/pinned-octocat.svg'
            }
        })
    )
}

async function updateFinalResult(match){
  console.log(match)
}

// 點擊match事件處理
function onMatchClicked(bracketsViewer, elementString) {
    bracketsViewer.onMatchClicked = async match => {
        // 新的成績
        const newMatchData = () => renderMatchScore(match)

        console.log(match)
        // Match 沒有凍結才可以輸入成績
        if (!helpers.isMatchUpdateLocked(match)) {
            console.log('-----更新成績-----')
            await updateTournamentMatch(newMatchData())
            const tournamentData = await getStageData(TOURNAMENT_ID)

            // 更新後重新渲染畫面
            renderBracketsViewer(elementString, tournamentData)
            return
        }

        // 淘汰賽 且完成賽事
        if (!helpers.isRoundRobin(bracketsViewer.stage) && helpers.isMatchWinCompleted(match)) {
            console.log('-----當淘汰賽事已完成-----')

            // 勝方改變 需要清除被影響的match
            await cleanNextTournamentMatchByElimination(match.id)

            await updateTournamentMatch(newMatchData())
            const tournamentData = await getStageData(TOURNAMENT_ID)

            // 更新後重新渲染畫面
            renderBracketsViewer(elementString, tournamentData)

            return
        }
    }
}

async function updateTournamentMatch(matchData) {
    try {
        await manager.update.match(matchData)
    } catch (error) {
        console.log(error, matchData)
    }
}

async function getStageData(tournament_id) {
    return await manager.get.stageData(tournament_id)
}

const resultBtnElement = document.querySelector('.result-btn')
const getDataBtnElement = document.querySelector('.get-data-btn')
resultBtnElement.onclick = async e => {
    const result = await manager.get.finalStandings(TOURNAMENT_ID)
    console.log(result) // 獲得最終排名
}
getDataBtnElement.onclick = async e => {
    console.log(await manager.get.stageData(TOURNAMENT_ID))
}

async function resetTournamentMatch(tournament_id, matchId) {
    try {
        await manager.reset.matchResults(matchId)
    } catch (error) {
        console.log(error)
    }
}

// 淘汰賽中 清除影響到的下一場賽事
// 通常用在更新成績前，需要清除影響到的上層腳位
async function cleanNextTournamentMatchByElimination(matchId) {
    // 獲得所有關連賽事
    const nextMatches = await findAllNextMatches(matchId, [], 'DESC')

    await asyncForEach(nextMatches, async match => {
        if (helpers.isMatchCompleted(match)) {
            await updateTournamentMatch(getEmptyMatchResult(match.id))
            await renderBracketsViewer(ELEMENT_STRING, await manager.get.stageData(TOURNAMENT_ID))
        }
    })
}

// 尋找淘汰賽中，所有上層的賽事
async function findAllNextMatches(matchId, reduce = [], sort = 'ASC') {
    const result = reduce // 結果
    const nextMatches = await manager.find.nextMatches(matchId)

    console.log(nextMatches)


    // 若有找到下一場 則繼續用下一場 搜索下一場
    if (nextMatches.length == 1) {
        result.push(nextMatches[0])
        return await findAllNextMatches(nextMatches[0].id, result, sort)
    }

    // 若下一場有複數場 代表已經到冠亞賽
    if (nextMatches.length > 1) {
        result.push(...nextMatches)
    }

    // 用id倒敘 回傳預期從最新
    if (sort === 'DESC') result.sort((a, b) => b.id - a.id)

    // 回傳結果
    return result
}



// match 淘汰賽

// child_count: 0  //
// group_id: 0  // 組別 淘汰賽沒有組別
// id: 1  // match id
// number: 2  // 第幾輪
// opponent1: {
//     i: 3  // team id
//     position: 3
// }
// opponent2: {
//     i: 4  // team id
//     position: 4
// }
// round_id: 0  // 輪次 16強 8強 4強... => 0 1 2 3...
// stage_id: 0  // 階段
// status: 2  // 狀態