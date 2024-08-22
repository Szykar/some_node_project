const Sequelize = require('sequelize')
const models = require('../models')
const express = require('express')
const router = express.Router()
const VerifyToken = require('./../middleware/VerifyToken')
const PDFDocument = require('pdfkit')

router.post('/', VerifyToken, function (req, res) {
  models.Voting.create({
    title: req.body.title,
    SessionPartId: req.body.SessionPartId
  }).then(sessionPart => {
    res.status(201).send(sessionPart)
  })
})

router.put(`/:id`, VerifyToken, function (req, res) {
  models.Voting.findByPk(req.params.id)
    .then(voting => {
      if (!voting) {
        return res.sendStatus(404)
      }
      voting.update({
        title: req.body.title
      })
        .then(result => {
          return res.send(voting)
        })
        .catch(err => {
          return res.sendStatus(409)
        })
    })
})

router.delete(`/:id`, VerifyToken, function (req, res) {
  const votingId = req.params.id
  models.Voting.findByPk(votingId, {
    attributes: [
      'id',
      'inProgress',
      [Sequelize.fn('COUNT', Sequelize.col('Votes.id')), 'votes_count']
    ],
    include: [
      {
        model: models.Vote,
        attributes: []
      }
    ]
  })
    .then(voting => {
      if (voting.id === null) {
        return res.sendStatus(404)
      }

      if (voting.inProgress === true) {
        return res.status(409).send({ error: 'voting in progress' })
      }

      if (voting.dataValues.votes_count > 0) {
        return res.status(409).send({ error: 'has votes already' })
      }

      return voting.destroy()
        .then(() => {
          res.status(200).send({ ok: 'ok' })
        })
    })
})

router.post(`/:id/vote`, VerifyToken, function (req, res) {
  const user = models.User.findOne({
    where: {
      id: req.userId,
      role: 'councilor'
    }
  })
    .then(user => {
      if (!user)
        return res.sendStatus(401)

      models.Voting.findOne({
        where: {
          id: req.params.id,
          inProgress: true
        },
        include: [models.SessionPart]
      })
        .then(voting => {
          if (!voting) {
            return res.send(404)
          }

          if (voting.SessionPart.voteLimit) {
            models.Vote.count({
              where: {
                UserId: user.id
              },
              include: [
                {
                  model: models.Voting,
                  include: [
                    {
                      model: models.SessionPart,
                      where: {
                        id: voting.SessionPart.id
                      }
                    }
                  ]
                }
              ]
            })
              .then(voteCount => {
                if (voteCount >= voting.SessionPart.voteLimit) {
                  return res.status(409).send({ error: 'already voted - limit reached' })
                }
                const vote = models.Vote.create({
                  vote: req.body.vote,
                  UserId: user.id,
                  VotingId: voting.id
                })
                  .then(result => {
                    return res.status(201).send(vote)
                  })
                  .catch(err => {
                    console.log(err)
                    return res.status(409).send({ error: 'already voted' })
                  })
              })
          } else {
            const vote = models.Vote.create({
              vote: req.body.vote,
              UserId: user.id,
              VotingId: voting.id
            })
              .then(result => {
                return res.status(201).send(vote)
              })
              .catch(err => {
                console.log(err)
                return res.status(409).send({ error: 'already voted' })
              })
          }

        })
    })

})

router.get(`/:id/start`, VerifyToken, function (req, res) {
  models.Voting.findByPk(req.params.id)
    .then(voting => {
      if (!voting)
        return res.send(404)

      voting.update({
        inProgress: true
      })
        .then(result => {
          return res.send(voting)
        })
        .catch(err => {
          return res.send(409)
        })
    })
})

router.get(`/:id/end`, VerifyToken, function (req, res) {
  models.Voting.findByPk(req.params.id)
    .then(voting => {
      if (!voting)
        return res.send(404)
      voting.update({
        inProgress: null
      })
        .then(result => {
          return res.send(voting)
        })
        .catch(err => {
          return res.send(409)
        })
    })
})

