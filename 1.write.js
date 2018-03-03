let fs = require('fs');
let WriteStream = require('./writeStream');
let ws = new WriteStream('./1.txt',{
    highWaterMark:3,
    flags:'w',
    autoClose:true,
    start:0,
    mode:0o666,
    encoding:'utf8'
});


let i = 9;
function write(){
    let flag = true;
    while(i>0&&flag){
        flag = ws.write(i--+'','utf8',function(){});
        console.log(flag)
    }
}
ws.on('drain',function(){
    console.log('drian');
    write();
})
write()