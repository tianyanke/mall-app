# mall-app


> vue,koa应用脚手架,3步建立应用页面

支持多语言路由,多页应用,Mock,babel7,动态按需加载.适合pc,h5开发.

## 3步建立应用页面

### 1.新建应用路由

* ```/server/router/app/index.js```

```javascript
const page = require('../controller/index');
module.exports = [
    {path: '', ctrl: page.home},
    {path: 'main', ctrl: page.home},
    {path: 'api/list', ctrl: page.list, method: 'post'}
];

```

### 2.新建应用控制器

* ```/server/controller/index.js```

```javascript
const api = require('../api/index');
class page {
    async home(ctx, _next) {
        let locals = {
            appId: 'home',
            title: 'home-page'
        };
        //按需加载下必填,否则可忽略.
        ctx.state.appKey = 'home/index';
        //中台获取数据
        let data = await api.getList(ctx);
        ctx.state.list = data;
        //使用common通用视图
        await ctx.render('pages/common', locals);
    }

    async list(ctx, _next) {
        let locals = {
            list: await api.getList(ctx)
        };
        ctx.body = locals;
    }
}
module.exports = new page();
```

### 3.新建应用页面

* ```/web/pages/app/home/index.vue```

```javascript
...
<script>
    export default {
        appId: 'home', //必填,入口根据此ID渲染
        data () {
            return {
                list: ''
            }
        },
        mounted(){
            this.$http.post('/api/list').then(response => {
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

## 架构

### 前端

* `样式`:scss.
* `库管理`:npm
* `框架`:vue2.
* `模板引擎`:handlebars4.
* `打包`:webpack4.
* `图标`:iconfont,svg-sprite-loader.
* `组件库`:element-ui.

如果是移动端,请替换UI框架,比如[vant](https://youzan.github.io/vant/#/zh-CN/intro).

### 中台
* `框架`:koa2, nodejs>=7.6.0

## 目录结构

```text
.
├── build                                       # 使用 vue-cli 2.9.3(有修改)
├── config                                      # 使用 vue-cli 2.9.3(有修改)
├── server                                      # 服务端(koa,nodejs)
│    ├── api                                    #     接口
│    ├── controller                             #     控制器
│    ├── lib                                    #     库
│    │    ├── context                           #       上下文(动态加载文件)
│    │    ├── middleware                        #       中间件
│    │    ├── utils                             #       通用方法
│    │    └── vendor                            #       第三方插件
│    ├── mock                                   #     中台Mock
│    ├── router                                 #     路由(动态加载文件)
│    ├── view                                   #     视图
│    ├── server.js                              #     服务端入口
├── dist                                        # 生产目录
├── public                                      # 公共资源
├── web                                         # 前端(vue,js,css...)
│    ├── components                             #     组件
│    ├── entry                                  #     入口
│    ├── filters                                #     过滤
│    ├── global                                 #     全局设置
│    ├── icons                                  #     svg图标
│    ├── mixins                                 #     混入
│    ├── mock                                   #     前台Mock
│    ├── pages                                  #     页面
│    │     └── /**/index.js                     #     app入口 
│    ├── styles                                 #     样式
│    ├── webpack.entry.conf.js                  #     通用入口配置
│    ├── webpack.dev.conf.js                    #     app入口配置
│    └── webpack.pord.conf.js                   #     其他配置
└── config.yml                                  #     通用配置文件,整个脚手架很多功能都与它有关
```

## 安装

``` bash
npm install    # npm 安装
```

## 命令

``` bash
npm run dev    # 启动开发模式(dev)
npm run build  # 构建项目
npm run prod   # 启动生产模式(prod)
```

## 入口配置

* ```/webpack.entry.conf.js ```

**任何模式都有效,通用入口配置.**

**处在不同位置.在开发,生产模式webapck构建时自动合并引入webpack.entry.(不做其他属性合并).一般情况不作其他属性修改.**
```javascript
module.exports ={
    header: './web/entry/header.js', //全局头部通用文件(引用vue,全局样式...)
    // footer: './web/entry/footer.js', //全局底部通用文件(比如统计数据...)
};
```

`header.js`:不支持删除,在生产模式时,紧接着插入manifest.js,vendor.js.

`footer.js`:支持删除.

* ```/webpack.dev.conf.js```

**开发模式有效,app入口配置.构建会合并所有属性.**

**所有的app入口都在`webpack.dev.conf.js`配置. 默认是按需加载.**

```javascript
module.exports ={
    entry: {
        'app': './web/pages/app/index.js',
        'app2': './web/pages/app2/index.js',
    },
    //devtool: '#cheap-module-eval-source-map'
    ...
};
```

合并后的实际入口

```javascript
entry: {
    'app': [
        './web/entry/header.js', 
        './web/entry/footer.js' , 
        './web/pages/app/index.js' , 
        'webpack-hot-client/client'
    ],
    'app2': [
        './web/entry/header.js', 
        './web/entry/footer.js' , 
        './web/pages/app/index.js' , 
        'webpack-hot-client/client'
    ]
}
```
`webpack-hot-client/client(热加载)`: 开发模式时每个入口自动加入.

* ```/webpack.prod.conf.js```

**生产模式有效,其他配置.构建会合并所有属性.**

```javascript
module.exports ={
    ...
   new ManifestPlugin({
       publicPath: '/dist/'
   })
    ...
};
```

合并后的实际入口

```javascript
entry: {
    'app': ['./web/pages/app/index.js'],
    'app2': ['./web/pages/app2/index.js'],
    header: ['./web/entry/header.js'],
    footer: ['./web/entry/footer.js']
}
```

`/web/pages/**/index.js` 都是app. 这里,`app`, `app2` 2个app,甚至更多,即多页应用.

`app`, `app2`,分别叫主app,其他app,还可以有另外app...等. 名字随你.

脚手架默认按需加载,能满足大多数app开发,app这个入口一般一个即可.
 
 **项目只保留1个app,多app需另建.**

## 视图

#### 引用

[handlebars(模板引擎)](https://github.com/wycats/handlebars.js)

[handlebars-layouts(模板引擎布局helpers)](https://github.com/shannonmoeller/handlebars-layouts)

`/server/view/layout/**.hbs` 以文件名注册为`handlebars partial.`

### 通用视图

* ```/server/view/pages/common.hbs```

```handlebars
{{#extend "layout-default"}}          # 使用layout-default布局
    {{#content "head"}}
        {{{parseUrl 'app.css'}}}      # app应用的css,直接引用
    {{/content}}                      # 不需要新建,build时会抽取vue的style成独立的文件.否则生产模式看不到样式.
    {{#content "body"}}
        <div id="{{appId}}"></div>    # 控制器带过来的ctx.appId
        {{{parseUrl 'app.js'}}}       # app应用的js(相应webpack.entry)
    {{/content}}
{{/extend}}
```

### parseUrl

解析url,handlebars自定义helpers.根据当前开发环境返回正确的url.

**dev**

`ctx.state.appName='app'`
```javascript
{{{parseUrl 'app.css' 'app.js'}}}
```
↓↓↓
```html
<script web="app.js"></script>
```

`ctx.state.appName=''; 或不设置`   

↓↓↓
```html
<link href="/dist/static/css/app.[chunkhash].css" type="text/css" rel="stylesheet">
<script web="app.js"></script>
```

**prod**
```html
<link href="/dist/static/css/app.[chunkhash].css" type="text/css" rel="stylesheet">
<script web="/dist/static/js/app.[chunkhash].js"></script>
```

**有这种场景** 

如果存在多个app如app1,app2.在控制器就需要设置ctx.state.appName ='app的名字'.否则读取样式会不正确.

默认按需加载.ctx.appKey填上相关vue的路径即可.

**浏览: http://localhost:3333/**


## APPSTATE

**浏览器端**, 整个app的传递信息(ctx.state封装),部分由 ```/config.yml```合成.

* ```/server/view/layout/layout-default.hbs```
```html
<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{title}}</title>
    {{{mountState}}}
    {{{parseUrl 'header.css' 'header.js' }}}
    {{#block "head"}}
    {{/block}}
</head>
<body>
{{#block "body"}}{{/block}}
</body>
</html>
```

```javascript
{{{mountState}}}   //将ctx.state挂载到window.APPSTATE
```
↓↓↓
```javascript
<script type="text/javascript">
window.APPSTATE = {
    locale:'zh',
    publicServer:'',
    appName:'app'
}
</script>
```

查看页面源代码一般会看到以上代码.

## mock

#### 动态引用
[mockjs](http://mockjs.com/)

* ```/config.yml```
```yml
...
# 是否使用模拟数据api(dev模式有效)
isMockAPI : true
# apiServer api服务器
apiServer : 'http://localhost:3334'
...
```

`isMockAPI:true`

```javascript
{{{parseUrl 'header.css' 'header.js'}}}
```
↓↓↓
```html
<script src="/public/vendor/mockjs/dist/mock-min.js"></script>
```

### 1.服务端Mock

#### 1.1 编写/server/mock/**/.json文件.

