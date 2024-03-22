import { InMemoryDatabase } from 'brackets-memory-db'
import { BracketsManager, helpers } from 'brackets-manager'
import 'brackets-viewer/dist/brackets-viewer.min.js'
import 'brackets-viewer/dist/brackets-viewer.min.css'
import { renderScore } from './utils'

const storage = new InMemoryDatabase()
const manager = new BracketsManager(storage)

const size = 9 // 4 / 8 | 16 | 32 | 64 | 128
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
    },
    {
        id: 8,
        tournament_id: 0,
        name: '龔利'
    },
    {
        id: 9,
        tournament_id: 0,
        name: '亭妤'
    }
]

// 1. 創建賽事管理者 createBracketsManager return一個tournamentData
const tournamentData = await createBracketsManager(0)

// 2. 利用// tournamentData.match 創建後端match資料表
console.log(tournamentData.match) // 這筆資料需要存進draw欄位

// 3. 渲染賽程圖
initBracketsViewer('.brackets-viewer', tournamentData)

async function createBracketsManager(tournamentId) {
    await manager.create.stage({
        name: '循環賽測試',
        tournamentId: tournamentId, // 賽事ID
        type: 'round_robin', // "single_elimination", "double_elimination", "round_robin"
        seeding: participants,
        settings: {
            seedOrdering: ['natural'], // 種子設定 natural 即是不多做排序 指參照participants順序， "reverse_half_shift", "reverse"
            balanceByes: false, // 是否平均分配輪空
            size: size, // 淘汰賽尺寸，循環賽總人數
            groupCount: 2, // 分成幾組 round_robin 專用
            roundRobinMode: 'simple', // simple:單循環、double: 雙循環
            grandFinal: 'double', // 使否決賽勝方要打兩場
            matchesChildCount: 3, //顯示幾戰幾勝 中的幾勝 BO1、BO3、BO5 ， BO3即五戰三勝
            consolationFinal: 'double'
            // - If `none` 則沒有總決賽
            // - If `simple` 則決賽為單場比賽，勝利者就是舞台的勝利者，勝者會變單淘汰
            // - If `double` 勝者如果輸了，則可以再次進行決賽
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
            customRoundName: (...arg) => {
                console.log(arg)
            },
            clear: true, // 使否清除之前的資料
            selector: elementString,
            participantOriginPlacement: 'before', // "none" | "before" | "after" UI設定: id的位置
            separatedChildCountLabel: true, // session上的label 資訊是否放在同一邊 true: Bo3 會顯示在右邊
            showSlotsOrigin: true, // 是否顯示槽的來源（只要可能）
            showLowerBracketSlotsOrigin: true, // 是否顯示槽位的起源（在淘汰階段的下括號中） 雙敗淘汰適用
            highlightParticipantOnHover: true, // hover團隊路徑
            showPopoverOnMatchLabelClick: true, // 點擊label 出現彈窗
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
                ...renderScore()
            })

            // 更新後重新渲染畫面
            renderBracketsViewer(elementString, tournamentData)
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
