var express = require('express');
var router = express.Router();
const { getConnection } = require('../connect');
const oracledb = require('oracledb');

/* GET users listing. */
router.get('/login', function(req, res, next) {
    res.render('index', {title:'로그인', pageName:'login.ejs'});
});

router.post('/login', async function(req, res){
    const scode = req.body.scode;
    const pass = req.body.pass;
    console.log(scode, pass);
    let con;
    try{
        con = await getConnection();
        let sql = "select * from students where scode =: scode";
        let result = await con.execute(sql, {scode}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
        console.log(result.rows[0]);
        res.send(result.rows[0]);
    }catch{
        console.log('로그인 체크', err);
    }finally{
        if(con) await con.close();
    }
});
module.exports = router;
