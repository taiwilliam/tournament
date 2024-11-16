

// 創建假的隊伍列表
export const createFakeTeamList = (count) => {
    const list = []
    for (let i = 0; i < count; i++) {
        list.push({
            id: i + 1,
            points: getRandomNumber(),
            name: generateRandomEnglishName()
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