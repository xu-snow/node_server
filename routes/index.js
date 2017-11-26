// initialize
require('../module/cache')().init()



const 
	express = require('express'),
	articles = require('./articles'),
	classes = require('./classes'),
	login = require('./login'),
	uploadImage = require('./uploadImage')
	
	resourceRouter = express.Router(),
	apiRouter = express.Router()



// url                      type        description                       require Login

// /resource/articles        get         get all article                  false
// /resource/articles        post        create new article               true
// /resource/articles/13     get         get one article by id            false
// /resource/articles/13     put         update one article by id         true
// /resource/articles/13     delete      delete one article by id         true

// /resource/classes         get         get all classes                  false
// /resource/classes         post        create new class                 true
// /resource/classes/13      put         update class by id               true
// /resource/classes/13      delete      delete class by id               true

// /api/login                post        login
// /api/login                get         judge islogin

// /api/uploadImage          post         add img                         true
// /api/uploadImage          delete       delete img                      true

resourceRouter.use((req, res, next) => {
	let method = req.method,
		user = req.session.user
	// verify permissions
	// if (process.env.NODE_ENV === 'production') {
		if (method == 'POST' || method == 'PUT' || method == 'DELETE') {
			if (!user) {
				// res.end(JSON.stringify({
				// 	code: 1,
				// 	msg: 'limited authority'
				// }), 'utf8')

				return res.status(401).send('无权限')
			}
		}
	// }

	next()
})

// /resource/articles
resourceRouter.get('/articles', articles.get)
resourceRouter.post('/articles', articles.post)

// /resource/articles/:id
resourceRouter.get('/articles/:id', articles.getOne)
resourceRouter.put('/articles/:id', articles.put)
resourceRouter.delete('/articles/:id', articles.delete)

// /resource/classes
resourceRouter.get('/classes', classes.get)
resourceRouter.post('/classes', classes.post)

// /resource/classes/:id
resourceRouter.put('/classes/:id', classes.put)



// /api/login
apiRouter.post('/login', login.login)
apiRouter.get('/login', login.islogin)

// /api/uploadImage
apiRouter.post('/uploadImage',uploadImage.post)
apiRouter.delete('/uploadImage',uploadImage.delete)


module.exports = {
	resource: resourceRouter,
	api: apiRouter
}
