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

//게시글 등록 페이지
router.get('/insert', function(req, res){ //insert 요청이 들어오면 (글쓰기 버튼 눌렀을 때)
    res.render('index', {title:'글쓰기', pageName:'posts/insert.ejs'}); //insert.ejs로 보내기
})

//게시글 등록
router.post('/insert', async function(req, res){ //게시글 저장 버튼 눌르면
    const title=req.body.title; //제목 보낸거 저장
    const content=req.body.content; //내용 보낸거 저장
    const writer=req.body.writer; //작성자 보낸거 저장
    let con;
    try{
        con = await getConnection();
        let sql="insert into posts(id, title, content, writer, reg_date) values(post_id.nextval, :title, :content, :writer, sysdate)"; // posts 테이블에 id, title, content, writer, reg_date 칼럼에 제목, 내용, 작성자, 실시간 넣기
        con.execute(sql, {title, content, writer}, {autoCommit:true}); // 바인드 변수로 위에 저장했던거 넣기
        res.sendStatus(200);
    }catch(err){
        console.log(err)
    }finally{
        if(con) await con.close();
    }
})

//게시글 정보 페이지
router.get('/:id', async function(req, res){ //게시글 눌러서 어떤 id값이 들어오든
    const id = req.params.id; // 그 게시글에 id 값을 넣고
    let con;
    try{
        con = await getConnection();
        let sql = "select * from view_posts where id=:id"; //게시글 뷰에 내용 다 가져오기
        let result = await con.execute(sql, {id}, {outFormat:oracledb.OUT_FORMAT_OBJECT}); //바인드 변수에 id 넣고 실행
        let post = result.rows[0]; //제일 첫번째 값 넣기
        //console.log(post);
        res.render('index', {title:'게시글 정보', pageName:'posts/read.ejs', post}); //read.ejs로 post로 보내라
    }catch(err){
        console.log('글정보', err);
    }finally{
        if(con) await con.close();
    }
});

//게시글 수정 페이지
router.get('/update/:id', async function(req, res) { //글수정 버튼 눌렀으면 (read.ejs 에 있음) (posts.ejs 에 있음)
    const id = req.params.id; //주소에서 id값 가져오고
    let con;
    try{
        con = await getConnection();
        let sql = "select * from view_posts where id=:id"; //게시글 뷰에 있는 id가 같은 것을 가지고오고
        let result = await con.execute(sql, {id}, {outFormat:oracledb.OUT_FORMAT_OBJECT}); //바인드 변수에 id값 넣기
        let post = result.rows[0]; //실행되서 나온 결과 넣기
        //console.log(post);
        res.render('index', {title:'글수정', pageName:'posts/update.ejs', post}); //update로 요청 보내고 post에 저장된 값 넣기
    }catch(err){
        console.log('글수정 페이지', err.message);
    }finally{
        if(con) await con.close();
    }
});

//게시글 삭제
router.post('/delete', async function(req, res){ //삭제 버튼이 눌렸으면 (read.ejs 에 있음)
    const id=req.body.id; //보낸 id 받고
    let con;
    try{
        con = await getConnection();
        let sql = "delete from posts where id=:id"; //게시글 테이블에 있는 게시글 id가 삭제하고자 하는 id와 같은 게시글을 삭제해라
        await con.execute(sql, {id}, {autoCommit:true}); //바인드 변수에 id 넣어라
        res.sendStatus(200);
    }catch(err){
        console.log('글삭제', err.message);
        res.sendStatus(500);
    }finally{
        if(con) await con.close();
    }
})

//게시글 수정
router.post('/update', async function(req, res){ //저장 버튼이 눌렸으면 (update.ejs 에 있음)
    const id=req.body.id; //받은 id값 넣고
    const title=req.body.title; //받은 title값 넣고
    const content=req.body.content; //받은 content값 넣고
    console.log(id, title, content);
    try{
        con = await getConnection();
        let sql="update posts set title=:title, content=:content where id=:id"; // 게시글 테이블에 id가 같은 게시글 넣기
        await con.execute(sql, {id, title, content}, {autoCommit:true}); //바인드 변수에 id, title, content 넣기
        res.sendStatus(200);
    }catch(err){
        console.log('글수정', err.message);
    }
});

module.exports = router;