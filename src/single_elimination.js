import { InMemoryDatabase } from 'brackets-memory-db'
import { BracketsManager, helpers } from 'brackets-manager'
import 'brackets-viewer/dist/brackets-viewer.min.js'
import 'brackets-viewer/dist/brackets-viewer.min.css'
import { renderScore } from './utils'

// ParticipantResult
// id: number | null 如果是null 則參與者待訂
// position: number 參與者來自哪裡
// result: 結果 'win' | 'draw' | 'loss'
// score: 分數 number
// forfeit: 棄賽 boolean 另一邊自動獲勝

// opponent1: { score: 0, result: '' },
// opponent2: { score: 0, result: '', forfeit: true }

const storage = new InMemoryDatabase()
const manager = new BracketsManager(storage)

const size = 8 // 4 / 8 | 16 | 32 | 64 | 128
// 注入參賽隊伍資料
const participants = [
    {
        id: 1,
        tournament_id: 0,
        name: '威廉'
    },
    {
        id: 2,
        tournament_id: 0,
        name: '凱恩'
    },
    {
        id: 3,
        tournament_id: 0,
        name: '約翰'
    },
    {
        id: 4,
        tournament_id: 0,
        name: '亨利'
    },
    {
        id: 5,
        tournament_id: 0,
        name: '西卡'
    },
    {
        id: 6,
        tournament_id: 0,
        name: '特斯拉'
    },
    {
        id: 7,
        tournament_id: 0,
        name: '愛迪生'
    }
]

// 創建賽事管理者 createBracketsManager return一個tournamentData
const tournamentData = await createBracketsManager(0)
// 1. 利用// tournamentData.match 創建後端match資料表

// 2. 渲染賽程圖
initBracketsViewer('.brackets-viewer', tournamentData)

async function createBracketsManager(tournamentId) {
    await manager.create.stage({
        name: '雙敗淘汰賽測試',
        tournamentId: tournamentId, // 賽事ID
        type: 'single_elimination', // "single_elimination", "double_elimination", "round_robin"
        seeding: participants,
        settings: {
            seedOrdering: ['natural'], // 種子設定 natural 即是不多做排序 指參照participants順序， "reverse_half_shift", "reverse"
            balanceByes: false, // 是否平均分配輪空
            size: size, // 淘汰賽尺寸
            consolationFinal: true, // 半決賽負者之間可選的決賽
            skipFirstRound: false, // 是否跳過雙敗淘汰賽首輪，將後面半部的選手直接視為敗部
            matchesChildCount: 3, //顯示幾戰幾勝 中的幾勝 BO1、BO3、BO5 ， BO3即五戰三勝
            showPopoverOnMatchLabelClick: true, // 點擊label 出現彈窗
            grandFinal: 'double',
            // - If `none` 則沒有總決賽
            // - If `simple` 則決賽為單場比賽，勝利者就是舞台的勝利者，勝者會變單淘汰
            // - If `double` 勝者如果輸了，則可以再次進行決賽 (更為公平，所有選手都要雙敗才會出局)
            consolationFinal: true // 是否要比出三四名
        }
    })

    return await manager.get.stageData(tournamentId) // 用tournamentId獲取階段數據 為一個Promise
}

async function initBracketsViewer(elementString, tournamentData = null) {
    // 渲染前必須清除畫面元素
    clearViewElement(elementString)

    // 防呆
    if (!tournamentData || tournamentData.participant == null) return

    // 注入球員頭貼資訊
    setParticipantImages(tournamentData)

    onMatchClicked(bracketsViewer, elementString)

    renderBracketsViewer(elementString, tournamentData)
}

async function renderBracketsViewer(elementString, tournamentData) {
    // 渲染前必須清除畫面元素
    clearViewElement(elementString)

    bracketsViewer.render(
        {
            stages: tournamentData?.stage,
            matches: tournamentData?.match,
            matchGames: tournamentData?.match_game,
            participants: tournamentData?.participant
        },
        {
            clear: true, // 使否清除之前的資料
            selector: elementString,
            participantOriginPlacement: 'before', // "none" | "before" | "after" UI設定: id的位置
            separatedChildCountLabel: true, // 顯示每個session上的label
            showSlotsOrigin: true, // 是否顯示槽的來源（只要可能）
            showLowerBracketSlotsOrigin: true, // 是否顯示槽位的起源（在淘汰階段的下括號中） 雙敗淘汰適用
            highlightParticipantOnHover: true, // hover團隊路徑
            showRankingTable: true // 循環賽階段是否顯示排名表
        }
    )
}

function clearViewElement(elementString) {
    const bracketsViewerNode = document.querySelector(elementString)
    bracketsViewerNode?.replaceChildren()
}

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

function onMatchClicked(bracketsViewer, elementString) {
    bracketsViewer.onMatchClicked = async match => {
        // 新的成績
        const newMatchData = () => ({
            id: match.id,
            ...renderScore(match.opponent1, match.opponent2)
        })

        // Match 沒有凍結才可以輸入成績
        if (!helpers.isMatchUpdateLocked(match)) {
            const tournamentData = await updateTournamentMatch(bracketsViewer.stage.id, newMatchData())

            // 更新後重新渲染畫面
            renderBracketsViewer(elementString, tournamentData)
        }

        console.log('新的成績',newMatchData())
        // 淘汰賽 且完成賽事
        if (!helpers.isRoundRobin(bracketsViewer.stage) && helpers.isMatchWinCompleted(match)) {
            console.log('淘汰賽且完成賽事')
            // 如果勝方沒變 只要更新賽事成績即可
            console.log(helpers.getWinner(newMatchData()))
            console.log(helpers.getWinner(match))
        }
    }
}

async function updateTournamentMatch(tournament_id, data) {
    try {
        await manager.update.match(data)
        return await manager.get.stageData(tournament_id)
    } catch (error) {
        console.log(error)
    }
}
