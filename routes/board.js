var express = require('express');
var router = express.Router();
const { getConnection } = require('../connect');
const oracledb = require('oracledb');
const { autoCommit } = require('oracledb');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '게시글', pageName:'board/list.ejs' });
});

//게시글 데이터 목록
router.get('/list.json', async function(req, res){
    const page = 4;
    const size = 10;
    const start = (page-1) * size;
    con = await getConnection();
    try{
        con = await getConnection();
        let sql = "select * from view_board order by id desc ";
        sql += `offset ${start} rows fetch next ${size} rows only`;
        let result = await con.execute(sql, {}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
        res.send(result.rows);
        console.log(result.rows);
    }catch(err){
        console.log(err);
    }finally{
        if (con) await con.close();
    }
})
module.exports = router;
