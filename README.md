* [项目介绍](#项目介绍)
* [前言](#前言)
* [技术分析](#使用技术分析)
* [注意事项](#注意事项)



项目介绍
---
这是一个利用node开发的项目，主要由两部分组成：数据爬取和接口开发
* 数据源来自于node爬虫技术爬取的爱奇艺免费电影，用到的模块有request、cheerio、MySQL
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
     response是返回页面信息包括状态，响应头，响应体等，body是响应HTML页面body数据  
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
 ##### MySQL在爬虫项目和接口项目中都用到了，因此单独拿出来分析一下

* **接口项目**

注意事项
---
