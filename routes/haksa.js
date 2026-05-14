var express = require('express');
var router = express.Router();
const { getConnection } = require('../connect');
const oracledb = require('oracledb');
const { autoCommit } = require('oracledb');

/* 교수페이지이동 */
router.get('/pro', function (req, res, next) {
    res.render('index', { title: '교수관리', pageName: 'haksa/professors.ejs' });
});

/*교수목록 데이터 */
router.get('/pro/list.json', async function (req, res) {
    let con;
    try {
        con = await getConnection();
        const sql="select p.*, to_char(hiredate, 'YYYY-MM-DD') fdate, to_char(salary, '99,999,999') fsalary from professors p";
        const result = await con.execute(sql, {}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
        res.send(result.rows);
    } catch (err) {

    } finally {
        if(con) await con.close();
    }
});

// 교수등록 페이지 이동
router.get('/pro/insert', async function(req, res){
    let con;
    let newcode='';
    try {
        con = await getConnection();
        const sql="select max(pcode)+1 code from professors";
        const result=await con.execute(sql);
        newcode = result.rows[0][0];
    }catch(err){
        console.log(err);
    }finally{
            console.log('code', newcode);
    res.render('index', {title:'교수등록', pageName:'haksa/professors_insert', code:newcode});
        if(con) await con.close();
    }
});

// 교수등록
router.post('/pro/insert', async function(req, res){
    const pcode=req.body.pcode;
    const pname=req.body.pname;
    const dept=req.body.dept;
    const hiredate=req.body.hiredate;
    const title=req.body.title;
    const salary=req.body.salary;
    console.log(pcode, pname, dept, hiredate, title, salary);
    let con;
    try{
        //ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD'; 서버에서 변경
        con = await getConnection();
        sql = `insert into professors(pcode, pname, dept, hiredate, title, salary) `;
        sql +=`values('${pcode}', '${pname}', '${dept}', TO_DATE('${hiredate}','YYYY-MM-DD'), '${title}', ${salary})`;
        console.log(sql);
        await con.execute(sql, {}, {autoCommit:true});
        res.sendStatus(200);
    }catch(err){
        console.log(err);
    }finally{
        if(con) await con.close();
    }
});

//교수 삭제
router.post('/pro/delete', async function(req, res){
    let con;
    const pcode=req.body.pcode;
    try{
        con = await getConnection();
        const sql = `delete from professors where pcode=${pcode}`;
        console.log(sql);
        await con.execute(sql, {}, {autoCommit:true});
        res.sendStatus(200);
    }catch(err){
        res.sendStatus(500);
        console.log(err);
    }finally{
        if(con) await con.close();
    }
});

/* 학생페이지이동 */
router.get('/stu', function (req, res, next) {
    res.render('index', { title: '학생관리', pageName: 'haksa/students.ejs' });
});

/* 강좌페이지이동 */
router.get('/cou', function (req, res, next) {
    res.render('index', { title: '강좌관리', pageName: 'haksa/courses.ejs' });
});

//학생 데이터 출력
router.get('/stu/list.json', async function (req, res) {
    let con;
    try{
        con = await getConnection();
        let sql = "select * from view_students";
        const result = await con.execute(sql, {}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
        res.send(result.rows);
    }catch(err){
        console.log(err);
    }finally{
        if(con) await con.close();
    }
});

//학생 입력 페이지로 이동
router.get('/stu/insert', async function(req, res){
    let con;
    try{
        con = await getConnection();
        let sql = "select max(scode)+1 from students";
        let result = await con.execute(sql, {});
        code = result.rows[0][0]
    }catch(err){

    }finally{
        if(con) await con.close();
    }
    res.render('index', {title:'학생등록', pageName:'haksa/students_insert.ejs', code});
});
//학생 등록
router.post('/stu/insert', async function(req, res){
    const scode = req.body.scode;
    const sname = req.body.sname;
    const dept = req.body.dept;
    const year = req.body.year;
    const birthday = req.body.birthday;
    const advisor = req.body.pcode;
    console.log(scode, sname, dept, year, birthday, advisor);
    let con;
    try{
        con = await getConnection();
        let sql = "insert into students(scode,sname,dept,year,birthday,advisor)"
        sql += "values(:scode,:sname,:dept,:year,:birthday,:advisor)";
        await con.execute(sql, {scode, sname, dept, year, birthday, advisor}, {autoCommit:true});
        res.sendStatus(200);
    }catch(err){
        res.sendStatus(500);
    }finally{
        if(con) await con.close()
    }
});

//학생 삭제
router.post('/stu/delete', async function(req, res){
    const scode = req.body.scode;
    let con;
    try{
        con = await getConnection();
        let sql = "delete from students where scode=:scode";
        await con.execute(sql, {scode}, {autoCommit:true});
        res.sendStatus(200);
    }catch{
        res.sendStatus(500);
    }finally{
        if(con) await con.close();
    }
})
module.exports = router;