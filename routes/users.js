var express = require('express');
var router = express.Router();
const { getConnection } = require('../connect');
const oracledb = require('oracledb');

/* GET users listing. */
router.get('/login', function(req, res, next) {  // users/login 요청이  들어오면
    res.render('index', {title:'로그인', pageName:'login.ejs'}); 
});

router.post('/login', async function(req, res){ //login.ejs에서 보낸 요청 들어오면
    const scode = req.body.scode; //보낸 데이터값 받고
    const pass = req.body.pass; //보낸 데이터값 받고
    console.log(scode, pass);
    let con;
    try{
        con = await getConnection(); //DB 연결
        let sql = "select * from students where scode = :scode"; //로그인시 넣었던 scode와 DB랑 같은 코드의 학생을 전부 출력해라
        let result = await con.execute(sql, {scode}, {outFormat:oracledb.OUT_FORMAT_OBJECT}); // sql문을 실행하고 위에 바인드 변수에 scode 값 넣기
        console.log(result.rows[0]);
        res.send(result.rows[0]); //결과로 나온 애를 다시 보내라
    }catch{
        console.log('로그인 체크', err);
    }finally{
        if(con) await con.close();
    }
});
module.exports = router;
