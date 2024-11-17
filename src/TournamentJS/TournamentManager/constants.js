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
// matchesChildCount(通用參數) 每場比賽的子項目數量，可用於設定每場比賽的特定參數，顯示幾戰幾勝中的幾勝 BO1、BO3、BO5，BO3即五戰三勝
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


// 1. onMatchClick?: MatchClickCallback
// 功能: 當比賽被點擊時調用的回調函數。
// 使用場景: 用來處理用戶點擊比賽時的行為，例如顯示比賽詳細資訊。
// 2. onMatchLabelClick?: MatchClickCallback
// 功能: 當比賽標籤被點擊時調用的回調函數。
// 使用場景: 用來處理用戶點擊比賽標籤時的行為，通常是顯示比賽的更多信息或相關操作。
// 3. customRoundName?: (...args: Parameters<RoundNameGetter>) => ReturnType<RoundNameGetter> | undefined
// 功能: 用來深度自定義回合的名稱。若只需要翻譯某些單詞，建議使用 addLocale() 函數。
// 使用場景: 用來定制回合名稱顯示方式，適合用於不同語言或格式需求。
// 4. selector?: string
// 功能: 可選的選擇器，用於選擇根元素。
// 使用場景: 若需要自定義根元素的選擇方式，或者需要將配置應用於特定的 DOM 元素。
// 5. participantOriginPlacement?: Placement
// 功能: 定義參賽者名稱中參賽者的位置顯示方式：
// none: 不顯示位置。
// before: 在參賽者名稱前顯示位置，例如 #1 Team。
// after: 在參賽者名稱後顯示位置，例如 Team (#1)。
// 使用場景: 用來控制參賽者名稱與位置顯示的格式。
// 6. separatedChildCountLabel?: boolean
// 功能: 控制比賽標籤是否單獨顯示子遊戲數量：
// false: 比賽標籤和子遊戲數量顯示在同一位置（例如 "M1.1, Bo3"）。
// true: 比賽標籤和子遊戲數量顯示在不同位置（例如 "M1.1 (right-->) Bo3"）。
// 使用場景: 用來調整比賽標籤和子遊戲數量顯示的位置。
// 7. showSlotsOrigin?: boolean
// 功能: 是否顯示比賽插槽的來源（如果可能）。
// 使用場景: 用來顯示比賽插槽的來源信息，可能在多個階段的比賽中有所區分。
// 8. showLowerBracketSlotsOrigin?: boolean
// 功能: 是否顯示下半區（淘汰賽階段）插槽的來源。
// 使用場景: 在淘汰賽階段，顯示參賽者來源的詳細信息。
// 9. showPopoverOnMatchLabelClick?: boolean
// 功能: 當點擊包含子遊戲的比賽標籤時顯示彈出層。
// 使用場景: 用來在點擊比賽標籤時展示額外的比賽或子遊戲資訊。
// 10. highlightParticipantOnHover?: boolean
// 功能: 是否在鼠標懸停時高亮顯示每個參賽者。
// 使用場景: 用來在用戶懸停在參賽者名稱上時進行視覺上的高亮顯示。
// 11. showRankingTable?: boolean
// 功能: 是否顯示回合賽階段的排名表。
// 使用場景: 用來在回合賽階段顯示參賽者的排名表格。
// 12. clear?: boolean
// 功能: 是否清除先前顯示的所有數據。
// 使用場景: 用來重置或清除比賽中的所有顯示數據，通常用於重新載入或初始化狀態。

export const viewerConfig = {
  // 當比賽被點擊時調用的回調函數
  onMatchClick: () => {},

  // 當比賽標籤被點擊時調用的回調函數
  onMatchLabelClick: () => {},

  // 自定義回合名稱的函數
  customRoundName: () => {},

  // 選擇器，用於選擇根元素
  selector: 'string',

  // 參賽者名稱中顯示位置的方式 // "none" | "before" | "after" UI設定: id的位置
  participantOriginPlacement: 'before', 

  // 控制是否單獨顯示子遊戲數量
  separatedChildCountLabel: true,

  // 是否顯示插槽的來源
  showSlotsOrigin: true,

  // 是否顯示淘汰賽階段插槽的來源
  showLowerBracketSlotsOrigin: true,

  // 是否顯示點擊比賽標籤時的彈出層
  showPopoverOnMatchLabelClick: true,

  // 是否在鼠標懸停時高亮顯示參賽者
  highlightParticipantOnHover: true,

  // 是否顯示回合賽階段的排名表
  showRankingTable: true,

  // 是否清除先前顯示的所有數據
  clear: true,
}


export const ROUND_NAME_STRATEGY = {
  'round-robin': () => {}, // 循環賽
  'single-bracket': () => {}, // 單敗淘汰賽
  'winner-bracket': () => {}, // 雙敗淘汰賽 - 勝部
  'loser-bracket': () => {}, // 雙敗淘汰賽 - 敗部
}