* ```/server/mock/api/list.json```

现在请求 `/api/list`

`isMockAPI:true`

服务端返回 `/server/mock/api/list.json`.

`isMockAPI:false`

服务端返回 `http://localhost:3334/api/list`.

### 2.前端Mock

#### 2.1 编写/web/mock/**/index.js文件.

* ```/web/mock/index.js``` 

```javascript
Mock.mock('/api/list', 'post', function () {
    return Mock.mock({
        "list|5-10": [{
            'name': '@cname',
            'imageUrl': 'http://placehold.it/300x150/f69/fff',
            'description': '@cname'
        }]
    });
});

```
**优先级:前端Mock文件>后端Mock文件.否则报500.**

## 打包

* ```/config.yml```

```yml
...
#webpack构建路径(prod模式有效)
buildPath:
    # name entry路径
    # isIndexEntry 是否使用index.js作为webpack.entry.
    # isIndexEntry = true
    # './web/pages/app/index.js'  --> /dist/static/js/app[chunkhash].js
    # 使用index.js上一级目录名作为打包文件名(example.js).

    # isIndexEntry = false
    # './web/locale/zh.js'           --> /dist/static/js/zh[chunkhash].js
    # 使用当前文件作为打包文件名(zh.js).
     -
       name: './web/pages'
       isIndexEntry : 'true'
     -
       name: './web/locale'
...
```

