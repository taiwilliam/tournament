import { TYPE_ENUM, MODE_ENUM } from "./constants";
import { createConfig, createStorage, createManager, renderTournamentViewer, createBracketsViewer, RoundRobin, KnockoutBracket, setParticipantImages, updateMatch, helpers, resetNextMatchByElimination } from "../../TournamentJS";
import { createFakeTeamList, renderMatchScore } from "./utility";

const ELEMENT_STRING = '.brackets-viewer' // 賽程圖顯示器的根元素 必須有這個class才能渲染
const PREVIEW_ELEMENT_STRING = '#preview-view'
const SHOW_ELEMENT_STRING = '#show-view'
const TEAM_ELEMENT_STRING = '.team-viewer'
const TOURNAMENT_ID = 0
const MATCH_GAME_COUNT = 3
const STORAGE_KEY = 'tournament'

document.addEventListener('DOMContentLoaded', function () {
    const selectType = document.querySelector('.js-select-type');
    const roundForm = document.querySelector('.js-round-form');
    const bracketForm = document.querySelector('.js-bracket-form');
    const hiddenInputRound = roundForm.querySelector('.js-round-form input[name="type"]');
    const hiddenInputBracket = bracketForm.querySelector('.js-bracket-form input[name="type"]');
    const renderTournamentBtn = document.querySelector('.js-render-tournament-data');

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

    // 點擊渲染儲存賽事按鈕
    renderTournamentBtn.onclick = () => renderTournamentBtnTodo()

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

// 渲染賽事按鈕行為
function renderTournamentBtnTodo() {
    const data = localStorage.getItem(STORAGE_KEY)
    const tournamentData = JSON.parse(data)
    if(data == null) return alert('沒有賽事資料,請先創建並儲存賽事')

    // 創建賽事庫
    const storage = createStorage(tournamentData)
    // 創建賽事管理者
    const manager = createManager(storage)
    // 創建賽事管理者
    const viewer = createBracketsViewer()
    setParticipantImages(viewer, tournamentData)
    renderTournamentViewer(viewer, SHOW_ELEMENT_STRING, tournamentData, {
        onMatchClick: (match) => onMatchClick(match, viewer, manager, SHOW_ELEMENT_STRING),
    })

    // 顯示彈窗
    const modal = new bootstrap.Modal(document.getElementById('fullscreenModal'));
    modal.show();
}

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

// 渲染參賽隊伍
function renderTeams(participants, elementString) {
    const teamViewer = document.querySelector(elementString)

    // 清空參賽隊伍
    teamViewer.innerHTML = ''
    participants.forEach((participant, index) => {
        if (participant === null) return
        const team = document.createElement('div')
        team.classList.add(`js-team-hover`,'p-1','fs-8', 'border', 'hover-gray')
        team.setAttribute('data-id', participant.id);
        team.setAttribute('data-name', participant.name);
        team.setAttribute('data-points', participant.points);

        const name = document.createElement('span')
        name.classList.add('mx-1')
        name.innerHTML = `${participant.name}`

        const id = document.createElement('span')
        id.classList.add('fw-bold')
        id.innerHTML = `${participant.id}.`

        const points = document.createElement('span')
        points.classList.add('text-danger')
        points.innerHTML = `(${participant.points})`

        team.prepend(points)
        team.prepend(name)
        team.prepend(id)
        teamViewer.appendChild(team)
    })
}


// 格式化賽事配置
function formatTournamentConfig(formObject) {
    const { type, mode, teamCount, groupCount, roundRobinMode, grandFinal, consolationFinal } = formObject;
    const teamsArray = createFakeTeamList(teamCount)
    const isRound = type === TYPE_ENUM.ROUND
    let type_
    let participants_ = getOrderParticipants(teamsArray, isRound, formObject)

    // 渲染球員資訊
    renderTeams(participants_, TEAM_ELEMENT_STRING)

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
    // 賽事參數格式化
    const parameter = formatTournamentConfig(formObject)

    // 創建賽事庫
    const storage = createStorage()
    // 創建賽事管理者
    const manager = createManager(storage)
    // 獲取賽事配置參數
    const config = createConfig(parameter)

    // 初始化賽事管理者(注入賽事配置參數)
    await manager.create.stage(config)
    // 初始化賽程圖顯示器
    const viewer = createBracketsViewer()

    const tournamentData = await manager.get.stageData(0)
    setParticipantImages(viewer, tournamentData)

    renderViewer(viewer, PREVIEW_ELEMENT_STRING, manager, tournamentData)

    const getTournamentButton = document.querySelector('.js-get-tournament-data');
    const saveTournamentBtn = document.querySelector('.js-save-tournament-data');

    getTournamentButton.onclick = async () => {
        const tournamentData = await manager.get.stageData(TOURNAMENT_ID)
        console.log('tournamentData', tournamentData)
    }

    saveTournamentBtn.onclick = async () => {
        const tournamentData = await manager.get.stageData(TOURNAMENT_ID)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tournamentData))
        alert('賽事資料已儲存成功')
    }
}

// 渲染比賽畫面
function renderViewer(viewer, elementString, manager, tournamentData) {
    renderTournamentViewer(viewer, elementString, tournamentData, {
        onMatchClick: (match) => onMatchClick(match, viewer, manager, elementString),
    })

    // 渲染參賽隊伍顯示效果
    setTeamNameHover()
}


function setTeamNameHover() {
    const teamsEl = document.querySelectorAll('.js-team-hover');

    teamsEl.forEach(element => {
        const id = element.getAttribute('data-id');
        const target = document.querySelector(`[data-participant-id="${id}"]`);
        element.addEventListener('mouseover', () => {
            target.classList.add('bg-gray')
        });
    
        element.addEventListener('mouseout', () => {
            target.classList.remove('bg-gray')
        });
    })
}

// 點擊比賽時的行為
async function onMatchClick(match, viewer, manager, elementString) {
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
    renderViewer(viewer, elementString, manager, await manager.get.stageData(0))
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