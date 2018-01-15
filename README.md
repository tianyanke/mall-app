# mall-app

> vue koa 前后分离多页应用脚手架


## 技术栈
* `脚本`:vue2,ES5+.
* `样式`:scss.
* `前端库管理`:bower(npm有的,bower不需要,但比如boostrap,npm方式比较麻烦,看情况).
* `前端服务器`:koa2.
* `前端服务器-视图`:handlebars.
* `打包`:webapck2

**运行环境中Nodejs的版本至少是7**


## 目录结构
```text
.
├── build                                       // webpack配置文件(vue-cli生成)
├── config                                      // 项目打包路径(vue-cli生成)
├── app                                         // koa前端服务器
│    ├── common                                 //     通用系列方法
│    ├── config                                 //     配置
│    ├── controller                             //     控制器
│    ├── middleware                             //     中间件
│    ├── router                                 //     路由
│    ├── service                                //     数据(api)
│    ├── view                                   //     视图
│    │    ├── common                            //         通用视图
│    │    └── layout                            //         布局视图
│    ├── app.js                                 // koa前端服务器启动入口
├── dist                                        // 生产目录
├── public                                      // 公共资源
│    ├── script                                 //     脚本
│    ├── image                                  //     图片
│    ├── style                                  //     样式(全局前端样式)
│    └── vendor                                 //     第三方插件
│
├── src                                         // 源码
│    ├── component                              //     组件
│    ├── page                                   //     页面(每个页面都是一个应用)
│    └─  style                                  //     样式(应用样式)

```

## 命令
``` bash
npm install    //安装
npm run dev    //启动开发模式(读webpack.options.conf.js文件entry,并热加载)
npm run build  //构建项目   (打包路径 /src/page/**/*.js)
npm run prod   //启动生产模式(读dist目录打包后的文件)
```

## example-app 应用例子

### 应用配置文件
* ```/webpack.options.conf.js```

**在开发模式,entry 作为热加载,在生产模式会忽略此文件.**
```javascript
module.exports ={
    entry: {
        header: './public/common/header.js',//公共资源头部js:一般包括第三方插件,全局通用函数等.(所有应用共享)
        ['example-app']: './src/page/example-app/example-app.js',           //源代码应用js  :当前应用js.
        footer: './public/common/footer.js',//公共资源底部js:一般有统计脚本等.               (所有应用共享)
    }
}
```
新建一个webpack.options.conf.js(不上传到仓库).
* ```/app/view/**/**.hbs```  引用它们.

**只要1个脚本的应用**
```javascript
module.exports ={
    entry: {
        ['example-app']: './src/page/example-app/example-app.js'
    }
}
```



### 1.新建应用路由
* ```/app/router/example-app.js```
```javascript
import Router from 'koa-router';
import exampleApp from '../controller/example-app';
const router = Router({
    prefix: '/'
});
router.get('', exampleApp.index);
router.get('example-app', exampleApp.index);
router.post('exampleList', exampleApp.exampleList);
module.exports = router;
```

### 2.新建应用控制器
* ```/app/controller/example-app.js```
```javascript
import exampleService from '../service/example-app';
const index = async (ctx, _next) => {
    let locals = {
        title: 'example-app'
    };
    //appName开发模式下不会加载生产后的css
    ctx.state.appName = 'example-app';
    await ctx.render('example-app', locals);
}

const exampleList = async (ctx, _next) => {
    const service = new exampleService(ctx);
    let locals = {
        list: service.getList()
    };
    ctx.body = locals;
}

module.exports = {
    index,
    exampleList
};

```

### 3.新建应用视图
* ```/app/view/example-app.hbs```
```handlebars
{{#extend "layout-example"}}         //使用layout-example布局
{{#content "head"}}
    {{{parseUrl 'example-app.css'}}} //example-app应用的css,直接引用
{{/content}}                         //不需要新建,build时会抽取vue的style成独立的文件.否则生产模式看不到样式.
{{#content "body"}}
<div id="app"></div>
{{{parseUrl 'example-app.js'}}}      //example-app应用的js
{{/content}}                         //webpack.options.conf.js  entry.home
{{/extend}}
```
以上代码基于

[handlebars(模板引擎)](https://github.com/wycats/handlebars.js)

[handlebars-layouts(模板引擎布局helpers)](https://github.com/shannonmoeller/handlebars-layouts)



#### handlebars自定义helpers

`parseUrl`：**根据当前开发环境返回正确的url,每个应用这是必须用到的,否则无法正确返回路径.**


#### handlebars.registerPartial
`/app/view/**/**.hbs` **以文件名注册为handlebars partial.**


### 4.新建应用页面
* ```/src/page/example-app/example-app.vue```
```javascript
...
<script>
    export default {
        data () {
            return {
                list: ''
            }
        },
        mounted(){
            this.$http.post('/exampleList').then(response => {
                console.log(response);
                this.list = response.data.list
            }, response => {
                console.log(response);
            })
        }
    }
</script>
...
```

### 5.新建应用入口
* ```/src/page/example-app/example-app.js```
```javascript
import Vue from 'vue';
import axios from 'axios';
Vue.prototype.$http = axios;
import exampleApp from './example-app.vue';
//公共资源样式
import '../../../public/style/common.scss';
$(document).ready(function(){
    new Vue({
        el: '#app',
        template: '<exampleApp/>',
        components: {exampleApp}
    });
});
```
**浏览: http://localhost:3333/example-app**