一般情况每一个应用都建立在 `/web/pages/**/index.js`,以`index.js`作为打包入口.

否则,如果有`/web/pages/app/index.js`,`/web/pages/app2/index.js`,`/web/pages/app3/index.js`.就会最终构建出以排序最后的`index.js`.

所以,`/web/pages/**`,只要目录不重名,并且以`index.js`作为入口.就不会冲突.


**dev**

从这些配置文件打包 `/build/webpack.base.conf` , `/webpack.entry.conf.js` , `/webpack.dev.conf.js`    
**主要从`/webpack.dev.conf.js`配置打包开发需要的entry.**

**prod**

从这些配置文件打包 `/build/webpack.base.conf` , ` /webpack.entry.conf.js` , `/webpack.prod.conf` , `/web/pages/**/index.js`    
**主要从`/web/pages/**/index.js`打包所有js.**

## 多语言

### 1.配置参数
* ```/config.yml```

```yml
...
# 多语言路由前缀
locales: ['zh', 'en'[,.]]
# webpack构建路径(entry)
buildPath:
     -
       #多语言入口
       name: './web/locale'
...
```

**缺一不可**

### 2.创建多语言文件
* `/web/locale/zh.js`

```javascript
window.locale = {
    'desc': 'vue koa 多页应用脚手架'
};
```

* `/web/locale/en.js`

```javascript
window.locale = {
    'desc': 'vue koa scaffold'
};
```

