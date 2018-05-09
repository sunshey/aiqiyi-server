const express = require('express');
var path = require('path')
var bodyParser = require('body-parser')
var fs = require('fs')
var multer = require('multer')
var util = require('util')
const mysql = require('mysql')
var constant = require('./aiqiyiConstant')
var app = new express()
var sd = require('silly-datetime');
var https = require('https');
var http = require('http');
var privateKey = fs.readFileSync('private.pem', 'utf8');
var certificate = fs.readFileSync('file.crt', 'utf8');
var credentials = {
	key:privateKey,
	cert:certificate
}

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials,app);
const PORT= 8080
const SSLPORT  =8081


app.use(express.static('public'))//指定允许访问的静态文件路径，包括HTML代码，css样式，图片等
var urlencodedParser = bodyParser.urlencoded({extended:false}) // 设置请求解析器
var storage = multer.diskStorage({
	destination:function(req,file,cb){
		//设置上传后文件路径，uploads文件夹会自动创建。
		cb(null,'./public/upload')
	},
	  // 给上传文件重命名，获取添加后缀名
	  filename: function (req, file, cb) {
	  	var fileFormat = (file.originalname).split(".");
	  	cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
	  }
	})
app.use(multer({storage:storage}).array('image'))//指定文件上传的路径和上传文件重命名

var connection=mysql.createConnection({
	host : constant.host,
	user : constant.user,
	password : constant.password,
	database : constant.database
})
connection.connect();
var querySql = 'SELECT * FROM freemovie limit ?,? '

//获取列表
app.get('/movielist/:page/:limit',function(req,res){

	console.log("get");
	var page =req.params.page
	var limit = req.params.limit
	try{
		page = Number(page);
		limit= Number(limit)
	}catch (err){
		res.writeHead(404,{"Content-Type":'text/html;charset=utf-8'});
		res.send('页码必须为正整数')
	}
	var queryParams = [(page-1)*limit,limit];
	connection.query(querySql,queryParams,function(err,results){
		if (err) {
			console.log("[SELECT ERROR] -",error.message);
			return;
		}
		res.writeHead(200,{"Content-Type":'text/html;charset=utf-8'});

		var result ={
			"code":1,
			"message":"",
			"data":results
		}
		res.end(JSON.stringify(result))
	})	

})

app.post('/movielist',urlencodedParser,function(req,res){
	var params ={
		"page":req.body.page,
		"limit":req.body.limit
	}
	console.log(params);

	try{
		page = Number(params["page"]);
		limit= Number(params['limit'])
	}catch (err){
		res.writeHead(404,{"Content-Type":'text/html;charset=utf-8'});
		res.send('页码必须为正整数')
	}
	var queryParams = [(page-1)*limit,limit];
	connection.query(querySql,queryParams,function(err,results){
		if (err) {
			console.log("[SELECT ERROR] -",err.message);
			return;
		}
		res.writeHead(200,{"Content-Type":'text/html;charset=utf-8'});

		var result ={
			"code":1,
			"message":"",
			"data":results
		}
		res.end(JSON.stringify(result))
	})	
})

/**电影详情**/
app.post('/movie_detail',urlencodedParser,function(req,res){
	var params = {
		"movie_id":req.body.movie_id
	}
	var detailSql = 'SELECT * FROM moviedetail where movie_id = ?'
	var detailParams=[params["movie_id"]]
	connection.query(detailSql,detailParams,function(err,results){
		if (err) {
			console.log("[SELECT ERROR] -",err.message);
			return;
		}
		res.writeHead(200,{"Content-Type":'text/html;charset=utf-8'});

		var result ={
			"code":1,
			"message":"",
			"data":results[0]
		}
		console.log( results[0]);
		res.end(JSON.stringify(result))
	})
})

/**上传图片**/

app.post('/upload_image',function(req,res){
	console.log(req.files[0]);
	var des_file = __dirname+'/'+req.files[0].originalname;
	fs.readFile(req.files[0].path, function(err,data){
		if (err) {
			console.log(err);
		}else{
			var data ='upload/'+ req.files[0].filename

			response ={
				"code":1,
				"message":"File uploaded successfully",
				"data":data
			}
			res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'})
		}
		res.end(JSON.stringify(response))

		// fs.writeFile(des_file, data, function(err){
			
		// });
	});
})


