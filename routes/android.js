var bodyParser = require('body-parser');

var ancommute = function(req, res){
    console.log('/process/ancommute 호출됨.');

    var approve = {'approve_id': 'NO', 'approve_pw': 'NO'};

    var paramId = req.body.id;
    var paramPassword = req.body.password;
    console.log('id : '+paramId+ ' pw: '+paramPassword);

    if(paramId == 'aa') approve.approve_id = 'OK';
    if(paramPassword == 'bb') approve.approve_pw='OK';

    console.log(approve);
    res.send(approve);
    
};

module.exports.ancommute = ancommute;