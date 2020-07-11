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

    var columns = 'subject_state';
    var tablename = 'subject';
    
    var exec = conn.query("select ?? from ?? where student_number = ?", [columns, tablename, id], function(err, rows) {
    
        console.log('실행 대상 SQL : ' + exec.sql);
        console.log(rows);
        var n = rows[1].subject_state;
        if (n!= data) {
            res.send("출석가능한 과목이 존재하지 않습니다.");
            console.log(n);
            res.end();
        } else {
            var sqls = 'UPDATE attendance SET state=? where att_day=?';
            var params=[0,30];
        
            var execc = conn.query(sqls,params, function(err, result,fields) {
                console.log('실행 대상 SQL : ' + execc.sql);

                if(err){
                    console.log("err: "+err);
                    res.end();
                }else{
                    console.log(result);
                    res.send("출석성공");
                    res.end();
                    console.log("success");
                }
            });
        }
    });
}

module.exports.sensorimg = sensorimg;