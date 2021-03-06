* [项目介绍](#项目介绍)
* [前言](#前言)
* [技术分析](#使用技术分析)
* [注意事项](#注意事项)



项目介绍
---
这是一个利用node开发的项目，主要由两部分组成：数据爬取和接口开发
* 数据源来自于node爬虫技术爬取的爱奇艺各种类型电影，用到的模块有request、cheerio、MySQL
* 接口采用resetful风格，比如这样：app.get('/movielist/:page/:limit',function(req,res){...},使用的模块有express、path、body-parser、fs、multer、util、MySQL、silly-datetime、https、http

前言
---
由于这个项目是使用node开发的，如果您的电脑没有安装node，[点此下载](http://nodejs.cn/download/ "node下载地址")，此外必要的node知识也是必不可少的，你可以通过这些网站来学习[node中文网](http://nodejs.cn/api/)、[菜鸟教程](https://www.runoob.com/nodejs/nodejs-install-setup.html)，还有其他学习的网站可以自己去寻找 :smiley:。  
另外这个项目用到了https协议，因此需要了解一下关于ssl证书的相关知识，可以参考下这个[https和express](https://blog.csdn.net/u012353243/article/details/53409159)。

最后我想说的是我也是新手，如果想交流可以加qq:2037097758
##### node中的npm(包管理器)是全球最大的模块管理工具，这个也要好好学下

使用技术分析
---
使用模块按项目分析如下：
* **爬虫项目**
  * request  
   request是网络请求模块，通过请求指定的url获取响应的HTML页面，用法如下：  
   ```
   request(url,function(err,response,body){
     if (err) {
       console.log(err);
       return
     }
     ...}
    ```
     response返回页面信息包括状态，响应头，响应体等，body是响应HTML页面body数据  
     这只是它的基本用法，详细用法可参考[官方说明](https://github.com/request/request)  
    * cheerio  
  cheerio模块用来将request请求返回的数据按照节点、属性进行解析，有点类似于Python中的xpath语法，用法如下：
    ```
    var $ = cheerio.load(body);
		// console.log($('.site-piclist').find('li').length);
		var movies=[]
		$('.site-piclist').find('li').each(function(i,elem){
			var movie={
				'movie_name':"",
				'movie_cover':"",
				'movie_score':'',
				'movie_actor':'主演：',
				'movie_url':''
			}
			movie['movie_cover']='http:'.concat($(this).find('.site-piclist_pic').find('img').attr('src'))
			movie['movie_name']=$(this).find('.site-piclist_info').find('p').find('a').attr("title")
			movie['movie_score']=$(this).find('.site-piclist_info').find('.score').text()
			movie['movie_url']=$(this).find('.site-piclist_pic').find('a').attr('href')

			$(this).find('.site-piclist_info').find('.role_info').find('em').each(function(j,elem){
				if ($(this).children().length>0) {
					movie['movie_actor']=movie['movie_actor'].concat($(this).find('a').attr('title'))

				}
			})
   ```
   当然详细用法参考[说明](http://cnodejs.org/topic/5203a71844e76d216a727d2e)
* **mysql**  
mysql大家都很熟悉了，数据库操作，增删改查。这里也列举一下用法：
```
var connection = mysql.createConnection({
	host : "localhost",
	user : "root",
	password : "123456",
	database : "aiqiyi"
});
connection.connect();
var sql = 'INSERT INTO freemovie(moviename,moviecover,moviescore,movieactor,movieurl) VALUES (?,?,?,?,?)'
var sqlParam =[movie['movie_name'],movie['movie_cover'],movie['movie_score'],movie['movie_actor'],movie['movie_url']];
			connection.query(sql,sqlParam,function(err,results,fields){
				if (err) {
					console.log("[INSERT ERROR] -",err.message);
					return;
				};
				console.log('----------------INSERT-------------------');
				console.log('INSERT ID:',results.insertId);
				getDetail(results.insertId,movie['movie_url'],movie['movie_actor'])
				console.log('--------------------------------------------\n\n');
			})
   ...}
 ```
 想更深入学习，查看[官方说明](http://www.runoob.com/nodejs/nodejs-mysql.html)
 ##### 特别说明：MySQL在爬虫项目和接口项目中都用到了，因此单独拿出来分析一下

* **接口项目**  
REST是Roy Thomas Fielding博士在2000年博士论文中提出的网络请求规范，它简化了网络请求接口，由此受到了越来越多web程序员的青睐，因此这次项目中也采用了restful风格  
	* express  
	express模块是开发接口的核心模块，它负责处理路由选择、请求方式、参数解析、响应数据等等，可以说这里所有的模块都为这个模块服务，因此要想写好接口，必须要学好这个模块，它的用法如下：
	```
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
	...}
	```
	详细用法参考[说明](http://www.runoob.com/nodejs/nodejs-express-framework.html)  
	* path  
	path模块主要是操作文件路径，项目中没有用到，用法参考[说明](http://nodejs.cn/api/path.html)
	* body-parser  
	这个模块用来解析请求的数据，用法在上面已经列出，具体参考[说明](https://blog.csdn.net/bystarlight/article/details/72639340)
	* fs  
	文件读写模块，用法如下：
	```
	fs.readFile(req.files[0].path, function(err,data){
			if (err) {
				console.log(err);
			}else{
				var data ='upload/'+ req.files[0].filename
			...}
			}
	```
	具体用法参考[说明](http://www.runoob.com/nodejs/nodejs-fs.html)
	* multer  
	处理文件上传的中间件模块，用法在express模块已展示，详细用法参考[说明](http://cnodejs.org/topic/564f32631986c7df7e92b0db)
	* util  
	util 是一个Node.js 核心模块，提供常用函数的集合，用于弥补核心JavaScript 的功能 过于精简的不足。用法参考[说明](http://www.runoob.com/nodejs/nodejs-util.html)
	* mysql  
	* silly-datetime  
将时间按指定的格式显示、存储，用法:sd.format(new Date(), 'YYYY-MM-DD HH:mm'),具体用法参考[说明](https://www.npmjs.com/package/silly-datetime)
	* http
	* https  
	http和https这两个模块用来指定请求协议，创建服务器等操作，项目中主要用来做https请求接口，用法如下：
	```
	var privateKey = fs.readFileSync('private.pem', 'utf8');
	var certificate = fs.readFileSync('file.crt', 'utf8');
	var credentials = {
		key:privateKey,
		cert:certificate
	}

	var httpServer = http.createServer(app);
	var httpsServer = https.createServer(credentials,app);
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
	//代码中的private.pem和file.crt是通过openssl工具生成的签名key和认证证书
	```
	

注意事项
---
1. ###### 使用npm安装模块时，尽量不要全局安装，要单独为每个项目安装模块，例如：npm install express --save
2. ###### 在项目中使用的常量可以单独写在一个js文件中，比如数据库的配置文件，使用module.exports导入，就像这样
```
module.exports = {
	"host":"localhost",
	"user":"root",
	"password":"123456",
	"database":"aiqiyi",
	 test:test
};
var constant = require('./aiqiyiConstant')
var connection=mysql.createConnection({
	host : constant.host,
	user : constant.user,
	password : constant.password,
	database : constant.database
})
```
3. ###### 项目中要是用到了https协议，需要通过openssl生成: 私钥、CSR证书签名、证书文件，同时还要选择一个CA机构来认证证书，网上推荐的是【又拍的】[Let's Encrypt DV SSL 单域名证书](https://console.upyun.com/toolbox/ssl/),还要有自己的域名
4. ###### 开发中比较难的sql语句就是多表查询，项目中使用如下：
```
var querySql = 'SELECT forum.`user_id`,forum.`images`,forum.`info`,forum.`pub_date`,user.`avtor`,user.`nickname`,user.`phone`,user.`sv`,user.`username` FROM forum   JOIN USER ON (forum.`user_id`= user.`id`)  '
````
###### 接口开发说白了就是数据库的增删改查，因此sql语句一定要会，如果不确定sql语句写的对不对，可以先在数据库可视化工具SQLyog测试，没有问题在写在接口里
5. ###### 项目中用的MySQL数据库，数据库名是aiqiyi,有四张表moviefree(爬取的爱奇艺电影数据)、moviedetail(电影详情页)、user(用户信息)、forum(论坛信息)。总结一下常用的MySQL命令：  
* show databases;  --显示所有的数据库
* use aiqiyi;  --使用数据库中名为aiqiyi的数据库
* show tables;   --显示aiqiyi中所有的表
* show columns from user; | desc user; --显示user表中所有字段
* select * from user;  --显示user表中所有数据
* insert into user(username,password,phone) values ("","","");  --向user表中添加数据
* update user set username ="aa" where id =1;  --更新user表中id为1的数据
* delete from user where id=1;  --删除user表中id为1的数据
* delete from user;  --删除user表中所有数据，保留行标
* TRUNCATE TABLE user;  --清空user表所有数据，不保留行标
* ALTER TABLE test CHANGE NAME newname VARCHAR(50);  --将test表中name字段改为newname,并使用指定的类型
* DROP TABLE test;  --删除test表
* ALTER TABLE dishes MODIFY COLUMN id VARCHAR(10); --修改dishes表中id类型
* SELECT * FROM dishes GROUP BY cover HAVING COUNT(cover) > 1;  --从dishes表中查询重复数据
* DELETE FROM dishes WHERE id IN (SELECT id FROM (SELECT id FROM dishes WHERE cover IN (SELECT cover FROM dishes GROUP BY cover HAVING COUNT(cover)>1)  AND id NOT IN(SELECT MIN(id) FROM dishes GROUP BY cover HAVING COUNT(cover)>1)) AS tmpresult);  --从dishes表中删除重复数据  
