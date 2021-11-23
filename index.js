const express = require('express');
const exphbs  = require('express-handlebars');
const shop = require('./avo-shopper');
const pg = require('pg');
const Pool = pg.Pool;
// require('dotenv').config()


const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/avo_shopper';

const pool = new Pool({
    connectionString
});

const shopping = shop(pool);

const app = express();
const PORT =  process.env.PORT || 5000;

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

let counter = 0;

app.get('/', function(req, res) {
	res.render('index', {
		counter
	});
});


app.get('/getbyID/:name/:id', async function(req, res) {
	console.log(req.params.id)
	res.render('price&qty', {
		name: req.params.name,
		shopFound: await shopping.dealsForShop(req.params.id)
	});
});

app.get('/listshop', async function(req, res) {
	res.render('listshop', {
		allShops: await shopping.listShops()
	});
});

app.post('/action_Shop', async function(req, res){
	const {shop, price, qty} = req.body
	if(shop !== "" && price !== "" && qty !== ""){
		var getshop = await shopping.createShop(shop);
		await shopping.createDeal(getshop.id, qty , price);
	}
	res.render("index")
});





// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`AvoApp started on port ${PORT}`)
});