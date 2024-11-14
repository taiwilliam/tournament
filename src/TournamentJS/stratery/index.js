import { snakeSort } from './snakeSort'
import { randomSort } from './randomSort'

const sort_strategy = {
  s: (array, group_num, key) => snakeSort(array, group_num, key),
  r: array => randomSort(array)
}

export {
  sort_strategy,
  snakeSort,
  randomSort
}