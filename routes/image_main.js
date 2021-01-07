// 이미지 클릭하면 메인 페이지로 이동하는 코드

var loginre = function (req, res) {
    console.log('/process/loginre 호출됨.');

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
                    var context = { result: result };
                    //console.log("메인 페이지에 전송되는 데이터: " + JSON.stringify(context));
                    req.app.render('main_page_re', context, function (err, html) {
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

module.exports.loginre = loginre;