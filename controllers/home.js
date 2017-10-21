'use strict';
var Question = require("../models/Question");
var User = require("../models/User");
var Response = require("../models/Response");
var Donation = require("../models/Donation");
var List = require("../models/List");
var Comment = require("../models/Comment");


exports.index = (req, res) => {
  List.find({
      target: req.params.id
  }).sort({
    date: 'desc'
  }).exec(function(err, data) {
      if (err) {
          console.log("listfind error ", err)
          res.redner(
            'index', {title: 'Home'}
          )
      } else {
          res.render('index', {
              title: 'Home',
              data: data
          })
      }
})
}
exports.adminpage = (req, res) => {
  List.find({
      target: req.params.id
  }).exec(function(err, data) {

      if (err) {
          console.log("listfind error ", err)
          res.redner(
            'index', {title: 'Home'}
          )
      } else {
          res.render('adminpage', {
              data: data
          })
      }
})
}
