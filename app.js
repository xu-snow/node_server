var
    path = require('path'),
    http = require('http'),
    express = require('express'),
    // session = require('express-session'), // 换成cookie-session
    cookieSession = require('cookie-session'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),

    // Vue-Router HTML5 History mode
    // http://router.vuejs.org/zh-cn/essentials/history-mode.html
    history = require('connect-history-api-fallback'),

    router = require('./routes/index')

const
    NODE_ENV = process.env.NODE_ENV === 'production',
    port = NODE_ENV ? 80 : 3000

var app = express()

app.use(history())
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json({
    'limit': '10mb'
}))
app.use(bodyParser.urlencoded({
    'limit': '10mb',
    extended: true
}))
app.use(cookieParser('LinDong secret'))
app.use(express.static(path.join(__dirname, 'public')))

// set seeion
// app.use(session({
//     // name:返回客户端的key的名称，默认为connect.sid,也可以自己设置。
//     //与cookieParser中的一致
//     secret: 'LinDong secret', // 一个String类型的字符串，作为服务器端生成session的签名
//     saveUninitialized: true, // 初始化session时是否保存到存储
//     resave: true, // 当客户端并行发送多个请求时，其中一个请求在另一个请求结束时对session进行修改覆盖并保存
//     cookie: {
//         httpOnly: true
//     }
// }))

app.use(cookieSession({
    name: 'session',
    secret: 'LinDong secret',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// development Access-Control-Allow-Origin
if (!NODE_ENV) {
    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With')
        res.header('Access-Control-Allow-Credentials', "true")
        res.header("Content-Type", "application/json;charset=utf-8");
        // if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
        next()

    })
}




// set route
app.use('/resource', router.resource)
app.use('/api', router.api)



app.listen(port, () => {
    console.log('Server created to port:' + port)
})