// 교수가 출석시작, 출석버튼 눌렀을 때의 코드
var attstart = function (req, res) {
    console.log("출석을 시작합니다.");
    var sql = 'UPDATE subject SET subject_state=? where subject_id=?';
    var params = [1, 39];

    var exec = conn.query(sql, params, function (err, rows, fields) {
        console.log('실행 대상 SQL : ' + exec.sql);
        if (err) {
            console.log("err: " + err);
            res.end();
        } else {
            console.log(rows);
            if (params == [1, 2]) {
                params = [0, 2];
            } else {
                params = [1, 2];
            }
        }
    });
}

var attstop = function (req, res) {
    //출석종료 버튼 클릭시 실행
    console.log('/process/attstop 호출됨.');
    var sql = 'UPDATE subject SET subject_state=? where subject_id=?';
    var params = [0, 39];

    var exec = conn.query(sql, params, function (err, rows, fields) {
        console.log('실행 대상 SQL : ' + exec.sql);
        if (err) {
            console.log("err: " + err);
            res.end();
        } else {
            console.log(rows);
            if (params == [1, 2]) {
                params = [0, 2];
            } else {
                params = [1, 2];
            }
        }
    });
    //res.end();
};

module.exports.attstart = attstart;
module.exports.attstop = attstop;