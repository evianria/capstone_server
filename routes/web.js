var mysql = require('mysql');
var crypto = require('crypto');
var pool= require('../database/db_conn');
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

var profinfor = function(req, res){
    //과목 클릭시 실행
    console.log('/process/profinfor 호출됨.');
    res.redirect('/public/websubject.html');
	res.end();
};

var attstart = function(req, res){
    console.log("출석을 시작합니다.");
    var sql = 'UPDATE subject SET subject_state=? where subject_id=?';
    var params=[1,2];
        
    var exec = conn.query(sql,params, function(err, rows,fields) {
        console.log('실행 대상 SQL : ' + exec.sql);
        if(err){
            console.log("err: "+err);
            res.end();
        }else{
            console.log(rows);
            if(params==[1,2]){
                params=[0,2];
            }else{
                params=[1,2];
        }
        }
    });
}

var websubject = function(req, res){
    //출석종료 버튼 클릭시 실행
    console.log('/process/websubject 호출됨.');
    var sql = 'UPDATE subject SET subject_state=? where subject_id=?';
    var params=[0,2];
        
    var exec = conn.query(sql,params, function(err, rows,fields) {
        console.log('실행 대상 SQL : ' + exec.sql);
        if(err){
            console.log("err: "+err);
            res.end();
        }else{
            console.log(rows);
            if(params==[1,2]){
                params=[0,2];
            }else{
                params=[1,2];
        }
        }
    });
    res.redirect('/public/prof_infor.html');
	res.end();
};

module.exports.profinfor = profinfor;
module.exports.attstart = attstart;
module.exports.websubject = websubject;
