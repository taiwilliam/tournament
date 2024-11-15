// size(通用參數) 參賽者的數量
// seedOrdering(通用參數) 用於設定種子排序方式的列表：
//   循環賽: 必須包含 1 個項目（需加 "groups." 前綴），用於分組分配。
//   簡單淘汰賽: 必須包含 1 個項目（不加 "groups." 前綴），用於第一輪分配。
//   雙敗淘汰賽: 支援 1 個（必須），最多 3+ 個項目（不加 "groups." 前綴）：
//     項目 1：WB 第一輪的分配方式（必須）。
//     項目 2：WB 落敗者在 LB 第一輪的分配方式。
//     項目 3+：WB 落敗者在 LB 次要輪次的分配方式（每輪一個項目）。
//   淘汰賽種子設定 natural 即是不多做排序 指參照participants順序，還有"reverse_half_shift", "reverse", 'reverse_half_shift', 'pair_flip', 'inner_outer'
//   循環賽種子設定 groups.effort_balanced、groups.seed_optimized、groups.bracket_optimized
// matchesChildCount(通用參數) 每場比賽的子項目數量，可用於設定每場比賽的特定參數。
// groupCount(循環賽) 循環賽的分組數量。
// roundRobinMode(循環賽) 循環賽的比賽模式：
//   simple: 每位參賽者與其他參賽者對賽一次。
//   double: 每位參賽者與其他參賽者對賽兩次（主場一次、客場一次）。
// manualOrdering(循環賽) 手動設定每個分組的種子順序（若此參數存在，將忽略自動排序設定）
// balanceByes(淘汰賽) 是否在淘汰賽的種子分配中平衡 BYEs（防止 BYE 對上 BYE）。
// consolationFinal(淘汰賽) 是否提供半決賽失敗者之間的安慰決賽。
// skipFirstRound(淘汰賽) 是否跳過雙敗淘汰賽 WB 的第一輪。
// grandFinal(淘汰賽) 雙敗淘汰賽的冠軍決賽模式：
//   none: 無冠軍決賽。
//   simple: 冠軍決賽為單場比賽，贏家即為該階段的冠軍。
//   double: 若 WB 的冠軍在冠軍決賽中失利，將進行最終決賽。

export const managerConfigSetting = {
  size: '',
  seedOrdering: [], 
  matchesChildCount: '',
  groupCount: '',
  roundRobinMode: 'simple',
  manualOrdering: '',
  balanceByes: false,
  consolationFinal: false,
  skipFirstRound: false,
  grandFinal: 'none',
}