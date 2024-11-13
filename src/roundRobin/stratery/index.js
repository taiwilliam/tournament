import { snakeSort } from './snakeSort'
import { randomSort } from './randomSort'

export const sort_strategy = {
  s: (array, group_num, key) => snakeSort(array, group_num, key),
  r: array => randomSort(array)
}