router.post(`/:id/absent`, VerifyToken, function (req, res) {
  models.Voting.findByPk(req.params.id)
    .then(voting => {
      if (!voting)
        return res.send(404)

      let count = 0

      req.body.absentIds.forEach(id => {
        models.Vote.create({
          vote: 'absent',
          UserId: id,
          VotingId: voting.id
        })
          .then(result => {
            count++
          })
      })

      res.status(200).send({count})
    })


})

router.get(`/:id/votes`, VerifyToken, function (req, res) {
  models.Vote.findAll({
    where: {
      VotingId: req.params.id
    },
    include: [models.User]
  })
    .then(votes => {
      res.send(votes)
    })
})

router.get(`/:id/voted-by/:userId`, VerifyToken, function (req, res) {
  models.Vote.findAll({
    where: {
      UserId: req.params.userId,
      VotingId: req.params.id
    }
  })
    .then(vote => {
      res.send(vote)
    })
})

router.get(`/:id/results`,  function (req, res) {
  models.Voting.findOne({
    where: {
      id: req.params.id
    },
    include: [
      {
        model: models.Vote,
        include: [models.User]
      }
    ],
  })
    .then(voting => {
      if (!voting)
        return res.send(404)

      models.User.findAll({
        where: {
          role: 'councilor'
        },
        include: [
          {
            model: models.Vote,
            where: {
              VotingId: voting.id
            },
            required: false
          }
        ]
      })
        .then(users => {
          const votes = {
            for: [],
            against: [],
            abstention: [],
            empty: [],
            absent: []
          }

          users.forEach(user => {
            if (user.Votes.length === 0) {
              votes.empty.push(user)
              return
            }

            switch (user.Votes[0].vote) {
              case 'for':
                votes.for.push(user)
                break
              case 'against':
                votes.against.push(user)
                break
              case 'abstention':
                votes.abstention.push(user)
                break
              case 'absent':
                votes.absent.push(user)
                break
            }

          })

          res.send(votes)
        })
    })
})

router.get(`/results/:id/:slug.pdf`, function (req, res) {
  models.Voting.findOne({
    where: {
      id: req.params.id,
      slug: req.params.slug
    },
    include: [
      {
        model: models.Vote,
        include: [models.User]
      }
    ],
  })
    .then(voting => {
      if (!voting)
        return res.send(404)

      models.User.findAll({
        where: {
          role: 'councilor'
        },
        include: [
          {
            model: models.Vote,
            where: {
              VotingId: voting.id
            },
            required: false
          }
        ]
      })
        .then(users => {
          const votes = {
            for: [],
            against: [],
            abstention: [],
            empty: [],
            absent: []
          }

          users.forEach(user => {
            if (user.Votes.length === 0) {
              votes.empty.push(user)
              return
            }

            switch (user.Votes[0].vote) {
              case 'for':
                votes.for.push(user)
                break
              case 'against':
                votes.against.push(user)
                break
              case 'abstention':
                votes.abstention.push(user)
                break
              case 'absent':
                votes.absent.push(user)
                break
            }

          })

          res.setHeader('Content-Type', 'application/pdf')
          let doc = new PDFDocument({
            margins: {
              top: 35,
              bottom: 35,
              left: 50,
              right: 50
            }
          })

          doc.pipe(res)
          doc.fontSize(16)
          doc.font('./fonts/OpenSans-Regular.ttf')
          doc.text('Voting results:')
          doc.text(voting.title).moveDown()

          doc.fontSize(13)
          doc.text('For: ' + votes.for.length
            + ', Against: ' + votes.against.length
            + ', Abstention: ' + votes.abstention.length
            + ', Empty: ' + votes.empty.length
            + ', Absent: ' + votes.absent.length)

          const five = {
            for: 'FOr',
            against: 'Against',
            abstention: 'Abstention',
            empty: 'Empty',
            absent: 'Absent',
          }

          Object.keys(votes).forEach(function (key) {
            doc.moveDown()
            doc.font('./fonts/OpenSans-Bold.ttf').text(five[key] + ' (' + votes[key].length + '):')
            doc.font('./fonts/OpenSans-Regular.ttf')

            if (votes[key].length === 0) {
              doc.text('-')
            }

            votes[key].forEach(vote => {
              doc.text(vote.firstName + ' ' + vote.lastName)
            })
          })

          doc.end()

        })
    })

})

module.exports = router
