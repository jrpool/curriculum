const knex = require('./knex')

const getChecksForUserAndLabels = ({userId, labels}) => {
  let query = knex
    .select('*')
    .from('skill_checks')
    .where({user_id: userId})
  if (labels && labels.length > 0)
    query = query.whereIn('label', labels)
  return query.then(hashChecksByLabel)
}

const getCheckLogsForUsers = userIds => {
  return knex
    .select('*')
    .from('event_logs')
    .where('type', 'skill_check')
    .whereIn('user_id', userIds)
    .orderBy('occurred_at', 'asc')
    .then(checkLogs => {
      const checkLogsByUserId = {}
      userIds.forEach(userId => {
        checkLogsByUserId[userId] = checkLogs.filter(checkLog =>
          checkLog.user_id === userId
        )
      })
      return checkLogsByUserId
    })
}

const hashChecksByLabel = checks => {
  const checkedMap = {}
  checks.forEach(check => {
    checkedMap[check.label] = true
  })
  return checkedMap
}

module.exports = {
  getChecksForUserAndLabels,
  getCheckLogsForUsers,
}
