//학생의 출석 현황 캘린더 페이지 코드
//학생의 출석 현황 값 업데이트(96번)
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

//////////////////////////////////////////////////////////////////////////////////////////

var stucalendar = function (req, res) {
    console.log('/process/studentcalendar 호출됨.');

    //학생 이름 가져오기
    student_number = "20174144";
    id_subject = 1;

    // pool 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
    if (db_pool) {
        stusubject(student_number, id_subject, function (err, rows) {
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
                
                 //console.log("result값: "+ JSON.stringify(result));
                 Array.prototype.push.apply(main_result, rows);
                 res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                 var context = { result: main_result };
                 req.app.render('student_calendar', context, function (err, html) {
                     console.log("학생 출석 관리 창으로 이동합니다.");
                     res.end(html);
                 })

            } else {  // 조회된 레코드가 없는 경우 실패 응답 전송
                res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
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

var stusubject = function (student_number, id_subject, callback) {
    console.log('stusubject 호출됨 : ' + student_number + ', ' + id_subject);

    var columns = ['att_month','att_day','state'];
    var tablename = 'attendance';
    
    var exec = conn.query("select ?? from ?? where student_number =? and id_subject=?", [columns, tablename, student_number, id_subject], function(err, rows) {
        console.log('실행 대상 SQL : ' + exec.sql);
        if (rows.length > 0) {
            console.log("해당 학생 출석현황 데이터 전송 완료");
            callback(null, rows);
        } else {
            console.log("일치하는 사용자를 찾지 못함.");
            callback(null, null);
        }   
    });
    
    conn.on('error', function (err) {
        console.log('데이터베이스 연결 시 에러 발생함.');
        console.dir(err);

        callback(err, null);
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////////
var updatestate = function (req, res) {
    console.log("/process/updatestate 호출됨");
    var month = req.body.month2 || req.query.month2;
    var date = req.body.date2 || req.body.date2;
    var state = req.body.state || req.body.state;
    var student_number = "20174144"
    
    // pool 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
    if (db_pool) {
        updateStudent(month, date, state, student_number,function (err, rows) {
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
                console.log("출석 변경 및 업데이트 성공");

                // profSubject(paramId, function (err, result) {
                //     stuList(prof_id, subject_name, function (err, rows) {

                //         Array.prototype.push.apply(result, rows);
                //         var context = { result: result };
                //         req.app.render('student_calendar', context, function (err, html) {
                //             console.log("해당 과목 페이지 업데이트");
                //             res.end(html);
                //         })
                //     });
                // });
                stusubject(student_number, id_subject, function (err, rows) {
                    Array.prototype.push.apply(main_result, rows);
                    res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
                    var context = { result: main_result };
                    req.app.render('student_calendar', context, function (err, html) {
                        console.log("학생 출석 관리 창으로 이동합니다.");
                        res.end(html);
                    })
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
}

var updateStudent = function (att_month, att_day, state, student_number,callback) {
    console.log('updateStudent 호출됨 : ' + att_month + ', ' + att_day + ', ' + state + ', '+ student_number);

    var column = ['state','month','student_name'];
    var tablename = 'attendance';
    
    // SQL 문을 실행합니다.
    var execc = conn.query("update ?? set state= ? where att_month = ? and att_day = ? and student_number = ?", [tablename, state, att_month, att_day, student_number], function (err, result) {
        console.log(execc.sql);

        
        if (err) {
            console.log("일치하는 사용자를 찾지 못함.");
            callback(null, null);
            res.end();
        } else {
            
              
            callback(null, 1);        
                
            
        }
        
    });
    conn.on('error', function (err) {
        console.log('데이터베이스 연결 시 에러 발생함.');
        console.dir(err);

        callback(err, null);
    });
}

module.exports.stucalendar = stucalendar;
module.exports.updatestate = updatestate;
