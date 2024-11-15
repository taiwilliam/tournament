import { InMemoryDatabase } from 'brackets-memory-db'
import { BracketsManager, helpers } from 'brackets-manager'
import { managerConfigSetting } from './constants'

// 創建賽程管理工具
export async function createTournamentManager(
    config = {
        // 通用參數
        name: '', // 賽事名稱
        tournamentId: '', // 賽事ID
        type: '', // "single_elimination", "double_elimination", "round_robin"
        participants: [], // 參賽者
        // 循環賽
        groupCount: '', // 循環賽的分組數量
        roundRobinMode: 'simple', // 循環賽的比賽模式：simple, double
        // 淘汰賽
        grandFinal: 'none', // 雙敗淘汰賽的冠軍決賽模式 
        //   none: 無冠軍決賽。
        //   simple: 冠軍決賽為單場比賽，贏家即為該階段的冠軍。
        //   double: 若 WB 的冠軍在冠軍決賽中失利，將進行最終決賽。
        consolationFinal: false, // 是否要比出三四名
        skipFirstRound: false, // 是否跳過雙敗淘汰賽首輪，將後面半部的選手直接視為敗部
    }
) {
    if(!config) {
        throw new Error('config is required')
    }
    if(!config.name, !config.type, !config.participants, !config.tournamentId) {
        throw new Error('name, type, participants, tournamentId are required')
    }
    if(config.type === 'round_robin' && !config.groupCount) {
        throw new Error('groupCount is required')
    }

    // InMemoryDatabase 類的作用是實現一個基於記憶體的資料庫 為了將接下來的manager物件模擬成一個資料庫
    const storage = new InMemoryDatabase()
    // BracketsManager 類是賽事管理工具的核心類
    const manager = new BracketsManager(storage)
    // 格式化賽事參數
    const config = formatTournamentConfig(config)

    // 創建賽事管理者
    return await manager.create.stage(config)
}

// 格式化賽事參數
function formatTournamentConfig(config) {
    // 種子排序及輪空分配 都交由TournamentJS處理所以這裡不需要考慮
    const size = config.participants.length // 參賽者數量依賴傳入的參賽者總數
    const seedOrdering = ['natural'] // 不用做任何排序
    const balanceByes = false // 不用填入輪空

    return {
        name: config.name,
        tournamentId: config.tournamentId,
        type: config.type,
        seeding: config.participants,
        settings: {
            size,
            seedOrdering, 
            balanceByes,
            // 循環賽
            groupCount: config.groupCount,
            roundRobinMode: config.roundRobinMode,
            // 淘汰賽
            grandFinal: config.grandFinal,
            consolationFinal: config.consolationFinal,
            skipFirstRound: config.skipFirstRound,
        }
    }
}
