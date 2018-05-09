项目介绍
---
这是一个利用node开发的项目，主要有两部分组成：数据爬取和接口开发
* 数据源来自于使用node爬虫技术爬取的爱奇艺免费电影，用到的模块有request、cheerio、MySQL
* 接口采用resetful风格，比如这样：app.get('/movielist/:page/:limit',function(req,res){...},使用的模块有express、path、body-parser、fs、multer、util、MySQL、silly-datetime、https、http
