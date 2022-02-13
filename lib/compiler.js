const fs = require("fs");
const path = require("path");
const { SyncHook } = require("tapable");
const parser = require("./parser");
class Compiler {
  constructor(config) {
    //解析配置选项
    this.config = config;
    this.entry = config.entry;
    this.output = config.output;
    this.execPath = process.cwd(); //Node.js 进程的当前工作目录，在这里也就是项目根目录
    this.modules = Object.create(null); //用于所有依赖文件生成的module的集合

    this.hooks = {
      //添加各生命周期对应的hooks
      emit: new SyncHook(), //生成资源到 output 文件之前触发
      afterEmit: new SyncHook() //生成资源到 output 文件之前触发
    };
    const plugins = this.config.plugins; //获取配置文件中的plugins数组
    if (Array.isArray(plugins)) {
      plugins.forEach(plugin => {
        //遍历数组，执行每一个plugin的apply方法，将compiler作为参数传入
        plugin.apply(this); //  执行plugin的apply方法，订阅生命周期钩子
      });
    }
  }

  run() {
    //主要分为以下两个步骤
    // this.buildModule(path.resolve(this.execPath, this.entry)); //构建依赖关系图
    console.log(this.buildModule(path.resolve(this.execPath, this.entry)));
    // this.emitFile(); //生成打包文件

    this.hooks.emit.call(); //生成资源到 output 文件之前，发布emit钩子
    this.emitFile();
    this.hooks.afterEmit.call(); //生成资源到 output 文件之后，发布afterEmit钩子
  }
  buildModule(filename) {
    let key = path.relative(this.execPath, filename); //获取文件基于项目根目录的相对路径，作为它在module集合的key
    console.log(key, "-----key", this.modules[key]);
    key = "./" + key.replace(/\\/g, "/");
    // console.log(key, "-----key", this);
    if (this.modules[key]) return; //如果模块已经存在于集合中，则返回

    //编译解析文件，得到转换成es5的文件源码和它的依赖数组
    const { dependencies, code } = parser.parse(filename, this.config);
    // console.log(dependencies, code, "-----dependencies");
    this.modules[key] = {
      //根据文件源码和它的依赖数组生成module，并加入到依赖集合中
      code: code,
      dependencies: dependencies
    };

    //遍历文件的依赖数组，递归执行buildModule方法，直到遍历完所有依赖文件，这时this.modules中将是项目所有依赖module的集合
    dependencies.forEach(dependency => {
      const absPath = path.resolve(this.execPath, dependency);
      this.buildModule(absPath);
    });
  }
  emitFile() {
    const output = path.resolve(this.output.path, this.output.filename); //输出文件名
    let modules = "";
    Object.keys(this.modules).forEach(key => {
      //
      modules += `'${key}': function(require, module, exports){
        ${this.modules[key].code}
      },`;
    });
    console.log(modules, "-----modules");
    const bundle = `(function(modules){     //自执行函数
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
      require('${this.entry}')      //加载入口文件
    })({
      ${modules}                    //所有模块拼接的字符串
    })`;
    // console.log(bundle , '-----bundle')
    fs.writeFileSync(output, bundle, "utf-8"); //将字符串写入output指定文件
  }
}
module.exports = Compiler;
