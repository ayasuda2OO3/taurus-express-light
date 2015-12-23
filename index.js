/*
 * Taurus light-weight expressjs module
 * developer: K. Yasuda /安田圭介
 */

module.exports=(function(){
    var _http=require('http'),
	_stream=require('stream'),
	_fs=require('fs'),
	_url=require('url'),
	_pkg=require('./package.json'),
        _path=require('path'),
	_busboy=require('busboy'),
        _post={},
	_get={},
	_cookies={},
	_arg=[],
        _port=3131,
	_apppath='',
	_indexFile='index.html',
	_static={},
        _ref=function(obj, num, req, res){
	    debugger;
	    var __req=req,__res=res,__m_arr=obj,__num=num;

	    __m_arr&&__m_arr[__num]&&__m_arr[__num](__req, __res, function(){
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
	    
	    debugger;

	    if (_req.method.toLowerCase()=='post'){

		var _op=new Promise(function(reso,reje){
		    
		    if (_req.headers['content-type'].indexOf('application/json')>-1){
			var _chunk='',_body;
			
			_req.on('data',function(chunk){
			    _chunk+=chunk;
			});
			
			_req.on('end', function() {
			    
			    try {
				_body=JSON.parse(_chunk);
			    }
			    catch(e){
				_log('http body parsing error: '+e);
				return reje({code:501,desc:'Invalid body.'});
			    }

			    return reso(_body);
			    
			});
		    }

		    else if (_req.headers['content-type'].indexOf('multipart/form-data')>-1){
			
			var busboy,
			    _body={files:[]};

			try {
			    busboy=new _busboy({headers:_req.headers})
			}
			catch(e){
			    console.log(e);
			    return reje({code:501,desc:e});
			}
			
			console.log('enter multipart/form-data');
			
			busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			    
			    var Readable = _stream.Readable,
				_str=new Readable(),
				_size=0;
			    

			    console.log('get file: '+filename);

			    _str._read=function(){};
			    
			    file.on('data',function(data){
				_str.push(data);
				_size+=data.length;
			    });

			    file.on('end',function(){
				_str.push(null);
				console.log('file reading ended.');
				_body.files.push({fileName:filename,
						  fileStream:_str,
						  encoding:encoding,
						  fileSize:_size,
						  mimeType:mimetype});

			    });
			    
			});

			busboy.on('field',function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
			    _body[fieldname]=val;
			    console.log('get '+fieldname);
			});

			busboy.on('finish', function(){
			    console.log('done parsing.');
			    return reso(_body);
			});

			return _req.pipe(busboy);
		    }
		    else {
			return reje({code:404,dsc:'Content type is not support.'});
		    }
		    
		});

		_op.then(function(data){
		    console.log('completed parsing.');
		    _req.body=data;
		    return new Promise(function(reso,reje){
			for (var obj in _post){

			    //next to do: pathname matching technique
			    console.log('search for path through the _post');
			    console.log(_post);
			    if (_post.hasOwnProperty(obj)&&
				(__ref1.pathname.indexOf(obj)==0)){
				console.log('proceed to resolve.');
				return reso(_post[obj]);
			    }
			}
			return reje({code:404,desc:'Invalid path. No matching path set.'});
			
		    });
		}).then(function(obj){
		    console.log('successful pass to the next context.');
		    _ref(obj, 1, _req, _res);
		}).catch(function(err){
		    _res.writeHeader(err.code);
		    _res.end(JSON.stringify(err.desc));
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
			var namepath=(__ref1.pathname.substring(obj.length)||_indexFile);
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
	__msg={logs:{},logfile:_pkg.name+'_'+new Date().toJSON()+'.log'},
	_log=function(msg){
	    var now=new Date().toJSON();
	    
	    __msg.logs[now]=msg;
	    
	    _fs.writeFile(__dirname+'/logs/'+__msg.logfile,JSON.stringify(__msg,null,4),function(){
	        console.log(now+': '+msg);
	    });
	    
	},
	_tau=function(){};

    _tau.prototype.index=function(indfile){
    	_indexFile=indfile;
    	return;	
    };

    _tau.prototype.pre=function(){
	return _arg=Array.prototype.slice.call(arguments);
	
    };
    
    _tau.prototype.path=function(apppath){
	if (apppath.match(/^\/\w+/)!=null)
	    _apppath=apppath;

	return;
    };

    _tau.prototype.post=function(){

	var _ref = Array.prototype.slice.call(arguments);
	
	if (_ref[0].constructor==Array){
	    for (var x in _ref[0]){
		_post[_apppath+_ref[0][x]]=_ref;
	    }
	}
	else
	    _post[_apppath+_ref[0]]=_ref;

	return;
	
    };

    _tau.prototype.get=function(){
	var _ref = Array.prototype.slice.call(arguments);

	if (_ref[0].constructor==Array){
	    for (var x in _ref[0]){
		_get[_apppath+_ref[0][x]]=_ref;
	    }
	}
	else
	    _get[_apppath+_ref[0]]=_ref;

	return;

    };

    _tau.prototype.static=function(urlpath, abspath){
	
	return _static[_apppath+urlpath]=_path.resolve(abspath);
	
    };

    _tau.prototype.info=function(){
	var _po={},_ge={},_pr=[];

	Object.keys(_post).forEach(function(key){
	    var _ref=_post[key][1].toString();
	    _po[key]= _ref.substring(0,_ref.indexOf(')')+1);
	});

	Object.keys(_get).forEach(function(key){
	    var _ref=_get[key][1].toString();
	    _ge[key]=_ref.substring(0,_ref.indexOf(')')+1);
	});

	_arg.forEach(function(obj){
	    var _ref=obj.toString();
	    _pr.push(_ref.substring(0,_ref.indexOf(')')+1));
	});
	
	return {static:_static,
		post:_po,
		get:_ge,
		path:_apppath,
		pre: _pr,
		port: _port};
	
    };

    _tau.prototype.listen=function(port){
	_port=port;
	return _http.createServer(_core).listen(_port);
	
    };

    return new _tau();
    /*,
      getCookie:function(key,value,req,res){
      var _cookieObj=function(request){
      var list = {},
      rc = request.headers.cookie;

      rc && rc.split('; ').forEach(function( cookie ) {
      var parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
      });

      return list;
      },
      _cookieStr=function(cObj){
      var _str='';
      Object.keys(cObj).forEach(function(key) {
      var val = cObj[key];
      _str+=(key+'='+val+'; ');
      });
      return _str;
      },
      cObj=_cookieObj(req);
      
      cObj[key]=value;
      res.writeHead(200,{'Set-Cookie':_cookieStr(cObj)});
      }*/
})();
