import { InMemoryDatabase } from "brackets-memory-db";
import { BracketsManager } from "brackets-manager";
import "brackets-viewer/dist/brackets-viewer.min.js";
import "brackets-viewer/dist/brackets-viewer.min.css";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);
let data = ''

const size = 8; // 4 / 8 | 16 | 32 | 64 | 128
// const participants = [null, "1", "2", null, "4", "5", null, "6"];
// const participants = ["1","2","3","4","5","6",null,null];
const participants = [
  {
    id: 1,
    tournament_id: 0,
    name: "威廉",
    imageUrl: "https://github.githubassets.com/pinned-octocat.svg"
  },
  {
    id: 2,
    tournament_id: 0,
    name: "凱恩"
  },
  {
    id: 3,
    tournament_id: 0,
    name: "約翰"
  },
  {
    id: 4,
    tournament_id: 0,
    name: "亨利"
  },
  {
    id: 5,
    tournament_id: 0,
    name: "西卡"
  },
  {
    id: 6,
    tournament_id: 0,
    name: "特斯拉"
  },
  {
    id: 7,
    tournament_id: 0,
    name: "愛迪生"
  },
]

const rendering = async () => {
  await manager.create({
    name: "單淘汰賽測試",
    tournamentId: 0,
    type: "single_elimination", // "single_elimination", "double_elimination", "round_robin"
    seeding: participants,
    settings: {
      seedOrdering: ["natural"], // 種子設定 natural 即是不多做排序 指參照participants順序， "reverse_half_shift", "reverse"
      balanceByes: false, // 是否平均分配輪空 避免bye+bye狀況出現
      size: size,
      matchesChildCount: 0,
      consolationFinal: true // 是否要比出三四名
    }
  });
  const tournamentData = await manager.get.stageData(0);
  // setData(tournamentData);
  data = tournamentData;
  console.log("tournamentData:", tournamentData);
  rerendering()
};

const rerendering = async () => {
  const bracketsViewerNode = document.querySelector(".brackets-viewer");
  bracketsViewerNode?.replaceChildren();

  console.log( bracketsViewer)

  if (data && data.participant !== null) {
    // This is optional. You must do it before render().
    bracketsViewer.setParticipantImages(
      data.participant.map((participant) => {
        return {
          participantId: participant.id,
          imageUrl: "https://github.githubassets.com/pinned-octocat.svg"
        }
      })
    );


    bracketsViewer.onMatchClicked = async (match) => {
      console.log("A match was clicked", match);

      try {
        await manager.update.match({
          id: match.id,
          opponent1: { score: 5 },
          opponent2: { score: 7, result: "win" }
        });
        const tourneyData2 = await manager.get.currentMatches(0);
        const tourneyData = await manager.get.stageData(0);
        // setData(tourneyData);
        data = tourneyData
        console.log("A tourney", tourneyData2, tourneyData);
        rerendering()
      } catch (error) {}
    };

    console.log('----render-----')
    bracketsViewer.render(
      {
        stages: data.stage,
        matches: data.match,
        matchGames: data.match_game,
        participants: data.participant
      },
      {
        // customRoundName: (info, t) => {
        //   // You have a reference to `t` in order to translate things.
        //   // Returning `undefined` will fallback to the default round name in the current language.

        //   console.log('---------------------')
        //   console.log(info)
        //   if (info.fractionOfFinal === 1 / 2) {
        //     if (info.groupType === "single-bracket") {
        //       // Single elimination
        //       return "Semi Finals";
        //     } else {
        //       // Double elimination
        //       return `${t(`abbreviations.${info.groupType}`)} ESemi Finals`;
        //     }
        //   }
        //   if (info.fractionOfFinal === 1 / 4) {
        //     return "Quarter Finals";
        //   }

        //   if (info.finalType === "grand-final") {
        //     if (info.roundCount > 1) {
        //       return `${t(`abbreviations.${info.finalType}`)} Final Round ${
        //         info.roundNumber
        //       }`;
        //     }
        //     return `Grand Final`;
        //   }
        // },
        customRoundName: (e) => console.log(e),
        // onMatchClick: matchClickCallback,
        clear: true, // 使否顯示之前的資料
        selector: '.brackets-viewer',
        participantOriginPlacement: "before", // "none" | "before" | "after" UI設定: id的位置
        separatedChildCountLabel: true, // 顯示每個session上的label
        showSlotsOrigin: true, // 是否顯示槽的來源（只要可能）
        showLowerBracketSlotsOrigin: true, // 是否顯示槽位的起源（在淘汰階段的下括號中） 雙敗淘汰適用
        highlightParticipantOnHover: true, // hover團隊路徑
        showRankingTable: true, // 循環賽階段是否顯示排名表
      }
    );
  }
  // console.log(data);
};

async function matchClickCallback(match) {
  console.log("A match was clicked", match);

  try {
    await manager.update.match({
      id: match.id,
      opponent1: { score: 5 },
      opponent2: { score: 7, result: "win" }
    });
    const tourneyData2 = await manager.get.currentMatches(0);
    const tourneyData = await manager.get.stageData(0);
    // setData(tourneyData);
    data = tourneyData
    console.log("A tourney", tourneyData2);
    rerendering()
  } catch (error) {}
};

rendering()