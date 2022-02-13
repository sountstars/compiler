(function(modules){     //自执行函数
      var installedModules = {}
      function require(filename){                   //定义require方法
        if(installedModules[filename]) {
	  return installedModules[filename].exports;		
        }

        var fn = modules[filename]
        var module = installedModules[filename] = { 
          exports: {}                              //定义exports对象
        }
        fn(require, module, module.exports)        //执行模块包裹匿名函数，也就是执行模块代码
        return module.exports                 //返回模块导出对象
      }
      require('./src/index.js')      //加载入口文件
    })({
      './src/index.js': function(require, module, exports){
        "use strict";

var _hello = require("./src/hello.js");

//src/index.js
var worldModule = require("./src/world.js");
      },'./src/hello.js': function(require, module, exports){
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.msg = void 0;

var _world = require("./src/world.js");

//src/hello.js
var msg = 'hello ' + _world.world;
exports.msg = msg;
      },'./src/world.js': function(require, module, exports){
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.world = void 0;
//src/world.js
var world = 'world';
exports.world = world;
      },                    //所有模块拼接的字符串
    })