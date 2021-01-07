//메인 페이지의 교수 캘린더 출력 화면 페이지 코드
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

// 사용자(교수)의 과목 리스트 및 요일 불러오기
var profSubject = function (id, callback) {
    console.log('profSubject 호출됨 : ' + id);

    var columns = ['prof_name', 'subject_date', 'subject_name'];
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

// 사용자(교수)의 과목 리스트 불러오기
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




