//학생 계정 DB에 추가하는 페이지 코드
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var crypto = require('crypto');
var pool = require('../database/db_conn');
const { resolveNaptr } = require('dns');
var salt = '';
var hashpassword = '';

var db_pool = {
    connectionLimit: 10,
    host: pool.host,
    user: pool.user,
    password: pool.password,
    database: pool.database
};

var conn = mysql.createConnection(db_pool);
conn.connect();

//////////////////////////////////////////////////////////////////////////////////////////////

//새로운 계정 추가할 때(학생)
var adduser = function (req, res) {
    console.log('/process/adduser 호출됨.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName);

    // pool 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
    if (db_pool) {
        addUser(paramId, paramPassword, paramName, function (err, addedUser) {
            // 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
            if (err) {
                console.error('사용자 추가 중 에러 발생 : ' + err.stack);

                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h2>사용자 추가 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            // 결과 객체 있으면 성공 응답 전송
            if (addedUser) {
                console.dir(addedUser);

                console.log('inserted ' + addedUser.affectedRows + ' rows');

                var insertId = addedUser.insertId;
                console.log('추가한 레코드의 아이디 : ' + insertId);

                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            } else {
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h2>사용자 추가  실패</h2>');
                res.end();
            }
        });
    } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
};

//사용자를 등록 관련 함수(adduser)- 학생
var addUser = function (id, password, name, callback) {
    console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name);
    console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

    salt = Math.round((new Date().valueOf() * Math.random())) + "";
    console.log('%d', salt);

    var hashpassword = hashpw(password, salt);

    // 데이터를 객체로 만듦
    var data = { student_number: id, student_name: name, student_password: hashpassword, salt: salt, status: 1 }; //status =1인 경우는 해당 학생의 얼굴과 지문 데이터가 없음을 의미함
    // var data = {prof_id:id, prof_number:name, prof_password:hashpassword}; //status =1인 경우는 해당 학생의 얼굴과 지문 데이터가 없음을 의미함

    // SQL 문을 실행함
    var exec = conn.query('INSERT INTO student SET ?', data, function (err, result) {
        // var exec = conn.query('INSERT INTO professor SET ?', data, function(err, result) {
        console.log('실행 대상 SQL : ' + exec.sql);

        if (err) {
            console.log('SQL 실행 시 에러 발생함.');
            console.dir(err);

            callback(err, null);

            return;
        }

        callback(null, result);

    });

    conn.on('error', function (err) {
        console.log('데이터베이스 연결 시 에러 발생함.');
        console.dir(err);

        callback(err, null);
    });

}

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////



//비밀번호 암호화 함수
var hashpw = function (password, salt) {
    return crypto.createHash('sha512').update(password + salt).digest('hex')
}

module.exports.adduser = adduser;
