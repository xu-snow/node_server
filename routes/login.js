const
	db = require('../module/db')



const login = (req, res) => {
	db.find('users', req.body).then(data => {
		if (data.length == 0) {
			res.send(JSON.stringify({
				code: 1,
				msg: 'Incorrect username or password.'
			}))
		} else {
			req.session.user = data[0].user

			res.send(JSON.stringify({
				code: 0
			}))
		}
	}).then(err => {
		res.send(JSON.stringify(err))
	})
}

const islogin = (req, res) => {
	const user = req.session.user
	if(!user){
		return res.send(JSON.stringify({
			islogin:false
		}))
	}
	res.send(JSON.stringify({
		islogin:true
	}))
}



module.exports = {
	login: login,
	islogin: islogin
}