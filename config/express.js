var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http');
var mongoClient = require('mongodb').MongoClient;

app.use(bodyParser.json({
    parameterLimit: 100000,
    limit: 1024 * 1024 * 20
}));
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
app.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: 1024 * 1024 * 20,
    extended: true
}));

var dbobj;
mongoClient.connect('mongodb://localhost:27017/Orders', function (err, db) {
	if (err) {console.log(err)}
	else{
		console.log("db connect")
		dbobj = db.db();
	}
});

app.get("/get", function(req,res){res.send("success")})

app.post('/orders/create', function (req, res) {
	if (dbobj != 'Error') {
		let inputJSON = req.body;
		console.log("creating",inputJSON)
		if (inputJSON.order_id && inputJSON.order_id != "") {
			dbobj.collection('Orders').find({ "order_id": inputJSON.order_id }).toArray(function (err, result) {
				if (err) {
					res.send("Failed to create, try again")
				} else {
					if (result.length > 0) {
						res.send("Already order available with this order_id" + inputJSON.order_id);
					} else {
						let json = {
							"order_id": "",
							"item_name": "",
							"cost": "",
							"order_date": "",
							"delivery_date": ""
						}
						if (inputJSON.order_id) {
							json.order_id = inputJSON.order_id;
						}
						if (inputJSON.item_name) {
							json.item_name = inputJSON.item_name;
						}
						if (inputJSON.cost) {
							json.cost = inputJSON.cost;
						}
						if (inputJSON.order_date) {
							json.order_date = inputJSON.order_date;
						}
						if (inputJSON.delivery_date) {
							json.delivery_date = inputJSON.delivery_date;
						}
						dbobj.collection('Orders').insertOne(json, function (err, result) {
							if (err) { res.send("failed to create try again") }
							else {
								console.log(result)
								res.send("Successfully order created")
							}
						})
					}
				}
			})
		} else {
			res.send("order_id missing")
		}

	} else {
		res.send("Failed to connect to db")
	}
})

app.post('/orders/update', function (req, res) {
	if (dbobj != 'Error') {
		let inputJSON = req.body;
		if (inputJSON.order_id && inputJSON.order_id != "") {
			if (inputJSON.delivery_date && inputJSON.delivery_date != "") {
				dbobj.collection('Orders').updateOne({ "order_id": inputJSON.order_id }, { "$set": { "delivery_date": inputJSON.delivery_date } }, function (err, result) {
					if (err) {
						res.send("Failed to update, try again")
					} else {
						res.send("Successfully updated delivery date");
					}
				})
			} else {
				res.send("delivery_date is missing")
			}
		} else {
			res.send("order_id missing")
		}

	} else {
		res.send("Failed to connect to db")
	}
})

app.post('/orders/list', function (req, res) {
	if (dbobj != 'Error') {
		let inputJSON = req.body;
		if (inputJSON.date && inputJSON.date != "") {
			dbobj.collection('Orders').find({ "order_date": inputJSON.date }).toArray(function (err, result) {
				if (err) {
					res.send("Failed to get list, try again")
				} else {
					res.send(result);
				}
			})
		} else {
			res.send("date is missing")
		}

	} else {
		res.send("Failed to connect to db")
	}
})

app.post('/orders/search', function (req, res) {
	if (dbobj != 'Error') {
		let inputJSON = req.body;
		if (inputJSON.order_id && inputJSON.order_id != "") {
			dbobj.collection('Orders').findOne({ "order_id": inputJSON.order_id }, function (err, result) {
				if (err) {
					res.send("Failed to find the order, try again")
				} else {
					if(result != null){
						res.send(result);
					}else{
						res.send("No Order available with this order_id" + inputJSON.order_id)
					}
					
				}
			})
		} else {
			res.send("order_id is missing")
		}

	} else {
		res.send("Failed to connect to db")
	}
})

app.post('/orders/delete', function (req, res) {
	if (dbobj != 'Error') {
		let inputJSON = req.body;
		if (inputJSON.order_id && inputJSON.order_id != "") {
			dbobj.collection('Orders').deleteOne({ "order_id": inputJSON.order_id }, function (err, result) {
				if (err) {
					res.send("Failed to find the order, try again")
				} else {
					if(result.deletedCount > 0){
						res.send("Successfully deleted the order");
					}else{
						res.send("Order not availble to delete "+inputJSON.order_id)
					}
				}
			})
		} else {
			res.send("order_id is missing")
		}

	} else {
		res.send("Failed to connect to db")
	}
})

module.exports = app;