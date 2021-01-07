//웹에서 교수가 로그인하는 페이지 코드
//메인 페이지의 교수 캘린더 출력 화면 페이지 코드(137번)
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

//웹에서 교수가 로그인 시도
var login = function (req, res) {
    console.log('/process/login 호출됨.');

    // 요청 파라미터 확인
    paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);

    // pool 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
    if (db_pool) {
        authUser(paramId, paramPassword, function (err, rows) {
            // 에러 발생 시, 클라이언트로 에러 전송
            if (err) {
                console.error('사용자 로그인 중 에러 발생 : ' + err.stack);
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h2>사용자 로그인 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }
            // 조회된 레코드가 있으면 성공 응답 전송
            if (rows) {
                console.log("로그인 성공 & 메인 페이지 이동");
                profSubject(paramId, function (err, result) {
                    res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                    main_result = result;
                    change_result = result;
                    var context = { result: result };
                    //console.log("메인 페이지에 전송되는 데이터: " + JSON.stringify(context));
                    req.app.render('main_page', context, function (err, html) {
                        console.log("메인 페이지로 이동");
                        res.end(html);
                    })

                });


            } else {  // 조회된 레코드가 없는 경우 실패 응답 전송
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                res.write('<h1>로그인  실패</h1>');
                res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
                res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
                res.end();
            }
        });
    } else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
        res.end();
    }
};

// 사용자(교수)를 인증하는 함수
var authUser = function (id, password, callback) {
    console.log('authUser 호출됨 : ' + id + ', ' + password);

    var columns = ['prof_id', 'prof_name'];
    var tablename = 'professor';
    // SQL 문을 실행합니다.
    var execc = conn.query("select ?? from ?? where prof_id = ?", ['salt', tablename, id], function (err, result) {
        console.log(execc.sql);

        salt = result[0].salt;

        var hashpassword = hashpw(password, salt);
        console.log('입력한 비밀번호: ' + hashpassword);

        var exec = conn.query("select ?? from ?? where prof_id = ? and prof_password = ?", [columns, tablename, id, hashpassword], function (err, rows) {

            console.log('실행 대상 SQL : ' + exec.sql);

            if (rows.length > 0) {
                console.log('아이디 [%s], 패스워드 [%s] 가 일치하는 사용자 찾음.', id, password);
                callback(null, rows);
            } else {
                console.log("일치하는 사용자를 찾지 못함.");
                callback(null, null);
            }
        });
    });
    conn.on('error', function (err) {
        console.log('데이터베이스 연결 시 에러 발생함.');
        console.dir(err);

        callback(err, null);
    });
}

//비밀번호 암호화 함수
var hashpw = function (password, salt) {
    return crypto.createHash('sha512').update(password + salt).digest('hex')
}

//웹에서 로그아웃
var logout = function (req, res) {
    console.log('/process/logout 호출됨.');
    req.session.destroy();
    res.redirect('/public/login.html');

};

module.exports.login = login;
module.exports.logout = logout;


//////////////////////////////////////////////////////////////////////////////////////////////

// 사용자(교수)의 메인 페이지 과목 리스트 불러오기
profSubject = function (id, callback) {
    console.log('profSubject 호출됨 : ' + id);

    var columns = ['prof_name', 'subject_month','subject_date', 'subject_name'];
    var tablename = 'prof_attend';
    // SQL 문을 실행
    var exec = conn.query("select ?? from ?? where id_prof = ?", [columns, tablename, id, hashpassword], function (err, rows) {

        console.log('실행 대상 SQL : ' + exec.sql);

        if (rows.length > 0) {
            //console.log(rows);
            callback(null, rows);
        } else {
            console.log("과목 리스트가 존재하지 않음.");
            callback(null, null);
        }
    });
    conn.on('error', function (err) {
        console.log('데이터베이스 연결 시 에러 발생함.');
        console.dir(err);

        callback(err, null);
    });
}

// 사용자(교수)의 메인 페이지의 과목 캘린더 불러오기
var profName = function (prof_name, callback) {
    console.log('profName 호출됨 : ' + id_subject);

    var columns = ['att_day', 'att_month'];
    var tablename = 'professor';

    // SQL 문을 실행
    var exec = conn.query("select ?? from ?? where id_subject = ?", [columns, tablename, id_subject], function (err, rows) {

        console.log('실행 대상 SQL : ' + exec.sql);

        if (rows.length > 0) {
            console.log("과목 리스트 및 일수: " + rows);
            callback(null, rows);
        } else {
            console.log("과목 리스트가 존재하지 않음.");
            callback(null, null);
        }
    });
    conn.on('error', function (err) {
        console.log('데이터베이스 연결 시 에러 발생함.');
        console.dir(err);

        callback(err, null);
    });
}
