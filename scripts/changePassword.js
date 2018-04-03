/*
 * @Author: zhengxu
 * @Date: 2018-04-03 00:36:03
 * @Last Modified by: zhengxu
 * @Last Modified time: 2018-04-03 23:55:47
 * @describe 简单地直接调用这个文件修改密码，eg: npm run password -- --user xxx --password xxx
 */

const db = require('../module/db')
minimist = require('minimist')
MD5 = require("crypto-js/md5");

var args = minimist(process.argv.slice(2)); // {user:xxx,password:xxx}

if (args.user && args.password) {
    db.update('users', { user: args.user }, { $set: { password: MD5(args.password.toString()).toString() } }) // md5加密
        .then((data) => {
            data.result.n > 0 ? console.log('成功') : console.log('失败:' + data.results);
        })
        .catch(err => console.log(err))
} else {
    console.log('缺失参数');
}