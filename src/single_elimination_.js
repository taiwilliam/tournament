import { InMemoryDatabase } from 'brackets-memory-db'
import { BracketsManager, helpers } from 'brackets-manager'
import 'brackets-viewer/dist/brackets-viewer.min.js'
import 'brackets-viewer/dist/brackets-viewer.min.css'
import { renderMatchScore, asyncForEach, clearViewElement, getRandomNumberByRange } from './utils'
import { participants_4, participants_8 } from './data'

const storage = new InMemoryDatabase()
const manager = new BracketsManager(storage)

console.log('init:', manager, storage)

const size = 8 // 4 / 8 | 16 | 32 | 64 | 128
const participants = [null, "1", "2", null, "4", "5", null, "6"]

const rerendering = async () => {
    const bracketsViewerNode = document.querySelector('.brackets-viewer')
    bracketsViewerNode?.replaceChildren()
    let data = await manager.get.stageData(0)

    // window.bracketsViewer.onMatchClicked = async (match) => {
    window.bracketsViewer.onMatchClicked = async match => {
        console.log('A match was clicked', match)

        try {
            await manager.update.match({
                id: match.id,
                opponent1: { score: getRandomNumberByRange(0, 5) },
                opponent2: { score: 7, result: 'win' }
            })
            const tourneyData2 = await manager.get.currentMatches(0)
            const tourneyData = await manager.get.stageData(0)
            // console.log(tourneyData)
            await rerendering()
            console.log('A tourney', tourneyData2)
            // console.log(tourneyData);
        } catch (error) {}
    }

    if (data && data.participant !== null) {
        // This is optional. You must do it before render().
        window.bracketsViewer.setParticipantImages(
            data.participant.map(participant => ({
                participantId: participant.id || 1,
                imageUrl: 'https://github.githubassets.com/pinned-octocat.svg'
            }))
        )

        window.bracketsViewer.render(
            {
                stages: data.stage,
                matches: data.match,
                matchGames: data.match_game,
                participants: data.participant
            },
            {
                customRoundName: (info, t) => {
                    // You have a reference to `t` in order to translate things.
                    // Returning `undefined` will fallback to the default round name in the current language.
                    if (info.fractionOfFinal === 1 / 2) {
                        if (info.groupType === 'single-bracket') {
                            // Single elimination
                            return 'Semi Finals'
                        } else {
                            // Double elimination
                            return `${t(`abbreviations.${info.groupType}`)} ESemi Finals`
                        }
                    }
                    if (info.fractionOfFinal === 1 / 4) {
                        return 'Quarter Finals'
                    }

                    if (info.finalType === 'grand-final') {
                        if (info.roundCount > 1) {
                            return `${t(`abbreviations.${info.finalType}`)} Final Round ${
                                info.roundNumber
                            }`
                        }
                        return `Grand Final`
                    }
                },
                participantOriginPlacement: 'before',
                separatedChildCountLabel: true,
                showSlotsOrigin: true,
                showLowerBracketSlotsOrigin: true,
                highlightParticipantOnHover: true
            }
        )
    }
    // console.log(data);
}

const rendering = async () => {
    await manager.create({
        name: 'Tournament Brackets',
        tournamentId: 0,
        // type,
        // type: 'round_robin',
        type: 'single_elimination',
        seeding: participants,
        settings: {
            seedOrdering: ['natural'],
            balanceByes: false,
            size: size,
            matchesChildCount: 0,
            consolationFinal: false
        }
    })
    const tournamentData = await manager.get.stageData(0)
    console.log(tournamentData)
    await rerendering()
}


rendering();