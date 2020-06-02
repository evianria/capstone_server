var mysql = require('mysql');
var pool= require('../database/db_conn');
var crypto = require('crypto');
var salt = '';
var hashpassword = '';


var db_pool   ={
    connectionLimit : 10, 
    host     : pool.host,
    user     : pool.user,
    password : pool.password,
    database : pool.database
};

var conn = mysql.createConnection(db_pool);
conn.connect();

var ancommute = function(req, res){
    console.log('/process/ancommute 호출됨.');

    var approve = {'approve_id': 'NO', 'approve_pw': 'NO'};
    
    var id = req.body.id;
    var password = req.body.password;
    console.log('id : '+id+ ' pw: '+password);

    var columns = ['student_number', 'student_name'];
    var tablename = 'student';
    var execc = conn.query("select ?? from ?? where student_number = ?", ['salt', tablename, id], function(err, result) {
        console.log(execc.sql);

        salt = result[0].salt;

        var hashpassword = hashpw(password, salt);
        console.log('입력한 비밀번호: '+ hashpassword);
    
        var exec = conn.query("select ?? from ?? where student_number = ? and student_password = ?", [columns, tablename, id, hashpassword], function(err, rows) {
    
        console.log('실행 대상 SQL : ' + exec.sql);
        
            if (rows.length > 0) {
                console.log('아이디 [%s], 패스워드 [%s] 가 일치하는 사용자 찾음.', id, password);
                approve.approve_id = 'OK';
                approve.approve_pw='OK';
                console.log(approve);
                res.send(approve);
                console.log("보냄");
            } else {
                console.log("일치하는 사용자를 찾지 못함.");
                approve.approve_id = 'NO';
                approve.approve_pw='NO';
                res.send(approve);
            }
        });
    });
}
//비밀번호 암호화 함수
var hashpw = function(password,salt) {
    return crypto.createHash('sha512').update(password+salt).digest('hex')
}

module.exports.ancommute = ancommute;