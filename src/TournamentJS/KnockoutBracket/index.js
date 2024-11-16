import { createBracket } from './createBracket'

// 淘汰賽分組器
//   參數：
//   teams: 隊伍陣列
//   seeds: 種子選手陣列
//   fixedSeed: 固定的種子序(所謂固定就是依照蛇形排列的方式排序種子，但有些情況你可能只需要前四種子固定，5~8種子隨機這時就可以填入4，代表前四種子固定，5~8種子隨機, 預設情況下所有填入的種子都是固定的)
export class KnockoutBracket {
    constructor({
        teams, 
        seeds = [], 
        fixedSeed = seeds.length, 
    }) {
        if (teams.length < 2) {
            throw new Error('The number of teams must be greater than 1.');
        }

        const fixedSeed_ = fixedSeed ? Number(fixedSeed) : seeds.length

        this.teams = teams;
        this.seeds = seeds;
        this.fixedSeed = fixedSeed_;
        this.bracket = [];
    }

    get() {
        return this.bracket
    }

    create() {
        this.bracket = createBracket(
            this.teams, 
            this.seeds, 
            this.fixedSeed,
        )

        return this.bracket
    }
}
