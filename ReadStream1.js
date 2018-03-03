// 暂停模式
let fs = require('fs');
let EventEmitter = require('events');
class ReadStream extends EventEmitter{
    constructor(path,options){
        super();
        this.path = path;
        this.highWaterMark = options.highWaterMark|| 64*1024;
        this.autoClose = options.autoClose|| true;
        this.start = options.start||0;
        this.encoding = options.encoding||'utf8';
        this.mode = options.mode||0o666
        this.flags = options.flags || 'r';
        // 构建一个读取的buffer
        this.buffers = [];
        // 构建缓存区大小
        this.length = 0;
        this.pos = 0;
        this.reading = false
        this.open();
        // 监听新事件
        this.on('newListener',(type,fn)=>{
            if(type === 'readable'){
                // 如果是暂停模式一上来就读取
                this.read(0);
            }
        })
    }
    read(n){
        let buffer;
        if(n>0&&n<=this.length){
            buffer = Buffer.alloc(n);
            let index =0;
            let b;
            let flag = true;
            while(flag&&(b=this.buffers.shift())){
                for(let i = 0;i<b.length;i++){
                    buffer[index++] = b[i];
                    if(index == n){
                        b = b.slice(i+1);
                        this.buffers.unshift(b);
                        this.length -=n;
                        flag = false
                        break
                    }
                }
            }
        }
        if(typeof this.fd!=='number'){
            return this.once('open',()=>this.read(n));
        }
        // 如果内存不为空 并且内存小于最高水位先 就去读
        if(this.length<this.highWaterMark){
            if(!this.reading) { // 正在读取就不读了
                this.reading = true
                this._read();
            };
        }
        return  buffer&&buffer;
    }
    _read(){
        this.buffer = Buffer.alloc(this.highWaterMark);
        fs.read(this.fd,this.buffer,0,this.highWaterMark,this.pos,(err,bytes)=>{
            this.pos += bytes;
            this.buffers.push(this.buffer);// 读取到内存中
            let a = this.length;
            this.length +=bytes;
            this.reading = false;
            if(bytes>0)if(a==0)this.emit('readable');
        })
    }
    open(){
        fs.open(this.path,this.flags,this.mode,(err,fd)=>{
            if(err){
                if(this.autoClose){
                    this.destory()
                }
            }
            this.fd = fd;
            this.emit('open')
        });
    }
    destory(){
        fs.close(this.fd,function(){
            this.emit('close');
        });
    }
}
module.exports = ReadStream