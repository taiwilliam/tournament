export function getRandomNumberByRange(start, end){
  return Math.floor(Math.random() * (end - start) + start)
}

export function renderScore(oppo = [], oppo2 = []) {
  let lose_score = getRandomNumberByRange(0, 3)
  let win_score = 3

  let win = getRandomNumberByRange(0, 2) == 0 ? 'opponent1' : 'opponent2'

  let opponent1_result = win === 'opponent1' ? 'win' : 'lose'
  let opponent2_result = win === 'opponent2' ? 'win' : 'lose'
  let opponent1_score = win === 'opponent1' ? win_score : lose_score
  let opponent2_score = win === 'opponent2' ? win_score : lose_score

  return {
      opponent1: { score: opponent1_score, result: opponent1_result, ...oppo },
      opponent2: { score: opponent2_score, result: opponent2_result, ...oppo2 }
  }
}