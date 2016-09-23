var mysql = require('mysql');
var promptly = require('promptly');
var colors = require('colors');
var Table = require('cli-table');
var table = new Table({
	head: ['Item #', 'Product', 'Price']
	, colWidths: [10, 50, 10]
});

var productName = 'none';
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Bor77scht",
    database: "Bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start();
});

var start = function() {
	connection.query('SELECT * FROM Products', function(err, res){
		for (var i = 0; i < res.length; i++){
			table.push([res[i].ItemID, res[i].ProductName, '$' + res[i].Price]);
		};
		console.log(table.toString());
		getProduct();
	});
};

function getProduct(){
	promptly.prompt("What is the Item # of the product would you like to buy?")
	.then(function(id){
		connection.query('SELECT * FROM Products', function(err, res){
			for (var i = 0; i < res.length; i++){
				if (id == res[i].ItemID){
					productName = res[i].ProductName;
				};
			};
			promptly.prompt("How many units of " + productName + " would you like to purchase?")
			.then(function(amount){
				var num = id - 1;
				if (amount <= res[num].StockQuantity){
					var newquant = res[num].StockQuantity - amount;
					var cost = amount * res[num].Price;
					cost = cost.toFixed(2);
					console.log(colors.green("Congrats, you have just bought " + amount + " units of " + productName + "."));
					console.log(colors.green("Your total cost is $" + cost + "."));
					connection.query("UPDATE Products SET ? WHERE ?", [{
						StockQuantity: newquant
					}, {
						ItemID: id
					}]);
					getProduct();
				}
				else {
					console.log(colors.red("We're sorry, but we don't have enough " + productName + " in stock to meet your order."));
					getProduct();
				};
			});
		});
	});
};

// function invalidProduct(productName){
// 	if (productName = 'none') {
// 	console.log(colors.red("Sorry, please select a valid product."));
// 	getProduct();
// 	};
// };