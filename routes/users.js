const models = require('../models');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const VerifyToken = require('./../middleware/VerifyToken');
const bcrypt = require("bcrypt");


router.post('/', function (req, res) {
  models.User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: req.body.password,
    role: req.body.role,
    emailAddress: req.body.emailAddress,
    phoneNumber: req.body.phoneNumber
  }).then(user => {
    res.status(201).send(user.serialize())
  }).catch(err => {
    return res.send(400)
  });
});

router.put(`/:id`, VerifyToken, function (req, res) {
  models.User.findByPk(req.params.id)
    .then(user => {
      if (!user) {
        return res.send(404);
      }
      user.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        emailAddress: req.body.emailAddress,
        phoneNumber: req.body.phoneNumber,
        role: req.body.role
      })
        .then(result => {
          return res.send(user.serialize())
        })
        .catch(err => {
          return res.send(409)
        })
    })
});

router.put(`/:id/password`, VerifyToken, function (req, res) {
  models.User.findByPk(req.params.id)
    .then(user => {
      if (!user) {
        return res.send(404);
      }
      user.set('password', req.body.password);
      user.update({password: req.body.password})
        .then(result => {
          return res.send(user.serialize())
        })
        .catch(err => {
          return res.send(409)
        })
    })
});

router.get('/', VerifyToken, function (req, res) {
  models.User.findAll().then(users => {
    res.send(users.map(user => user.serialize()))
  })
});

router.post('/register', function (req, res) {
  models.User.create({
    username: req.body.username,
    password: req.body.password,
    emailAddress: (Math.random() * 20).toString()
  }).then(user => {
    res.send('registered');
  });
});

router.post('/auth', function (req, res) {
  let { username, password } = req.body
  if (!username || !password) {
    return res.status(400).send({ message: 'wrong credentials' })
  }

  models.User.findOne({
    where: { username }
  }).then(user => {
    if (user && user.validPassword(password)) {
      const token = jwt.sign(
        { id: user.id },
        'sekret',
        {
          expiresIn: 86400 //1 day
        })

      return res.status(200).send({
        ...user.serialize(),
        token
      })
    }

    return res.status(400).send({ message: 'wrong credentials' })
  })
})

router.get('/me', VerifyToken, function (req, res, next) {
  models.User.findByPk(req.userId)
    .then(user => {
      res.status(200).send(user.serialize());
    });
});

router.post(`/:id/setGroup`, VerifyToken, function (req, res) {
  models.User.findByPk(req.params.id)
    .then(user => {
      if (!user) {
        return res.sendStatus(404);
      }
      models.Group.findByPk(req.body.groupId)
        .then(group => {
          if (!group) {
            return res.sendStatus(404);
          }
          models.UserToGroup.create({
            user_id: user.id,
            group_id: group.id
          })
            .then(userToGroup => {
              res.status(201).send(userToGroup);
            });
        });
    });
});

router.post(`/:id/unsetGroup`, VerifyToken, function (req, res) {
  models.UserToGroup.find({
    user_id: req.params.id,
    group_id: req.body.id
  })
    .then(userToGroup => {
      if (!userToGroup)
        return res.sendStatus(404);
      return userToGroup.destroy()
        .then(() => {
          res.sendStatus(200);
        })
    });
});



module.exports = router;
