export function getRandomNumberByRange(start, end) {
    return Math.floor(Math.random() * (end - start) + start)
}

export function renderMatchScore(match) {
    let lose_score = getRandomNumberByRange(0, 3)
    let win_score = 3

    let win = getRandomNumberByRange(0, 2) == 0 ? 'opponent1' : 'opponent2'

    let opponent1_result = win === 'opponent1' ? 'win' : 'lose'
    let opponent2_result = win === 'opponent2' ? 'win' : 'lose'
    let opponent1_score = win === 'opponent1' ? win_score : lose_score
    let opponent2_score = win === 'opponent2' ? win_score : lose_score

    return {
        id: match.id,
        opponent1: {
            score: opponent1_score,
            result: opponent1_result,
            id: match.opponent1.id,
            position: match.opponent1.position
        },
        opponent2: {
            score: opponent2_score,
            result: opponent2_result,
            id: match.opponent2.id,
            position: match.opponent2.position
        }
    }
}

// 創建假的隊伍列表
export const createFakeTeamList = (count) => {
    const list = []
    for (let i = 0; i < count; i++) {
        list.push({
            id: i + 1,
            points: getRandomNumber(),
            name: generateRandomEnglishName(),
        })
    }
    return list
}

// 隨機生成英文名字
function generateRandomEnglishName() {
    const firstNames = [
        "John", "Emily", "Michael", "Sarah", "David", "Jessica",
        "Daniel", "Ashley", "James", "Emma", "Matthew", "Olivia",
        "Christopher", "Sophia", "Andrew", "Isabella", "Joshua", "Mia",
        "Alexander", "Amelia", "Ethan", "Charlotte", "William", "Harper",
        "Logan", "Ava", "Benjamin", "Liam", "Jacob", "Abigail",
        "Noah", "Chloe", "Lucas", "Elizabeth", "Samuel", "Grace",
        "Henry", "Evelyn", "Jack", "Hannah", "Levi", "Lily",
        "Owen", "Scarlett", "Mason", "Ella", "Elijah", "Victoria"
    ];

    const lastNames = [
        "Smith", "Johnson", "Brown", "Williams", "Jones", "Garcia",
        "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez",
        "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor",
        "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
        "White", "Harris", "Sanchez", "Clark", "Lewis", "Robinson",
        "Walker", "Young", "Allen", "King", "Scott", "Torres",
        "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson",
        "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter",
        "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz"
    ];

    // 隨機選擇一個名字和姓氏
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

function getRandomNumber() {
    return Math.floor(Math.random() * 3000) + 1;
}

export async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}