var mysql = require('mysql');

// //===== MySQL 데이터베이스 연결 설정 =====//
var pool      =    mysql.createPool({
    connectionLimit : 10, 
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    database : 'check',
    debug    :  false
});

// database 객체를 module.exports에 할당
module.exports = pool;
