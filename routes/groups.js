const models = require('../models');
const express = require('express');
const router = express.Router();
const VerifyToken = require('./../middleware/VerifyToken');

router.get('/', function (req, res) {
  models.Group.findAll()
    .then(groups => {
    res.status(200).send(groups);
  });
});

router.post('/', function (req, res) {
  models.Group.create({
    name: req.body.name
  }).then(group => {
    res.status(201).send(group);
  });
});

router.put(`/:id`, function (req, res) {
  models.Group.findByPk(req.params.id)
    .then(group => {
      if (!group) {
        return res.sendStatus(404);
      }
      group.update({
        name: req.body.name
      })
        .then(result => {
          return res.send(group)
        })
        .catch(err => {
          return res.sendStatus(409)
        })
    })
});

router.get(`/:id/users`, function (req, res) {
  models.Group.findByPk(req.params.id)
    .then(group => {
      group.getUsers()
        .then(users => res.send(users.map(user => user.serialize())));
    })
});

module.exports = router;
