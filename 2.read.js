let fs  = require('fs');
let ReadStream = require('./readStream')
let rs = new ReadStream('./1.txt',{
    highWaterMark:3,
    start:3,
    encoding:'utf8',
    end:8,
    autoClose:true,
    flags:'r'
});
rs.on('open',function(){
    console.log('open')
})
rs.on('data',function(data){
    console.log(data)
})
rs.on('end',function(){
    console.log('结束')
})
rs.on('close',function(){
    console.log('关闭')
})