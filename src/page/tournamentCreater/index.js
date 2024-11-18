import { TYPE_ENUM, MODE_ENUM } from "./constants";
import { createTournamentManager, renderTournamentViewer, createBracketsViewer, RoundRobin, KnockoutBracket, setParticipantImages, updateMatch, helpers, resetNextMatchByElimination } from "../../TournamentJS";
import { createFakeTeamList, renderMatchScore } from "./utility";

const ELEMENT_STRING = '.brackets-viewer'
const TOURNAMENT_ID = 0
const MATCH_GAME_COUNT = 3

document.addEventListener('DOMContentLoaded', function () {
    const selectType = document.querySelector('.js-select-type');
    const roundForm = document.querySelector('.js-round-form');
    const bracketForm = document.querySelector('.js-bracket-form');
    const hiddenInputRound = roundForm.querySelector('.js-round-form input[name="type"]');
    const hiddenInputBracket = bracketForm.querySelector('.js-bracket-form input[name="type"]');

    // 初始化
    init()

    // 監聽 select 元素的變化
    selectType.addEventListener('change', toggleForms);

    // 攔截 Round 表單的提交事件
    roundForm.addEventListener('submit', function (event) {
        event.preventDefault(); // 停止表單提交
        const formData = new FormData(roundForm);
        if (!validateRoundForm(formData)) return
        submitToDo(formData)
    });

    // 攔截 Bracket 表單的提交事件
    bracketForm.addEventListener('submit', function (event) {
        event.preventDefault(); // 停止表單提交
        const formData = new FormData(bracketForm);
        submitToDo(formData)
    });

    // 初始化
    function init() {
        toggleForms()
    }

    // 定義顯示與隱藏的邏輯
    function toggleForms() {
        const value = selectType.value;
        // 更新隱藏type資料
        updateHiddenInput();

        if (value === TYPE_ENUM.ROUND) {
            roundForm.classList.remove('d-none');
            bracketForm.classList.add('d-none');
        }

        if (value === TYPE_ENUM.BRACKET) {
            roundForm.classList.add('d-none');
            bracketForm.classList.remove('d-none');
        }
    }


    // 更新隱藏輸入框的值
    function updateHiddenInput() {
        const value = selectType.value;
        hiddenInputRound.value = value;
        hiddenInputBracket.value = value;
    }
});

// 獲取排序後的參賽者
function getOrderParticipants(teamsArray, isRound, config) {
    let participants
    // 排序
    if (isRound) {
        const { sort, split, groupCount } = config
        const splitArray = split ? JSON.parse(split) : ''

        try {
            const teamsOrder = new RoundRobin({
                teams: teamsArray,
                groupNum: groupCount,
                sort: sort,
                constraints: splitArray
            }).create()

            participants = teamsOrder.flatMap(item => item.teams);
        } catch (error) {
            // 捕獲錯誤並顯示為 alert
            alert('發生錯誤: ' + error.message);
        }
    } else {
        const { seedNum, fixedSeedNum } = config
        const teams_ = teamsArray.flatMap(item => item.id);
        const seeds_ = teams_.slice(0, seedNum);

        try {
            const teamsOrder = new KnockoutBracket({
                teams: teams_,
                seeds: seeds_,
                fixedSeed: fixedSeedNum
            }).create()

            participants = teamsOrder.map(item => item === null ? item : teamsArray.find(team => team.id === item));
        } catch (error) {
            // 捕獲錯誤並顯示為 alert
            alert('發生錯誤: ' + error.message);
        }
    }

    return participants
}


// 格式化賽事配置
function formatTournamentConfig(formObject) {
    const { type, mode, teamCount, groupCount, roundRobinMode, grandFinal, consolationFinal } = formObject;
    const teamsArray = createFakeTeamList(teamCount)
    const isRound = type === TYPE_ENUM.ROUND
    let type_
    let participants_ = getOrderParticipants(teamsArray, isRound, formObject)

    console.log('participants_', participants_)

    // 設定循環淘汰的參數
    if (isRound) {
        type_ = 'round_robin'
    } else {
        mode === MODE_ENUM.SINGLE && (type_ = 'single_elimination')
        mode === MODE_ENUM.DOUBLE && (type_ = 'double_elimination')
    }

    // 共同參數
    let config = {
        name: 'test',
        type: type_,
        tournamentId: TOURNAMENT_ID,
        matchesChildCount: MATCH_GAME_COUNT,
        participants: participants_,
    }

    if (isRound) {
        config = { ...config, groupCount, roundRobinMode }
    } else {
        config = { ...config, grandFinal, consolationFinal }
    }

    return config
}

// 表單傳送後動作
async function submitToDo(formData) {

    // 取得 FormData 用於查看提交數據
    const formObject = Object.fromEntries(formData.entries());

    // 創建賽事管理工具
    const config = formatTournamentConfig(formObject)

    // 創建賽事管理者
    const manager = await createTournamentManager(config)
    const viewer = createBracketsViewer()

    const tournamentData = await manager.get.stageData(0)
    setParticipantImages(viewer, tournamentData)

    renderViewer(viewer, ELEMENT_STRING, manager, tournamentData)

    const getTournamentButton = document.querySelector('.js-get-tournament-data');
    getTournamentButton.onclick = async () => {
        const tournamentData = await manager.get.stageData(TOURNAMENT_ID)
        console.log('tournamentData', tournamentData)
    }
}

// 渲染比賽畫面
function renderViewer(viewer, elementString, manager, tournamentData) {
    renderTournamentViewer(viewer, elementString, tournamentData, {
        onMatchClick: (match) => onMatchClick(match, viewer, manager),
    })
}

// 點擊比賽時的行為
async function onMatchClick(match, viewer, manager) {
    // 創建隨機比賽資料函數，為了每次點擊重新觸發隨機函數
    const renderMatchData = (match_) => renderMatchScore(match_)

    // 更新比賽資料
    if (helpers.isRoundRobin(viewer.stage)) {
        // 循環賽資料更新
        await updateMatch(renderMatchData(match), manager)
    } else {
        // 淘汰賽資料更新

        // 直接晉級的比賽不更新
        if (helpers.isMatchByeCompleted(match)) return

        // 匹配中的比賽(沒有球員)不更新
        if (helpers.isMatchPending(match)) return

        // 勝方改變 需要清除被影響的match
        await resetNextMatchByElimination(match, manager)
        await manager.reset.matchResults(match.id)
        
        // 更新比賽結果
        await updateMatch(renderMatchData(match), manager, true)
    }


    // 更新比賽畫面
    renderViewer(viewer, ELEMENT_STRING, manager, await manager.get.stageData(0))
}



// 驗證循環賽表單
function validateRoundForm(formData) {
    const splitVal = formData.get('split')
    const groupCount = formData.get('groupCount')
    const teamCount = formData.get('teamCount')
    const maxGroupCount = teamCount % 2 === 0 ? teamCount / 2 : Math.floor(teamCount / 2)

    // 驗證分組條件
    if (!validateSplitInput(splitVal) && splitVal !== '') {
        alert('分組條件格式不正確，請檢查後重新輸入');
        return false;
    }

    // 驗證分組數量
    if (groupCount === '') {
        alert('分組數量錯誤');
        return false;
    }

    // 驗證分組數量
    if (groupCount > maxGroupCount) {
        alert('每組至少需要2隊參賽');
        return false;
    }

    return true
}

// 檢查輸入是否符合格式
function validateSplitInput(input) {
    const regex = /^\[\[(\d+,\d+)(?:,(\d+,\d+))*\]\]$/;
    return regex.test(input);
}