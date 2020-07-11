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

var ansubject = function(req, res){
    console.log('/process/ansubject 호출됨.');

    var student_number = req.body.subject;

    var columns = ['subject_number','subject_id','subject_name'];
    var tablename = 'subject';
    
    var exec = conn.query("select ?? from ?? where student_number = ?", [columns, tablename, student_number], function(err, rows) {
    
        console.log('실행 대상 SQL : ' + exec.sql);
        
        var sqlrow = {rows};
        console.log(sqlrow);
        if (rows.length > 0) {
            res.send(sqlrow);
            console.log("과목 전송 성공");
        } else {
            console.log("일치하는 사용자를 찾지 못함.");
        }
    });
    
}

var ancalendar = function(req, res){
    console.log('/process/ancalendar 호출됨.');
    console.log(req.body);
    var student_num= req.body.id;
    var subject = req.body.subject;
    var att_month = req.body.month;

    var columns = ['att_day','state'];
    var tablename = 'attendance';
    
    var exec = conn.query("select ?? from ?? where att_month = ? and student_num =?", [columns, tablename, att_month, student_num], function(err, rows) {
        console.log('실행 대상 SQL : ' + exec.sql);
        var calrow = {rows};
        console.log(calrow);

        if (rows.length > 0) {
            res.send(calrow);
            console.log("출석 현황 전송 성공");
        } else {
            console.log("출석 현황 전송 실패");
        }
    });
    
}

module.exports.ancommute = ancommute;
module.exports.ansubject = ansubject;
module.exports.ancalendar = ancalendar;