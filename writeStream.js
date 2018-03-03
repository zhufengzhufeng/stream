// 可写流
let fs = require('fs');
let util = require('util');
let EventEmitter = require('events');
class WriteStream {
    constructor(path,options){
        this.path = path;
        this.flags = options.flags;
        this.start = options.start;
        this.pos = this.start;
        this.highWaterMark = options.highWaterMark|| 16*1024;
        this.mode = options.mode|| 0o666;
        this.encoding = options.encoding||'utf8';
        this.autoClose = options.autoClose || true;

        this.length = 0; // 缓存区大小
        this.buffer = []; // 缓存区内容
        this.writing =false; // 是否正在写入
        this.open(); // 开始吧
    }
    open(){
        fs.open(this.path,this.flags,this.mode,(err,fd)=>{
            if(err){
                if(this.autoClose){
                    this.destroy();
                }
            }
            this.fd = fd;
            this.emit('open');
        });
    }
    write(chunk,encoding,callback){
        // 看是往缓存里写还是?
        chunk = Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk,encoding);
        this.length += chunk.length; // 记一下 有多少了
        let ret = this.length<this.highWaterMark; // 1    3
        if(this.writing){ // 正在写入 向缓存里放
            this.buffer.push({
                chunk,encoding,callback
            })
        }else{
            this._write(chunk,encoding,()=>this.clearBuffer());
            this.writing = true;
        }
        return ret;
    }
    clearBuffer(){
        let data = this.buffer.shift(); // 取出第一个
        if(data){ // 如果有
            this._write(data.chunk,data.encoding,()=>this.clearBuffer())
        }else{  
            this.writing = false; // 写完了就发射干了并且下一次再写 不经过缓存区
            this.emit('drain');
        }
    }
    _write(chunk,encoding,callback){
        if(typeof this.fd!=='number') { // 当前标识符不是number
            return this.once('open',()=>this._write(chunk,encoding,callback))
        }
        fs.write(this.fd,chunk,this.start,chunk.length,this.pos,(err,byteWritten)=>{
            this.pos+=byteWritten; // 继续下一次做准备;
            this.length -= byteWritten;
            callback(); // ok了 本轮
        })
    }
    destroy(){
        if(typeof this.fd !='number'){
            this.emit('close');
        }else{
            fs.close(this.fd,function(){
                this.emit('close');
            })
        }
    }
}
util.inherits(WriteStream,EventEmitter)
module.exports = WriteStream;