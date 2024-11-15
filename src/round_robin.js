import { InMemoryDatabase } from 'brackets-memory-db'
import { BracketsManager, helpers } from 'brackets-manager'
import 'brackets-viewer/dist/brackets-viewer.min.js'
import 'brackets-viewer/dist/brackets-viewer.min.css'
import { renderMatchScore } from './utils'
import { participants_16, group_data } from './data'
import { RoundRobin, KnockoutBracket } from './TournamentJS'

const bracket = new KnockoutBracket({
    teams: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    seeds: [1,2,3,4],
    fixedSeed: 4
})

console.log(bracket.create())

// const group = new RoundRobin({
//     teams: group_data,
//     groupNum: 4,
//     sort: 'r',
//     constraints: [
//         [1, 2, 3, 5],
//         [4, 6, 7, 8],
//         [11, 12 , 13, 14],
//     ]
// })

// console.log(group.create(), participants_16)

const storage = new InMemoryDatabase()
const manager = new BracketsManager(storage)

const TOURNAMENT_ID = 0
// 注入參賽隊伍資料
const PARTICIPANTS = participants_16
const ELEMENT_STRING = '.brackets-viewer'
const STAGE_TYPE = 'round_robin'
const SIZE = 16 // 4 / 8 | 16 | 32 | 64 | 128

// 1. 創建賽事管理者 createBracketsManager return一個tournamentData
await createBracketsManager(TOURNAMENT_ID)

// 2. 利用// tournamentData.match 創建後端match資料表
console.log(await getStageData(TOURNAMENT_ID))

// 3. 渲染賽程圖
initBracketsViewer(ELEMENT_STRING, await getStageData(TOURNAMENT_ID))

async function createBracketsManager(tournamentId) {
    // await manager.create.stage({
    await manager.create.stage({
        name: '循環賽測試',
        tournamentId: tournamentId, // 賽事ID
        type: STAGE_TYPE, // "single_elimination", "double_elimination", "round_robin"
        seeding: PARTICIPANTS,
        settings: {
            seedOrdering: ['natural'], // 種子設定 natural 即是不多做排序 指參照participants順序， "reverse_half_shift", "reverse"
            balanceByes: false, // 是否平均分配輪空
            size: SIZE, // 淘汰賽尺寸，循環賽總人數
            groupCount: 4, // 分成幾組 round_robin 專用
            roundRobinMode: 'double', // simple:單循環、double: 雙循環
            grandFinal: 'double', // 使否決賽勝方要打兩場
            matchesChildCount: 3, //顯示幾戰幾勝 中的幾勝 BO1、BO3、BO5 ， BO3即五戰三勝
            consolationFinal: 'double'
            // - If `none` 則沒有總決賽
            // - If `simple` 則決賽為單場比賽，勝利者就是舞台的勝利者，勝者會變單淘汰
            // - If `double` 勝者如果輸了，則可以再次進行決賽
        }
    })
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
        // 新的成績
        const newMatchData = () => renderMatchScore(match)
        console.log(match)

        // Match 沒有凍結才可以輸入成績
        if (!helpers.isMatchUpdateLocked(match)) {
            console.log('-----更新成績-----')
            await updateTournamentMatch(newMatchData())
            const tournamentData = await getStageData(TOURNAMENT_ID)
            console.log(tournamentData)

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