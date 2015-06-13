/*
 * Taurus light-weight expressjs module
 * developer: K. Yasuda /安田圭介
 */

;(function(){
    var _http=require('http'),
	_fs=require('fs'),
	_url=require('url'),
	_pkg=require('./package.json'),
        _post={},
	_static={},
        _ref=function(obj, num, req, res){
            var __req=req,__res=res,__m_arr=obj,__num=num;
            __m_arr[__num](__req, __res, function(){
                if (typeof __m_arr[__num+1]=='undefined')
                    return;
                    
                __m_arr[__num+1]
                        &&(_ref(__m_arr,__num+1,__req,__res));
            });
        },
	_msg={logs:{},logfile:_pkg.name+'_'+new Date().toJSON()+'.log'},
	_log=function(msg){
	    var now=new Date().toJSON();
	    _msg.logs[now]=msg;
	    
	    _fs.writeFile(__dirname+'/logs/'+_msg.logfile,JSON.stringify(_msg,null,4),function(){
	        console.log(now+': '+msg);
	    })
	    
	};
    
 
    module.exports={
        post:function(){
            var _ref = Array.prototype.slice.call(arguments);
            _post[_ref[0]]=_ref;
            
        },
	static:function(urlpath, abspath){
	    _static[urlpath]=_path.resolve(abspath);
	    
	},
        listen:function(port){

            _http.createServer(function (req, res) {
		var _req=req,_res=res,_m_arr=[],__ref1=_url.parse(_req.url);
		
		console.log("\nrequest: "+__ref1.pathname);

                if (_req.method.toLowerCase()=='post'){
                    
                    _req.on('data', function(chunk) {
			var __body;
			
			        
			try {
			    __body=JSON.parse(chunk);
			}
			catch(e){
			    _log('http body parsing error: '+e);
			    res.writeHead(501, { "Content-Type": "application/json" });
			    return res.end(JSON.stringify({status:'Invalid body.'}));
			}

                        req.body=__body;
                        for (var obj in _post){
			    if (_post.hasOwnProperty(obj)&&
                                (obj.indexOf(__ref1.pathname)>-1)){
                
			        return _ref(_post[obj], 1, _req, _res);
                            }
                        }

			
                    });
                    
                }

		if (_req.method.toLowerCase()=='get'){

		    for (var obj in _static){
			if (_static.hasOwnProperty(obj)&&
			    (__ref1.pathname.indexOf(obj)==0)){
			    var namepath=__ref1.pathname.substring(obj.length);
			    return _fs.readFile(_static[obj]+'/'+namepath, function (err,data) {
				if (err) {
				    res.writeHead(404);
				    _log('GET file error: '+JSON.stringify(err));
				    return res.end(JSON.stringify({status:'Invalid file.'}));
				}
				res.writeHead(200);
				return res.end(data);
			    });
			}
		    }
		    
		}
                
            }).listen(port); 
        }
    };

})();