const {
  readDirectoriesWithREADMEs,
  extractListFromMarkdownSection,
  mapToObjectBy,
} = require('./utils')

module.exports = () =>
  readDirectoriesWithREADMEs('/phases')
  .then(moveIdToNumber)
  .then(extractChallenges)
  .then(mapToObjectBy('number'))

const moveIdToNumber = phases => {
  phases.forEach(phase => {
    phase.number = Number(phase.id)
    delete phase.id
  })
  return phases
}

const extractChallenges = phases => {
  phases.forEach(phase => {
    const challenges = extractListFromMarkdownSection(
      phase.READMEMarkdown,
      'Challenges',
      2,
    )
    phase.challenges = challenges.map(extractChallengeId)
  })
  return phases
}
const extractChallengeId = (challenge) => {
  const matches = challenge.match(/\/challenges\/([^\/]+?)\)/)
  return matches ? matches[1] : challenge
}
