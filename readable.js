let fs = require('fs');
let ReadStream1 = require('./ReadStream1');
let rs = new ReadStream1('./1.txt',{
    highWaterMark:3,
    encoding:'utf8'
});

rs.on('readable',function(){
   let char = rs.read(1);
   console.log(char,this.length)
   char = rs.read(1);
   console.log(char,this.length)
   char = rs.read(1);
   console.log(char,this.length)
})