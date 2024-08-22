const models = require('../models');
const express = require('express');
const router = express.Router();
const VerifyToken = require('./../middleware/VerifyToken');
const Sequelize = require('sequelize');

router.post('/', VerifyToken, function (req, res) {
  models.SessionPart.find({
    where: {SessionId: req.body.SessionId},
    order: [
      ['order', 'desc']
    ],
    limit: 1
  })
    .then((part) => {
      models.SessionPart.create({
        title: req.body.title,
        description: req.body.description,
        SessionId: req.body.SessionId,
        voteLimit: req.body.voteLimit === 0 ? null : req.body.voteLimit,
        order: part ? part.order + 1 : 1,
      })
        .then(sessionPart => {
          res.status(201).send(sessionPart);
        })
        .catch(function (err) {
          console.log(err)
        });
    });

});

router.put(`/:id`, VerifyToken, function (req, res) {
  models.SessionPart.findByPk(req.params.id)
    .then(sessionPart => {
      if (!sessionPart) {
        return res.sendStatus(404);
      }
      sessionPart.update({
        title: req.body.title,
        description: req.body.description,
        voteLimit: req.body.voteLimit === 0 ? null : req.body.voteLimit,
        order: req.body.order
      })
        .then(result => {
          return res.send(sessionPart)
        })
        .catch(err => {
          return res.sendStatus(409)
        })
    })
});

router.delete(`/:id`, VerifyToken, function (req, res) {
  const sessionPartId = req.params.id
  models.SessionPart.findByPk(sessionPartId, {
    attributes: [
      'id',
      'inProgress',
      [Sequelize.fn('COUNT', Sequelize.col('Votings.id')), 'votings_count']
    ],
    include: [
      {
        model: models.Voting,
        attributes: []
      }
    ]
  })
    .then(sessionPart => {
      if (sessionPart.id === null) {
        return res.sendStatus(404)
      }

      if (sessionPart.inProgress === true) {
        return res.status(409).send({error: 'session part in progress'})
      }

      if (sessionPart.dataValues.votings_count > 0) {
        return res.status(409).send({error: 'has votings already'})
      }

      return sessionPart.destroy()
        .then(() => {
          res.status(200).send({ok: 'ok'});
        })
    })
})

router.get(`/:id/voting`, VerifyToken, function (req, res) {
  models.Voting.findOne({where: {SessionPartId: req.params.id}}).then(voting => {
    res.send(voting)
  })
});

router.get(`/:id/start`, VerifyToken, function (req, res) {
  models.SessionPart.findByPk(req.params.id)
    .then(sessionPart => {
      if (!sessionPart)
        return res.send(404);

      sessionPart.update({
        inProgress: true
      })
        .then(result => {
          return res.send(sessionPart)
        })
        .catch(err => {
          return res.send(409)
        })
    })
});

router.get(`/:id/end`, VerifyToken, function (req, res) {
  models.SessionPart.findByPk(req.params.id)
    .then(sessionPart => {
      if (!sessionPart)
        return res.send(404);
      sessionPart.update({
        inProgress: null
      })
        .then(result => {
          return res.send(sessionPart)
        })
        .catch(err => {
          return res.send(409)
        })
    })
});

router.get(`/:id/countUser/:userId`, VerifyToken, function (req, res) {
  models.Vote.count({
    where: {
      UserId: req.params.userId
    },
    include: [
      {
        model: models.Voting,
        include: [
          {
            model: models.SessionPart,
            where: {
              id: req.params.id
            }
          }
        ]
      }
    ]
  })
    .then(voteCount => {
      return res.send({count: voteCount})
    })
});


router.get(`/:id/order/:pos`, VerifyToken, function (req, res) {
  models.SessionPart.findByPk(req.params.id)
    .then(sessionPart => {
      sessionPart.changeOrder(req.params.pos);
      res.status(200).send({ok: 'ok'});
    })
});


module.exports = router;
