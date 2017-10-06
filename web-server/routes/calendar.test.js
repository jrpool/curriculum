'use strict'

describe('/api/calendar', function(){
  it('should render a calendar', function(){
    return this
      .get('/calendar')
      .then(response => {
        expect(response).to.have.status(200)
        expect(response.body).to.contain('Oakland Guild Events')
      })
      .catch(error => {
        console.log(error);
        throw 'Error!';
      })
  })
})

// describe('/api/goals/:goalId.json', function(){
//   context('when the goal id is valid', function(){
//     let goalId
//     beforeEach(function(){
//       goalId = Object.keys(goalsById)[0]
//       expect(goalId).to.match(/^\d+$/)
//     })
//
//     it('should render the goal', function(){
//       return this
//         .get(`/api/goals/${goalId}.json`)
//         .then(response => {
//           expect(response).to.have.status(200)
//           expect(response.body).to.deep.equal(goalsById[goalId])
//         })
//     })
//   })
//
//   context('when the goal id is invalid', function(){
//     let goalId
//     beforeEach(function(){
//       goalId = '3746374'
//     })
//
//     it('should render a 404', function(){
//       return this
//         .get(`/api/goals/${goalId}.json`)
//         .then(
//           response => {
//             throw new Error('expected response to render 404')
//           },
//           error => {
//             expect(error.response).to.have.status(404)
//             expect(error.response.body).to.deep.equal({
//               error: `Could not find goal with id: ${goalId}`
//             })
//           }
//         )
//     })
//   })
// })
