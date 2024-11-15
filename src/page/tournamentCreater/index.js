import { TYPE_ENUM } from "./constants";
import { createTournamentManager } from "./TournamentManager";

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
    roundForm.addEventListener('submit', function(event) {
        event.preventDefault(); // 停止表單提交

        // 取得 FormData 用於查看提交數據
        const formData = new FormData(roundForm);
        const formObject = Object.fromEntries(formData.entries());
        console.log(formObject)

        console.log(createTournamentManager())
    });

    // 攔截 Bracket 表單的提交事件
    bracketForm.addEventListener('submit', function(event) {
        event.preventDefault(); // 停止表單提交

        // 取得 FormData 用於查看提交數據
        const formData = new FormData(bracketForm);
        const formObject = Object.fromEntries(formData.entries());
        console.log(formObject)
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
    
        if (value === TYPE_ENUM.SINGLE_ROUND || value === TYPE_ENUM.DOUBLE_ROUND) {
            roundForm.classList.remove('d-none');
            bracketForm.classList.add('d-none');
        }
    
        if (value === TYPE_ENUM.SINGLE_BRACKET || value === TYPE_ENUM.DOUBLE_BRACKET) {
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

