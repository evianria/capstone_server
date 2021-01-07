//수강중인 학생 출석 현황 리스트 페이지 출력
var mysql = require('mysql');
var crypto = require('crypto');
var pool = require('../database/db_conn');
const { json } = require('body-parser');
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

var subjectlist = function (req, res) {
    //메인 화면 페이지
    console.log('/process/subjectlist 호출됨.');

    //교수 id, 과목 이름 가져오기 
    prof_id = paramId;
    // var subject_name = req.query.search;
    subject_name = "캡스톤디자인";

    if (db_pool) {
        stuList(prof_id, subject_name, function (err, rows) {
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
                // console.log("sfdfsdsdf"+JSON.stringify(main_result));
                Array.prototype.push.apply(main_result, rows);
                var context = { result: main_result };
                main_result = change_result;
                req.app.render('subjectlist', context, function (err, html) {
                    console.log("해당 과목 페이지로 이동");
                    res.end(html);
                })


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

stuList = function (prof_id, subject_name, callback) {
    console.log('stuList 호출됨 : ' + prof_id + ', ' + subject_name);

    var execc_column = ['id_subject'];
    var column = ['state','student_number','student_name'];
    var tablename_sub = 'subject';
    var tablename_att = 'attendance';
    // SQL 문을 실행합니다.
    var execc = conn.query("select ?? from ?? where prof_id = ? and subject_name = ?", [execc_column, tablename_sub, prof_id, subject_name], function (err, result) {
        console.log(execc.sql);
        console.log(result);

        var result = result[0].id_subject;
        var exec = conn.query("select ?? from ?? where id_subject = ?", [column, tablename_att, result], function (err, rows) {

            console.log('실행 대상 SQL : ' + exec.sql);

            if (rows.length > 0) {
                //console.log(rows);
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

module.exports.subjectlist = subjectlist;