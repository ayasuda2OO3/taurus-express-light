/*
 * Taurus light-weight expressjs module
 * developer: K. Yasuda /安田圭介
 */

;(function(){
    var _http=require('http'),
	_fs=require('fs'),
	_url=require('url'),
	_pkg=require('./package.json'),
        _path=require('path');
        _post={},
	_get={},
	_arg=[],
        _port=3131,
	_apppath='',    
	_static={},
        _ref=function(obj, num, req, res){
            var __req=req,__res=res,__m_arr=obj,__num=num;
            __m_arr[__num](__req, __res, function(){
                if (typeof __m_arr[__num+1]=='undefined')
                    return;
                    
		return __m_arr[__num+1]
                        &&(_ref(__m_arr,__num+1,__req,__res));
            });
        },
	_core=function(req,res){
	    var _req=req,_res=res,_m_arr=[],__ref1=_url.parse(_req.url);
		
	    _log("\nRequest: "+__ref1.pathname);
	    
	    _arg&&_ref(_arg, 0, _req, _res);
		
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
			    (__ref1.pathname.indexOf(obj)==0)){
			    
			    return _ref(_post[obj], 1, _req, _res);
			}

		    }
		    
		    res.writeHeader(404);
		    _log('No matching path set.');
		    return res.end(JSON.stringify({status:'Invalid path.'}));
			
                });
                    
            }

	    if (_req.method.toLowerCase()=='get'){

		for (var obj in _get){
		    if (_get.hasOwnProperty(obj)&&
			(__ref1.pathname.indexOf(obj)==0)){
			return _ref(_get[obj],1,_req,_res);
		    }
		}
		
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

		res.writeHeader(404);
		_log('No matching path set.');
		return res.end(JSON.stringify({status:'Invalid path.'}));
		    
	    }
                
            
	},
	_msg={logs:{},logfile:_pkg.name+'_'+new Date().toJSON()+'.log'},
	_log=function(msg){
	    var now=new Date().toJSON();
	    _msg.logs[now]=msg;
	    
	    _fs.writeFile(__dirname+'/logs/'+_msg.logfile,JSON.stringify(_msg,null,4),function(){
	        console.log(now+': '+msg);
	    });
	    
	};           
    
    module.exports={
	pre:function(){
	    return _arg=Array.prototype.slice.call(arguments);
	    
	},
	path:function(apppath){
	    if (apppath.match(/^\/\w+/)!=null)
		_apppath=apppath;

	    return;
	},
        post:function(){
            var _ref = Array.prototype.slice.call(arguments);
	    
	    if (_ref[0].constructor==Array){
		for (var x in _ref[0]){
		    _post[_apppath+_ref[0][x]]=_ref;
		}
	    }
	    else
		_post[_apppath+_ref[0]]=_ref;

	    return;
            
        },
	get:function(){
	    var _ref = Array.prototype.slice.call(arguments);

	    if (_ref[0].constructor==Array){
		for (var x in _ref[0]){
		    _get[_apppath+_ref[0][x]]=_ref;
		}
	    }
	    else
		_get[_apppath+_ref[0]]=_ref;

	    return;

	},
	static:function(urlpath, abspath){
	    
	    return _static[_apppath+urlpath]=_path.resolve(abspath);
	    
	},
	info:function(){
	    var _po={},_ge={},_pr=[];

	    Object.keys(_post).forEach(function(key){
		var _ref=_post[key][1].toString();
		_po[key]= _ref.substring(0,_ref.indexOf(')')+1);
	    });

	    Object.keys(_get).forEach(function(key){
		var _ref=_get[key][1].toString();
		_ge[key]=_ref.substring(0,_ref.indexOf(')')+1);
	    });

	    _arg.forEach(function(ind){
		var _ref=_arg[ind].toString();
		_pr.push(_ref.substring(0,_ref.indexOf(')')));
	    });
	    
	    return {static:_static,
		    post:_po,
		    get:_ge,
		    path:_apppath,
		    pre: _pr,
		    port: _port};
	    
	    
	},
	listen:function(port){
	    _port=port;
            return _http.createServer(_core).listen(_port);
	    
        }
    };

})();


