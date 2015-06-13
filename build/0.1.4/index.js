/*
 * Taurus light-weight expressjs module
 * developer: K. Yasuda /安田圭介
 */

;(function(){
    var _http=require('http'),
	_url=require('url'),
        _post={},
        _ref=function(obj, num, req, res){
            var __req=req,__res=res,__m_arr=obj,__num=num;
            __m_arr[__num](__req, __res, function(){
                if (typeof __m_arr[__num+1]=='undefined')
                    return;
                    
                __m_arr[__num+1]
                        &&(_ref(__m_arr,__num+1,__req,__res));
            });
        };
    
    module.exports={
        post:function(){
            var _ref = Array.prototype.slice.call(arguments);
            _post[_ref[0]]=_ref;
            
        },
        listen:function(port){

            _http.createServer(function (req, res) {
                var _req=req,_res=res,_m_arr=[];
                    
                if (_req.method.toLowerCase()=='post'){
                    
                    _req.on('data', function(chunk) {
			//console.log("Received body data:"+chunk.toString());
			var __ref1=_url.parse(_req.url),__body;
			
			try {
			    __body=JSON.parse(chunk);
			}
			catch(e){
			    res.writeHead(501, { "Content-Type": "application/json" });
			    return res.end(JSON.stringify({status:'Invalid body.'}));
			}

                        req.body=__body;
                        for (var obj in _post){
			    if (_post.hasOwnProperty(obj)&&
                                (obj.indexOf(__ref1.pathname)>-1)){
			        console.log("\n__ref1.pathname:"+__ref1.pathname);
                                _ref(_post[obj], 1, _req, _res);
                            }
                        }
                    });
                    
                }
                
            }).listen(port); 
        }
    };

})();