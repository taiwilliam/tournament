import { regroupWithConstraints } from './regroupWithConstraints'
import { createRoundRobin } from './createRoundRobin'

// 循環賽分組器
export default class TeamGrouper {
    constructor({
        teams, 
        groupNum = Number, 
        sort = '', 
        sortKey = 'points', 
        constraints = []
    }) {
        if (sort !== 'r' && sort !== 's' && sort !== '') {
            throw new Error("Invalid sort! Allowed values are 'r', 's', or ''.");
        }

        this.teams = teams;
        this.groupNum = groupNum;
        this.sort = sort;
        this.sortKey = sortKey;
        this.constraints = constraints;
        this.groups = [];
    }

    updateConstraints(constraints) {
        this.constraints = constraints
    }

    getGroups() {
        return this.groups
    }

    create() {
        this.groups = createRoundRobin(
            this.teams, 
            this.groupNum, 
            this.sort, 
            this.sortKey
        )

        // 若有限制條件，則進行分組
        if(this.constraints.length > 0) {
            this.regroup()
        }

        return this.groups
    }

    regroup() {
        if(this.groups.length === 0) {
            // 請先執行 create() 方法
            throw new Error('Please run create method first!')
        }

        this.groups = regroupWithConstraints(
            this.groups,
            this.groupNum,
            this.constraints
        )
    }
}


