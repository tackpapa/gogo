'use strict';
var Question = require("../models/Question");
var User = require("../models/User");
var Response = require("../models/Response");
var Donation = require("../models/Donation");
var List = require("../models/List");



exports.inputwish = (req, res) =>{
  var list = new List({
    user: req.body.user,
    username:req.body.username,
    name: req.body.name,
    description: req.body.description
  })
  list.save(function(err){
    if(err){ console.log(err)} else {
      res.redirect('/')
    }

  })
  }

  exports.deletewish = (req, res) =>{
    console.log(req.body.id);
    List.remove({ _id:req.body.id }, (err) => {
      if (err) { return next(err); }
      res.redirect('/');
    });

    }
    exports.makelive = (req, res) =>{
      console.log(req.body.id);
      List.update({ _id:req.body.id },
        {
          live:true
        }, function(err){
        if (err) { return next(err); }
        res.redirect('/adminpage');
      });

      }
      exports.oneidea = (req, res) => {
        List.find({
            _id: req.params.id
        }).exec(function(err, data) {

            if (err) {
                console.log("listfind error ", err)
                res.redner(
                  'index', {title: 'Home'}
                )
            } else {
                res.render('oneidea', {
                    title: 'oneidea',
                    data: data
                })
            }
      })
      }



exports.postresponse = (req, res) => {
    Question.findOne({
        _id: req.params.id
    }, function(err, question) {
        var response = new Response({
            user: req.body.user,
            question: req.body.question,
            response: req.body.response,
            donate: req.body.donate
        })
        response.save(function(err) {
                question.response.push(response);
                question.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                      if(req.body.donate==true||req.body.donate=='true'){
                        var donate_money = new Donation({
                          user:req.body.user,
                          donation:question.price,
                          question:req.body.question
                        })
                        User.update({instagram:req.user.instagram}, {donated:question.price}, function(err, done){
                          if(err){console.log(err)}
                        })
                        donate_money.save(function(err){
                          if(err){console.log(err+'donatemoney_error')}
                          else{question.answered=true;
                            question.save(function(err){
                              if(err){console.log(err+'donatequestion_error')}
                              else{
                                res.redirect('/star/' + req.body.instagram)
                              }
                            })
                            }


                        })
                      }else{

                      if (question.answered==false){
                        var updateMoney = req.user.money + question.price;
                        User.update({
                            _id: req.user._id
                        }, {
                            money: updateMoney
                        }, function(err) {
                            if (err) {
                                console.log(err, "updating money error")
                            } else {
                              question.answered=true;
                              question.save(function(err){
                                if (err){console.log(err, 'error in updating question.answered')}
                                else{ res.redirect('/star/' + req.body.instagram)}
                              })

                            }
                        })
                      }



                      else{res.redirect('/star/' + req.body.instagram)}
                    }
                }

            }

        )
    })
}
)
};

exports.chargeone = (req, res) => {
    User.findOne({
        _id: req.params.id
    }, function(err, user) {
        if (err) {
            console.log("charging error", err)
        } else {
          if(user.money == 0){
            res.redirect('/refillmoney')
          }
            user.money = user.money - 1
            user.save(function(err) {
                if (err) {
                    console.log(err)
                } else {
                    res.json(200)
                }
            })
        }
    })

};
exports.refillmoney = (req, res) => {
res.render('refill')
};
exports.notenough = (req, res) => {
res.render('notenough')
};
exports.refill = (req, res) => {
User.update({_id:req.user._id}, {money:parseInt(req.user.money)+parseInt(req.body.charging)}, function(err){
  if(err){console.log("refill error", err)}
  else {res.redirect('/')}
})

};
