const
    fs = require('fs'),
    path = require('path'),
    marked = require('marked'),
    co = require('co'),
    moment = require('moment'),
    Cache = require('../module/cache')(),
    db = require('../module/db');

const COLLECTIONNAME = 'articles';


let articles = {}



// save img
const saveImg = imgObj => {
    return new Promise((resolve, reject) => {
        fs.writeFile(
            path.resolve(__dirname, '../public/upload/articles/', imgObj.name),
            new Buffer(imgObj.ctn.replace(/^data:image\/\w+;base64,/, ''), 'base64'),
            err => {
                if (err) { reject({ type: 'saveImg error', err: err, code: 1 }) } else { resolve() }
            }
        )
    })
}



// get all articles
articles.get = (req, res) => {
    let
        classes = Cache.find('classes'),
        filter = req.query.filter,
        limit = parseInt(req.query.limit || 10),
        offset = parseInt(req.query.offset || 0),
        articleIds = [],
        _filter = {};
    const projection = [{ key: 'sort', value: { id: -1 } }, { key: 'limit', value: limit }, { key: 'skip', value: offset }];

    if (filter) {
        classes.every(item => {
            if (item.name === filter) {
                articleIds = item.articles
                return false
            }
            return true
        })
        _filter = { id: { $in: articleIds } }
    }
    db.find(COLLECTIONNAME, _filter, projection).then(({ data, totalAmount }) => {
        if (Array.isArray(data)) {
            res.send(JSON.stringify({
                code: 0,
                totalAmount: totalAmount,
                articles: data.map(item => {
                    let classId = item.classes;
                    item.classes = Cache.findOne('classes', classId)
                    return item
                })
            }))
        } else {
            res.send(JSON.stringify({
                code: 1,
                type: 'error',
                msg: '查询失败'
            }))
        }

    })

    // if (filter == 'all') {
    // 	temp = cache
    // }
    // else {
    // 	cache.forEach((element, index) => {
    // 		element.classes.name == filter && temp.push(element)
    // 	})
    // }

}



// get one article by id
articles.getOne = (req, res) => {
    let id = parseInt(req.params.id),
        classes = Cache.find('classes');
    db.find(COLLECTIONNAME, { id: id }).then(({ data }) => {
            if (Array.isArray(data) && data.length === 1) {
                let _data = data[0],
                    classId = _data.classes;
                _data.classes = Cache.findOne('classes', classId);
                res.send(JSON.stringify({
                    code: 0,
                    article: _data
                }))
            } else {
                res.send(JSON.stringify({
                    code: 1,
                    type: 'error',
                    msg: `查询有误:数量${data?data.length:0}`
                }))
            }

        })
        // res.send(JSON.stringify({
        //     code: 0,
        //     article: Cache.findOne('articles', id) || null
        // }))
}



// upload one article by id
articles.put = (req, res) => {
    let id = Number(req.params.id),
        data = JSON.parse(req.body.data),
        task = [],
        imgObj = Object.assign({}, data.article.bg)

    // pre-process data
    delete data.article._id // delete existing '_id' field because mongoDB not support update '_id' field
    delete data.article.timestamp // not update 'timestamp', 'date', '_index' field
    delete data.article.date
    delete data.article._index

    data.article.html = marked(data.article.markdown)
    data.article.bg.ctn = '/upload/articles/' + data.article.bg.name

    // 修改最后编辑时间
    data.article.last_time = moment().format('YYYY-MM-DD HH:mm')

    task.push(db.update('articles', { id: id }, { $set: data.article }))

    if (data.changeBg) {
        task.push(saveImg(imgObj))
    }

    if (data.changeClasses) {
        task.push(db.update('classes', { id: data.article.classes }, { $push: { articles: id } }))
        task.push(db.update('classes', { id: data.oldClasses }, { $pull: { articles: id } }))
    }

    co(function*() {
        let results = yield task

        if (results[0].result.n) {
            Cache.reload()

            res.send(JSON.stringify({
                code: 0
            }))
        }
    }).catch(err => {
        res.send(JSON.stringify(err))
    })
}



// create new article
articles.post = (req, res) => {
    let data = JSON.parse(req.body.data)

    // save background image
    saveImg(data.bg).then(() => {
        // success
        // pre-process for insert article
        data.bg.ctn = '/upload/articles/' + data.bg.name
        data.html = marked(data.markdown)
        data.date = moment(Number(data.timestamp)).format('YYYY-MM-DD HH:mm')

        // insert article
        return db.insert('articles', data)
    }).then(r => {
        let ok = r.result.n

        data = r.ops[0]

        if (!ok) { throw { code: 1, type: 'insertError', msg: '0 data is inserted at articles' } }

        // insert article id to classes
        return db.update('classes', { id: data.classes }, { $push: { articles: data.id } })
    }).then(r => {
        if (!r.result.n) { throw { code: 1, type: 'updateError', msg: '0 data is updated at classes' } }

        Cache.reload()

        res.send(JSON.stringify({
            code: 0,
            result: data
        }))

    }).catch(err => {
        res.send(JSON.stringify(err))
    })
}


// delete one article by id
articles.delete = (req, res) => {
    let articleId = Number(req.params.id),
        classesId = JSON.parse(req.body.data).classes

    co(function*() {
        yield db.delete('articles', { id: articleId })
        yield db.update('classes', { id: classesId }, { $pull: { articles: articleId } })

        Cache.reload()

        res.send(JSON.stringify({ code: 0 }))
    }).catch(err => {
        res.send(JSON.stringify(err))
    })
}



module.exports = articles