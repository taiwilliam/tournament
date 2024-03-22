import { InMemoryDatabase } from 'brackets-memory-db'
import { BracketsManager, helpers } from 'brackets-manager'
import 'brackets-viewer/dist/brackets-viewer.min.js'
import 'brackets-viewer/dist/brackets-viewer.min.css'

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
        type: 'double_elimination', // "single_elimination", "double_elimination", "round_robin"
        seeding: participants,
        settings: {
            seedOrdering: ['natural'], // 種子設定 natural 即是不多做排序 指參照participants順序， "reverse_half_shift", "reverse"
            balanceByes: false, // 是否平均分配輪空
            size: size, // 淘汰賽尺寸
            grandFinal: 'double', // 使否決賽勝方要打兩場
            matchesChildCount: 3, //顯示幾戰幾勝 中的幾勝 BO1、BO3、BO5 ， BO3即五戰三勝
            consolationFinal: false // 雙敗淘汰賽 冠軍賽 勝方必定要輸兩場
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
        // Match 沒有凍結才可以輸入成績
        if (!helpers.isMatchUpdateLocked(match)) {
            const tournamentData = await updateTournamentMatch(bracketsViewer.stage.id, {
                id: match.id,
                opponent1: { score: 3, result: 'win' },
                opponent2: { score: 0 }
            })

            // 更新後重新渲染畫面
            renderBracketsViewer(elementString, tournamentData)

            console.log(helpers.getFractionOfFinal(1,2))
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
