//Express 기본 모듈 불러오기
var express = require('express')
, http = require('http')
, path = require('path');

//Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , static = require('serve-static')
    , errorHandler = require('errorhandler');

//오류 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

//Session 미들웨어 불러오기
var expressSession = require('express-session');

//익스프레스 객체 생성
var app = express();

//기본 속성 설정
app.set('port', process.env.PROT || 3000);

//body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended: false}))

//body-parser를 사용해 application/json 파싱
app.use(bodyParser.json())

//public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

//세션 설정
app.use(expressSession({
    secret:'my key',
    resave: true,
    saveUninitialized:true
}));

//라우터 객체 참조
var router = express.Router();

//========MySQL 데이터베이스를 사용할 수 있는 mysql 모듈 불러오기 ======//
var mysql = require('mysql');

//======== MySQL 데이터베이스 연결 설정 ========//
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user : 'root',
    password : '00000',
    database : 'text',
    debug: false
});



//로그인 라우팅 함수 - 데이터베이스의 정보와 비교
router.route('/process/login').post(function(req, res){
    console.log('/process/login 호출됨.');

    // var paramId = req.body.id || req.query.id;
    // var paramPassword = req.body.password || req.query.password;
    
    // if(req.session.user){
    //     //이미 로그인된 상태
    //     console.log('이미 로그인되어 상품 페이지로 이동합니다.');

    //     res.redirect('/public/product.html');
    // }else{
    //     //세션 저장
    //     req.session.user={
    //         id: paramId,
    //         name: '소녀시대',
    //         authorized: true
    //     };

    //     res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
    //     res.write('<h1>로그인 성공</h1>');
    //     res.write('<div><p>Param id: ' + paramId + '</p><div>');
    //     res.write('<div><p>Param password: ' + paramPassword + '</p><div>');
    //     res.write("<br><br><a href='/process/product'>상품 페이지로 이동하기</a>");
    //     res.end();
    // }
});

//라우터 객체를 app 객체에 등록
app.use('/',router);

//사용자를 인증하는 함수
var authUser = function( id, password, callback){
    console.log('authUser 호출됨.');

    //커넥션 풀에서 연결 객체를 가져옵니다.
    pool.getConnection(function(err, conn){
        if(err){
            if(conn){
                conn.release(); //반드시 해제해야 합니다.
            }
            callback(err, null);
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디: ' + conn.threadId);

        var columns = ['id', 'name', 'age'];
        var tablename = 'users';

        //SQL문을 실행합니다.
        var exec = conn.query("select ?? from ?? where id= ? and password = ?",
                                [columns, tablename, id, password], function(err, rows){
            conn.release();
            console.log('실행 대상 SQL : ' + exec.sql);

            if(rows.length > 0){
                console.log('아이디 [%s], 패스워드 [%s] 가 일치하는 사용자 찾음.', id, password);
                callback(null,lows);
            }else{
                console.log("일치하는 사용자를 찾지 못함.");
                callback(null, null);
            }
        });
    })
}

app.post('/process/login', function(req, res){
    console.log('/process/login 호출됨.');

    //요청 파라미터 확인
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    console.log('요청 파라미터 : ' + paramId+ ', ' + paramPassword);

    //pool 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
    if(pool){
        authUser(paramId, paramPassword, function(err, docs){
            if(err){
                console.error('사용자 로그인 중 오류 발생 : ' + err.stack);
                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'}); 
                res.write('<h2>사용자 로그인 중 오류 발생</h2>');
                    res.write('<p>' + err.stack + '</p>');  
                res.end();

                    return;
            }
            if(rows){
                console.dir(rows);
                var username = rows[0].name;
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 아이디: ' + paramId + '</p><div>');
                res.write('<div><p>사용자 이름: ' + username + '</p><div>');
                res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
                res.end();
            }else {
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디와 비밀번호를 다시 확인하십시오.</p><div>');
                res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
                res.end();
            }
        });
    }else {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p><div>');
        res.end();
    }
});


//로그아웃 라우팅 함수 - 로그아웃 후 세션 삭제함
router.route('/process/logout').get(function(req, res){
    console.log('/process/logout 호출됨.');

    if(req.session.user){
        //로그인된 상태
        console.log('로그아웃합니다.');

        req.session.destroy(function(err){
            if(err) {throw err;}

            console.log('세션을 삭제하고 로그아웃되었습니다.');
            res.redirect('/public/login2.html');
        });
    }else{
        //로그인 안된 상태
        console.log('아직 로그인되어 있지 않습니다.');

        res.redirect('/public/login2.html');
    }
});


router.route('/process/users/:id').get(function(req, res){
    console.log('/process/users:id 처리함.');

    var paramId = req.params.id;
    console.log('/process/users와 토큰 %s를 이용해 처리함.', paramId);

    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
    res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
    res.write('<div><p>Param id : ' + paramId + '</p></div>');
    res.end();
});

//====== 404 오류 페이지 처리 ======//
var errorHandler = expressErrorHandler({
    static:{
        '404' : './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

//======== 서버 시작 ========//
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트: ' + app.get('port'));

    
});
