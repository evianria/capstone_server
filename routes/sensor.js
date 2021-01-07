//센서의 전체 코드
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

var sensorimg = function(req, res){
    console.log('/process/sensorimg 호출됨.');

    var id = req.body.id;
    console.log('id : '+id);
    var data = req.body.data;
    console.log('data: '+data);

    var subject = "캡스톤디자인";

    var columns = 'subject_state';
    var tablename = 'subject';
    
    var exec = conn.query("select ?? from ?? where subject_name = ? and student_number = ?", [columns, tablename, subject, id], function(err, rows) {
    
        console.log('실행 대상 SQL : ' + exec.sql);
        console.log(rows[0].subject_state);
        var n = rows[0].subject_state;
        if (n!= data) {
            console.log("출석가능한 과목이 존재하지 않습니다.");
            res.send("출석가능한 과목이 존재하지 않습니다.");
            res.end();
        } else {
            console.log("출석시작!");
            var sqls = 'UPDATE attendance SET state=? where att_day=? and att_month = ? and student_number = ?';
            var params=[0,12,11,id];
        
            var execc = conn.query(sqls,params, function(err, result,fields) {
                console.log('실행 대상 SQL : ' + execc.sql);

                if(err){
                    console.log("err: "+err);
                    res.end();
                }else{
                    res.send("출석성공");
                    res.end();
                    console.log("success");
                }
            });
        }
    });
}

module.exports.sensorimg = sensorimg;