var express = require('express');
var router = express.Router();
var {getConnection} = require('../connect')
var oracledb = require('oracledb')

router.get('/', function(req, res, next) {
  res.render('index', { title: '게시글', pageName:'posts/list.ejs' });
});

router.get('/list.json',async function(req, res) {
    let page = parseInt(req.query.page) || 1;
    let size = parseInt(req.query.size) || 5;
    let word = req.query.word || '';
    let offset_rows = (page - 1) * size;
    let con;
    let list;
    let count;
    try{
        con = await getConnection();
        let sql = "select * from view_posts ";
            sql += `where title like '%${word}%' or content like '%${word}%' or sname like '%${word}%' `;
            sql += "order by id desc ";
            sql += `offset ${offset_rows} rows fetch next ${size} rows only`;
        let result = await con.execute(sql, {}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
        list = result.rows;
        sql = "select count(*) from view_posts ";
        sql += `where title like '%${word}%' or content like '%${word}%' or sname like '%${word}%'`;
        result = await con.execute(sql);
        count = result.rows[0][0];
        res.send({list, count});
    }catch(err){
        console.log('게시글 데이터', err.message);
    }finally{
        if(con) await con.close();
    }
});
module.exports = router;