多语言文件会在`header.js`之前插入.

### 3.创建全局方法
* `/web/utils/locale.js`

```javascript
/**
 * 获取locale对应的值 
 */
window.getLocale = function (key) {
    if (window.locale) {
        return window.locale[key] || '';
    }
    else {
        return key;
    }
};
```

### 4.调用全局方法

```javascript
...
data() {
    return {
        list: '',
        desc: getLocale('desc')
    }
}
...
```

路由则支持

*  http://localhost:3333/
*  http://localhost:3333/zh/
*  http://localhost:3333/en/

## 动态加载文件

以下路径的文件根据原本代码逻辑,自动引用所有js,**无需手动引入**.

* `/server/lib/context/**.js`


* `/server/router/**.js`

例如

`/test/a.js` 返回foo1方法.
`/test/b.js` 返回foo2方法.

* `/test/index.js` 

```javascript
//动态加载文件,无需手动引入
module.exports = {
    foo1:function(){},
    foo2:function(){}
};
```

* `/test/index.js` 

```javascript
//手动引入
let foo1 = require('./a');
let foo2 = require('./b');
module.exports = {
    foo1: a,
    foo2: b
};
```

## 中台自定义属性/方法

### 属性

#### ctx.appKey

*  类型: **String**
*  默认值: **''** 
*  用法:
 
```javascript
ctx.appKey = 'home/index'
```
按需加载模式的页面路由.require.context根据appKey渲染vue页面.

#### ctx.appId

*  类型: **String**
*  默认值: **''** 
*  用法:

```javascript
let locals = {
    appId: 'home',
    ...
};
await ctx.render('pages/common', locals);
```

handlebar模版引擎根据appId返回页面.

#### ctx.appName

*  类型: **String**
*  默认值: **''** 
*  用法:

```javascript
ctx.appName = 'app'
```

区分多入口app,避免读取样式不正确.一个app不需要设置.

#### ctx.router

*  类型: **Array\<object\>**
*  示例:

```javascript
ctx.logger.info(ctx.router);
```

当前ctx全部匹配的路由.

### 方法

#### ctx.axios(ctx, options[,isReturnFullResponse])

*  参数
    * {Object} ctx
    * {Object} options
    * {Boolean} isReturnFullResponse 是否返回全部参数, 默认res.data 
*  示例:

```javascript
ctx.axios(ctx, {
    url: '/api/xxx',
    method: 'post',
    data: ctx.request.body
});
```

引用封装 [axios](https://www.npmjs.com/package/axios) 的发起请求方法.

#### ctx.logger

引用 [log4js](https://www.npmjs.com/package/log4js) 的日志方法.

*  示例:

```javascript
ctx.logger.info('示例');
```

#### ctx.setState

*  示例:

```javascript
ctx.setState(ctx);
```

设置ctx.state自定义通用属性.


## 路由属性/方法

路由根据 * ```/server/router/**/**.js``` 配置生成路由. 

### path
*  类型: **String**
*  默认值: **''** 

路由路径. 

### ctrl
*  类型: **async Function**
*  默认值: undefined

路由控制器.
   
### method
*  类型: **String**
*  默认值: **get** 

路由方法.

### isAuthenticated
*  类型: **Boolean**
*  默认值: **undefined** 
*  示例:

```javascript
{path: 'user/profile', ctrl: page.profile, method: 'post', isAuthenticated: true}
```

路由是否需要权限. isAuthenticated:true, **重定向到登录页面(自定义).**

### noContactToRoute
*  类型: **Boolean**
*  默认值: **undefined** 
*  示例:

```javascript
{path: 'captcha', ctrl: page.captcha, noContactToRoute: true} //普通验证码不需要权限验证
```

不合并到ctx.router.

每个请求都会经过```/server/middleware/state-context.js```中间件.但只会匹配不带/api的页面路由.    
noContactToRoute:true表示不经过这个中间件.因为```state-context```中间件根据ctx.router判断.
