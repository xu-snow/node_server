const
	Cache = require('../module/cache')(),
	db = require('../module/db')



let classes = {}



// get all classes
classes.get = (req, res) => {
	res.send(JSON.stringify({
		code: 0,
		classes: Cache.find('classes')
	}))
}



// update one classes by id
classes.put = (req, res) => {
	let id = Number(req.params.id),
		set = req.body

	db.DB.collection('classes').findOneAndUpdate(
			{ id: Number(req.params.id) },
			{ $set: set },
			{ returnOriginal: false },
			( err, result ) => {
				if (err) {
					res.send(JSON.stringify({
						code: -1,
						err: err
					}))
				}

				if (result.lastErrorObject.n) {
					Cache.reload()

					res.send(JSON.stringify({
						code: 0,
						result: result.value
					}))
				}
			}
		)
}



// create new classes
classes.post = (req, res) => {
	let data = {
		name: req.body.name,
		articles: []
	}

	db.insert('classes', data).then(result => {
		let ok = result.result.n,
			data = result.ops[0]

		if (ok) {
			Cache.reload()

			res.send(JSON.stringify({
				code: 0,
				result: data
			}))
		}
	}).then(err => {
		res.send(JSON.stringify({
			code: -1,
			err: err,
			errorMsg: 'insertOne error'
		}))
	})
}



module.exports = classes