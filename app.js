var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "securepass12!",
  database: "employeesDB"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    questionTime();
  });

function questionTime(){
    inquirer.prompt([{
        message: "What would you like to do?",
        type: "list",
        options: 
        [{message: "Add (dept, roles, emps)", value: "ADD"},
        {message: "View (dept, roles, emps)", value: "SELECT"},
        {message: "Update employee roles", value: "UPDATE"}],
        value: "choice"
    },{
        message: "What would you like to add?",
        type: "list",
        options: 
        [{message: "Departments", value: "departments"},
        {message: "Employees", value: "employee"},
        {message: "Roles", value: "role"}],
        value: "addType",
        when: (response) => response.choice === "ADD"
    },{
        message: "What would you like to update?",
        type: "list",
        options: 
        [{message: "Departments", value: "departments"},
        {message: "Employees", value: "employee"},
        {message: "Roles", value: "role"}],
        value: "updateType",
        when: (response) => response.choice === "UPDATE"
    }])
}
  