/**上传论坛**/
app.post('/upload_forum',urlencodedParser,function(req,res){
	var params= {
		'user_id':req.body.user_id,
		'info':req.body.info,
		'images':req.body.images
	}

	var insertImgSql = 'INSERT INTO forum(user_id,info,images,pub_date) VALUES (?,?,?,?)'
	var insertImgParams = [params['user_id'],params['info'],params['images'],sd.format(new Date(), 'YYYY-MM-DD HH:mm')]
	connection.query(insertImgSql,insertImgParams,function(err,fields){
		if (err) {
			console.log(err.message);
			return
		}

		res.writeHead(200,{"Content-Type":'text/html;charset=utf-8'});

		var result ={
			"code":1,
			"message":"",
			"data":"已成功发表论坛信息，请关注审核消息"
		}
		res.end(JSON.stringify(result))
	})
})
/**
获取论坛信息**/
app.post('/getForumList',urlencodedParser,function(req,res){
	var params = {
		'user_id':'',
		'page' : req.body.page,
		'limit' :req.body.limit
	}

	try{
		page = Number(params["page"]);
		limit= Number(params['limit'])
	}catch (err){
		res.writeHead(404,{"Content-Type":'text/html;charset=utf-8'});
		res.send('页码必须为正整数')
	}

	var querySql = 'SELECT forum.`user_id`,forum.`images`,forum.`info`,forum.`pub_date`,user.`avtor`,user.`nickname`,user.`phone`,user.`sv`,user.`username` FROM forum   JOIN USER ON (forum.`user_id`= user.`id`)  '
	
	var arr = Object.keys(req.body);  
	console.log(arr,arr.length);
	var queryParams = []
	if (arr.indexOf("user_id")!= -1) {
		params['user_id'] = req.body.user_id
		querySql = querySql + 'WHERE forum.`user_id`= ? '
		queryParams = queryParams.concat(params['user_id'])
	}
	querySql =querySql+'LIMIT ?,?'
	queryParams =queryParams.concat((page-1)*limit,limit)
	console.log(querySql);
	connection.query(querySql,queryParams,function(err,results){
		if (err) {
			console.log("[SELECT ERROR] -",err.message);
			return;
		}
		// console.log(results);
		res.writeHead(200,{"Content-Type":'text/html;charset=utf-8'});
		var response = {
			"code":1,
			"message":"",
			"data": results
		}
		res.end(JSON.stringify(response))

	})

})

app.post("/update_info",urlencodedParser,function(req,res){
	var params = {
		"user_id" : req.body.user_id,
		'ivtor' : "",
		'nickname' : "",
		'phone' : ""
	}
//phone = ? , nickname =?,avtor = ? WHERE id = ?
	var updateSql = 'UPDATE USER SET '
	var updateParams = []
	var arr = Object.keys(req.body);
	if (arr.indexOf('ivtor')!=-1) {
		params['ivtor'] = req.body.ivtor
		updateSql = updateSql + 'avtor =?'
		updateParams = updateParams.concat(params['ivtor'])
	}
	if (arr.indexOf('nickname')!=-1) {
		params['nickname'] = req.body.nickname
		updateSql = updateSql + 'nickname = ?'
		updateParams = updateParams.concat(params['nickname'])

	}
	if (arr.indexOf('phone')!=-1) {
		params['phone'] = req.body.phone
		updateSql = updateSql + 'phone = ?'
		updateParams = updateParams.concat(params['phone'])
	}
	updateSql = updateSql +' WHERE id = ?'
	updateParams = updateParams.concat(params['user_id'])
	connection.query(updateSql,updateParams,function(err,results){
		if (err) {
			console.log('[UPDATE ERROR] -',err.message);
			return
		}
		var querySql ='SELECT * FROM user WHERE id =?'
		var queryParams = [params['user_id']]
		connection.query(querySql,queryParams,function(err,results){
			if (err) {
				console.log('[SELECT ERROR] -',err.message);
				return
			}
			var response= {
				'code' : 1,
				'message' :'',
				'data' : results[0]
			}
			res.end(JSON.stringify(response))
		})

	})

})

app.post('/register',urlencodedParser,function(req,res){
	var params = {
		'phone' :req.body.phone,
		'pwd' :req.body.pwd,
		'imeil':req.body.imeil,
		'sv':req.body.sv
	}

	var registerSql = 'INSERT INTO user(phone,password,imeil,sv) VALUES (?,?,?,?)'
	var registerParams = [params['phone'],params['pwd'],params['imeil'],params['sv']]
	connection.query(registerSql,registerParams,function(err,results){
		if (err) {
			console.log('[INSERT ERROR] -',err.message);
		}
		res.writeHead(200,{"Content-Type":'text/html;charset=utf-8'});
		var response = {
			"code":1,
			"message":"",
			"data": results[0]
		}
		res.end(JSON.stringify(response))

	})
})

app.post('/login',urlencodedParser,function(req,res){
	var params = {
		'phone' : req.body.phone,
		'pwd' : req.body.pwd
	}

	var querySql = "SELECT * FROM user WHERE phone =? and password =?"
	var queryParams = [params['phone'],params['pwd']]
	connection.query(querySql,queryParams,function(err,results){
		if (err) {
			console.log('[SELECT ERROR] -',err.message);
		}
		console.log(results);
		res.writeHead(200,{"Content-Type":'text/html;charset=utf-8'});
		var response = {
			"code":1,
			"msg":"",
			"data": null
		}
		if (results.length>0) {

			response["data"] =results[0]
		}else{
			response["msg"] = "用户名或密码错误"
		}
		
		
		res.end(JSON.stringify(response))
	})

})


// var server=app.listen(8080,function(){
// 	var host = server.address().address
// 	var port = server.address().port
// 	console.log("应用实例，访问地址为http://%s:%s" ,host,port);
// })

var hs=httpServer.listen(PORT,function(){
	// console.log('HTTP Server is running on:http://localhost:%s',PORT);
	var host = hs.address().address
	var port = hs.address().port
	console.log("应用实例，访问地址为http://%s:%s" ,host,port);

})

var hss=httpsServer.listen(SSLPORT,function(){
	// console.log('HTTP Server is running on:https://localhost:%s',SSLPORT);
	var host = hss.address().address
	var port = hss.address().port
	console.log("应用实例，访问地址为http://%s:%s" ,host,port);
})

// connection.end()