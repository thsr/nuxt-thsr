import schedule from 'node-schedule'

function task (fireDate) {
  console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date())
}

export default schedule.scheduleJob('1,3,5,8,13,21,34,39,44,47,53,57 * * * * *', task)