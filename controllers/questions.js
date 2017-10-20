'use strict';
var Question = require("../models/Question");
var User = require("../models/User");
var Response = require("../models/Response");
var Donation = require("../models/Donation");

// exports.filesave = (req, res) =>{
//
//   const files = req.files;
//   var AWS = require("aws-sdk");

  // 라우터
//
//
//   AWS.config = {
//    region: 'ap-northeast-1'
//   };
//
//   fs.renameSync(files[i].path, '/goree/' + files[i].filename + ".jpg");
//   s3Upload('/goree/', files[i].filename + '.jpg');
//
//   //var s3 = new AWS.S3({signatureVersion: 'v4'});
//   var s3 = new AWS.S3();
//   function s3Upload(path, filename) {
//
//    fs.readFile(path + filename, function(err, file_buffer) {
//
//      if (err) {
//
//        console.log(err);
//
//        return;
//
//      }
//
//      s3.putObject({
//        Bucket: 'goree',
//        Key: filename,
//        Body: file_buffer
//      }, function (err, data) {
//
//        if (err) {
//
//          sendMail('lotte-server 에서 s3 로 업로드 실패', filename);
//          return;
//
//        }
//
//        fs.unlinkSync(path + filename);
//
//        if (type === 'wmv') console.log('success movie : ' + filename);
//        else if (type === 'jpg') console.log('success poster : ' + filename);
//
//      });
//
//    });
//
//   }
// }
exports.postquestion = (req, res) => {
    if(req.user.money < req.body.price){
      req.body = null;
      res.redirect('/notenoughmoney')
    };

    User.find({instagram:req.body.target}, (err, targetuser)=>{
      if(err){console.log(err)}
      else{
        if(req.body.price < targetuser[0].min_price){
          res.redirect('/star/' + req.body.target)
        }
        else{

    var question = new Question({
        user: req.body.user,
        context: req.body.context,
        price: req.body.price,
        target: req.body.target,
        private: req.body.private
    })
    question.save(function(err) {
        if (err) {
            console.log(err)
        } else {
             var newPrice = req.user.money - req.body.price
            User.update({
                _id: req.body.user
            }, {
                money: newPrice
            }, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    res.redirect('/star/' + req.body.target)
                }
            })
        }
    })
  }

}
})
};
exports.rejected = (req, res) => {
Question.update({_id:req.params.id}, {rejected:true}, (err, done)=>{
  if(err){console.log(err)}
  else{
    res.redirect('/star/' +req.user.instagram);
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
