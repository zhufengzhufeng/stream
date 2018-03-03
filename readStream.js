// flowing模式
let fs = require('fs');
let EventEmitter = require('events');
class ReadStream extends EventEmitter{
    constructor(path,options){
        super();
        this.path = path;
        this.start = options.start;
        this.encoding = options.encoding;
        this.end = options.end;
        this.pos= this.start;
        this.flags = options.flags||'r';
        this.highWaterMark = options.highWaterMark|| 64*1024;
        this.autoClose = options.autoClose|| true;

        // 流动模式
        this.flowing = null;
        // 每次读多少
        this.buffer = Buffer.alloc(this.highWaterMark);
        // 打开文件
        this.open();
        this.on('newListener',function(type,fn){
            // 新事件
            if(type === 'data'){
                this.flowing = true
                this.read();
            }
        })
    }
    read(){
        if(typeof this.fd != 'number'){
            return this.once('open',()=>this.read());
        }
        // 读几个
        let n = Math.min(this.end-this.pos+1,this.highWaterMark);
        fs.read(this.fd,this.buffer,0,n,this.pos,(err,bytes)=>{
            if(bytes){
                this.pos+=bytes
                this.emit('data',this.buffer.slice(0,bytes).toString(this.encoding));
                if(this.flowing)this.read();
            }else{
                this.emit('end');
            }
        })
    }
    open(){
        fs.open(this.path,this.flags,(err,fd)=>{
            if(err){
                if(this.autoClose){
                    this.destory();
                }
            }
            this.fd = fd;
            this.emit('open')
        })
    }
    destory(){
        if(typeof fd !=number){
            return this.emit('close')
        }
        fs.close(this.fd,()=>{
            this.emit('close');
        })
    }
    pipe(dest){
        this.on('data',(chunk)=>{
            let flag = dest.write(chunk,'utf8',function(){})
            if(!flag){ // 如果写不进去了
                this.pause();
            }
        });
        dest.on('drain',()=>{
            console.log('drain')
            this.resume()
        })
    }
    pause(){
        this.flowing = false;
    }
    resume(){
        this.flowing = true;
        this.read();
    }
}

module.exports = ReadStream;