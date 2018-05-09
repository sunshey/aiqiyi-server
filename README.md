* [项目介绍](#项目介绍)




项目介绍
---
这是一个利用node开发的项目，主要由两部分组成：数据爬取和接口开发
* 数据源来自于node爬虫技术爬取的爱奇艺免费电影，用到的模块有request、cheerio、MySQL
* 接口采用resetful风格，比如这样：app.get('/movielist/:page/:limit',function(req,res){...},使用的模块有express、path、body-parser、fs、multer、util、MySQL、silly-datetime、https、http

前言
---
由于这个项目是使用node开发的，如果您的电脑没有安装node，[点此下载](http://nodejs.cn/download/ "node下载地址")，此外必要的node知识也是必不可少的，你可以通过这些网站来学习[node中文网](http://nodejs.cn/api/)、[菜鸟教程](https://www.runoob.com/nodejs/nodejs-install-setup.html)，还有其他学习的网站可以自己去寻找:smiley:

使用技术分析
---
