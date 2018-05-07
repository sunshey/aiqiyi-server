const cheerio = require('cheerio')

var html='<h2 class="title">Hello world</h2> <div class="content"><a href=""><p>这是一段HTML片段</p>这是一个链接</a></div><div><p>这是第二个HTML片段</p></div><input type="text" value="test"/>'
// const $ = cheerio.load(html)
// console.log($('h2.title').text())
// $('h2').addClass('welcome')
// console.log($('.title').attr('id',"test").html())
// console.log($('input[type="text"]').val());
// console.log($('input[type="text"]').val('test').html());
// console.log($('.content').text());
// console.log($('.content').hasClass('content'));
// console.log($('div').hasClass('content'));
// console.log($('.content').find('p').length);
// console.log($('a').parent().attr('class'));
// // console.log($('.title').nextAll().html());
// console.log($('div').slice(1,2).length);

// console.log($('.content').children('p').text());
// console.log($('p').parents().html());
// console.log($('.title').next().hasClass('content'));

// console.log($.is('.content'));
// console.log($.html())
var html2 = '<ul id="fruits"><li class="apple">Apple</li><li class="orange">Orange</li><li class="pear">Pear</li></ul>'
const $= cheerio.load(html2)

// var fruits = [];
// $('li').each(function(i,elem){
// 	fruits[i]= $(this).text();
 
// })
// fruits.join(',');

// $('li').map(function(i,e1){
// 	return $(this).attr('class');
// }).join(',');

console.log($('li').filter('.orange').text())
console.log($('ul').children().first().html());
console.log($('ul').children().last().text());
console.log($('li').eq(-1).text());
// console.log(fruits);