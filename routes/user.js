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

var login = function(req, res){
    console.log('/process/login 호출됨.');

	// 요청 파라미터 확인
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
	
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);
    
    // pool 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
	if (db_pool) {
		authUser(paramId, paramPassword, function(err, rows) {
			// 에러 발생 시, 클라이언트로 에러 전송
			if (err) {
                console.error('사용자 로그인 중 에러 발생 : ' + err.stack);
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 로그인 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
            // 조회된 레코드가 있으면 성공 응답 전송
			if (rows) {
                res.redirect('/public/prof_infor.html');
                console.log("로그인 성공 & 메인 페이지 이동");
				res.end();
			
			} else {  // 조회된 레코드가 없는 경우 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>로그인  실패</h1>');
				res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
				res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
	}
};

var adduser = function(req, res){
    console.log('/process/adduser 호출됨.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;
	
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName);
    
    // pool 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
	if (db_pool) {
		addUser(paramId, paramPassword, paramName, function(err, addedUser) {
			// 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
			if (err) {
                console.error('사용자 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
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
	        	
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가 성공</h2>');
				res.end();
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가  실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
};

// 사용자(학생)를 인증하는 함수
var authUser = function(id, password, callback) {
	console.log('authUser 호출됨 : ' + id + ', ' + password);
          
    var columns = ['prof_id'];
    var tablename = 'professor';
        // SQL 문을 실행합니다.
        var execc = conn.query("select ?? from ?? where prof_id = ?", ['salt', tablename, id], function(err, result) {
            console.log(execc.sql);

            salt = result[0].salt;

            var hashpassword = hashpw(password, salt);
            console.log('입력한 비밀번호: '+ hashpassword);
        
        var exec = conn.query("select ?? from ?? where prof_id = ? and prof_password = ?", [columns, tablename, id, hashpassword], function(err, rows) {
        
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
        conn.on('error', function(err) {      
            console.log('데이터베이스 연결 시 에러 발생함.');
            console.dir(err);
            
            callback(err, null);
        });
}

//사용자를 등록하는 함수
var addUser = function(id, password, name, callback) {
	console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name );
    console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

    salt = Math.round((new Date().valueOf()* Math.random())) + "";
    console.log('%d',salt);

    var hashpassword = hashpw(password, salt);

    // 데이터를 객체로 만듦
    var data = {student_number:id, student_name:name, student_password:hashpassword, salt:salt, id:1}; //status =1인 경우는 해당 학생의 얼굴과 지문 데이터가 없음을 의미함
    // var data = {prof_id:id, prof_number:name, prof_password:hashpassword}; //status =1인 경우는 해당 학생의 얼굴과 지문 데이터가 없음을 의미함
    	
    // SQL 문을 실행함
    var exec = conn.query('INSERT INTO student SET ?', data, function(err, result) {
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
        
    conn.on('error', function(err) {      
        console.log('데이터베이스 연결 시 에러 발생함.');
        console.dir(err);
              
        callback(err, null);
    });
    
}
//비밀번호 암호화 함수
var hashpw = function(password,salt) {
    return crypto.createHash('sha512').update(password+salt).digest('hex')
}

module.exports.adduser = adduser;
module.exports.login = login;