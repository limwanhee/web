var express = require('express');
var router = express.Router();
var {getConnection} = require('../connect')
var oracledb = require('oracledb')

router.get('/', function(req, res, next) {
  res.render('index', { title: '게시글', pageName:'posts/list.ejs' }); //그냥 posts 요청만 들어오면 posts/list.ejs 출력
});

router.get('/list.json',async function(req, res) { // 게시물의 총 갯수와 검색 결과를 내보내기 위한 곳
    let page = parseInt(req.query.page) || 1; //get 방식으로 받으니 query에서 페이지를 받아오고 받아왔으면 현재 페이지 수 아니면 1 기본 페이지
    let size = parseInt(req.query.size) || 5; // 받아오고 최대 게시물 보여주는 크기는 정한 크기 아니면 5개까지
    let word = req.query.word || ''; //검색용 단어
    let offset_rows = (page - 1) * size; //몇 페이지 이상부터 보여주게 할지 정하는 변수
    let con;
    let list;
    let count;
    try{
        con = await getConnection();
        let sql = "select * from view_posts "; //게시판 테이블 뷰 모든 컬럼 보여주는데
            sql += `where title like '%${word}%' or content like '%${word}%' or sname like '%${word}%' `; //제목이나 내용이나 글쓴이가 검색 단어에 포함되는 것을
            sql += "order by id desc "; //id 기준으로 내림차순
            sql += `offset ${offset_rows} rows fetch next ${size} rows only`; //offset_rows 페이지 부터 다음 size개만
        let result = await con.execute(sql, {}, {outFormat:oracledb.OUT_FORMAT_OBJECT}); //sql 실행
        list = result.rows; //실행 결과 list에 저장
        sql = "select count(*) from view_posts "; //뷰 게시물 테이블 갯수 불러와라
        sql += `where title like '%${word}%' or content like '%${word}%' or sname like '%${word}%'`; //제목이나 내용이나 글쓴이가 검색 단어에 포함되는 것을
        result = await con.execute(sql); //sql 실행
        count = result.rows[0][0]; //카운트 수 저장
        res.send({list, count}); //검색 결과랑 게시물 갯수를 불러와라
    }catch(err){
        console.log('게시글 데이터', err.message);
    }finally{
        if(con) await con.close();
    }
});
module.exports = router;