let ReadStream = require('./readStream');
let WriteStream = require('./writeStream');


let rs = new ReadStream('./1.txt',{
    start:0,
    end:5,
    flag:'r',
    highWaterMark:2
});

let ws = new WriteStream('./2.txt',{
    start:0,
    flags:'w',
    highWaterMark:1
})
rs.pipe(ws)