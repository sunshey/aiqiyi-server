
var request = require('request')
var cheerio = require('cheerio');
var mysql  = require('mysql')
var url = 'http://list.iqiyi.com/www/1/----------0---11-1-1-iqiyi--.html'

var connection = mysql.createConnection({
	host : "localhost",
	user : "root",
	password : "123456",
	database : "aiqiyi"
});
connection.connect();

var sql = 'INSERT INTO freemovie(moviename,moviecover,moviescore,movieactor,movieurl) VALUES (?,?,?,?,?)'

var getNewsList = function(url,done){
	request(url,function(err,response,body){
		if (err) {
			console.log(err);
			return
		}
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

			movies.push(movie)
		})
		// movies.join(', ')
		console.log(movies);
		console.info('----------------------------------------');

		if (!$('span').hasClass('noPage')||$('.mod-page').find('.noPage').text()=="上一页") {
			let url= 'http://list.iqiyi.com'.concat($('.mod-page').find('a').last().attr('href'))
			getNewsList(url)
		}
		// console.info($('.mod-page').find('a').last().attr('href'))
		// console.log(table);
		// console.log(data.body.toString());
	});
	// connection.end();

}


var detailSql = 'INSERT INTO moviedetail(movie_id,movie_pic,movie_name,movie_director,movie_place,movie_type,movie_actor,movie_introduce) VALUES (?,?,?,?,?,?,?,?)'

function getDetail(id,url,actor,done) {
	// console.log('getDetail',url);
	request(url,function(err,res,body){
		if (err) {
			console.error(err);
			return
		}
		// console.log(body);
		var $ =	cheerio.load(body)
		var detail={
			"movie_id":"",
			"movie_pic":"",
			"movie_name":"",
			"movie_director":"",
			"movie_place":"",
			"movie_type":"",
			"movie_actor":"",
			"movie_introduce":""
		}

		detail["movie_pic"] = "http:".concat($('.vInfoSide_vNCon').find('img').attr('src'))
		detail["movie_name"] = $('.vInfoSide_ul').find('li').children().eq(0).attr('title')
		detail["movie_director"] = $('.vInfoSide_ul').find('li').find('a').attr('title')
		detail["movie_place"]= $('.vInfoSide_ul').find('li').find('span').children().attr('title')
		detail["movie_type"] =  $('.vInfoSide_ul').find('li').last().find('a').attr('title')
		// console.log($('.vInfoSide_ul').find('li').last().find('a').attr('title'));
		// $('.vInfoSide_startR').find('span').each(function(i,elem){
		// 	detail["movie_actor"] = detail["movie_actor"].concat($(this).text())
		// })
		detail["movie_actor"] = $('.vInfoSide_startR').find('span').text()
		detail["movie_introduce"] = $('.partDes').attr('title')
		 console.log(detail);
		var deatailParams = [id,detail["movie_pic"],detail["movie_name"],detail["movie_director"],detail["movie_place"],detail["movie_type"],actor,detail["movie_introduce"]]
		connection.query(detailSql,deatailParams,function(err,results,fields){
			if (err) {
					console.log("[INSERT ERROR] -",err.message);
					return;
				};
				console.log('----------------INSERT-------------------');
				console.log('INSERT ID:',results.insertId);
				console.log('--------------------------------------------\n\n');
		})
		 // = $('.vInfoSide_vNCon').find('img').attr('title')

		//
	})
}

getNewsList(url)

// getDetail("http://www.iqiyi.com/v_19rrjaeap4.html#vfrm=2-4-0-1")