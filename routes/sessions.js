const models = require('../models');
const express = require('express');
const router = express.Router();
const VerifyToken = require('./../middleware/VerifyToken');
const Sequelize = require('sequelize');

router.get('/', VerifyToken, function (req, res) {
  models.Session.findAll().then(sessions => {
    res.send(sessions)
  })
});

router.get('/inProgress', VerifyToken, function (req, res) {
  models.Session.findOne({
    where: {inProgress: true},
    include: [
      {
        model: models.SessionPart,
        include: [models.Voting]
      }
    ],
    order: [
      [models.SessionPart, 'order', 'asc']
    ]
  }).then(session => {
    if (session)
      res.send(session);
    else
      res.send(null);
  })
});

router.get(`/:id`, VerifyToken, function (req, res) {
  models.Session.findByPk(req.params.id)
    .then(session => {
      if (!session) {
        return res.send(404);
      }

      return res.send(session)
    })
});

router.post('/', VerifyToken, function (req, res) {
  models.Session.create({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date
  })
    .then(session => {
      res.status(201).send(session)
    })
    .catch(function (err) {
      console.log(err)
    });
});

router.get(`/:id/parts`, VerifyToken, function (req, res) {
  models.SessionPart.findAll({
    where: {SessionId: req.params.id},
    include: [models.Voting],
    order: [
      ['order', 'asc']
    ]
  }).then(parts => {
    res.send(parts)
  })
});

router.put(`/:id`, VerifyToken, function (req, res) {
  models.Session.findByPk(req.params.id)
    .then(session => {
      if (!session) {
        return res.send(404);
      }
      session.update({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date
      })
        .then(result => {
          return res.send(session)
        })
        .catch(err => {
          return res.send(409)
        })
    })
});

router.delete(`/:id`, VerifyToken, function (req, res) {
  const sessionId = req.params.id
  models.Session.findByPk(sessionId, {
    attributes: [
      'id',
      'inProgress',
      [Sequelize.fn('COUNT', Sequelize.col('SessionParts.id')), 'parts_count']
    ],
    include: [
      {
        model: models.SessionPart,
        attributes: []
      }
    ]
  })
    .then(session => {
      if (session.id === null) {
        return res.sendStatus(404)
      }

      if (session.inProgress === true) {
        return res.status(409).send({error: 'session in progress'})
      }

      if (session.dataValues.parts_count > 0) {
        return res.status(409).send({error: 'has parts already'})
      }

      return session.destroy()
        .then(() => {
          res.status(200).send({ok: 'ok'});
        })
    })
})

router.get(`/:id/start`, VerifyToken, function (req, res) {
  models.Session.findByPk(req.params.id)
    .then(session => {
      if (!session)
        return res.send(404);

      session.update({
        inProgress: true
      })
        .then(result => {
          return res.send(session)
        })
        .catch(err => {
          return res.send(409)
        })
    })
});

router.get(`/:id/end`, VerifyToken, function (req, res) {
  models.Session.findByPk(req.params.id)
    .then(session => {
      if (!session)
        return res.send(404);
      session.update({
        inProgress: null
      })
        .then(result => {
          return res.send(session)
        })
        .catch(err => {
          return res.send(409)
        })
    })
});


module.exports = router;
