var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "securepass12!",
  database: "employees_DB"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    questionTime();
  });

//ADD?
    //Dept?
        //ID (check),Name?
    //Roles?
        //ID (check),Name,Salary,Department_ID(get)
    //Emp?
        //ID (check),First Name, Last Name, Role Id (get), Manager Id (get)
//UPDATE?

//VIEW?

function questionTime(){    
    inquirer.prompt([{
        message: "What would you like to do?",
        type: "list",
        choices: 
        [{name: "Add (dept, roles, emps)", value: "ADD"},
        {name: "View (dept, roles, emps)", value: "SELECT"},
        {name: "Update employee roles", value: "UPDATE"},
        "Quit"],
        name: "choice"
    },{
        message: "What would you like to view?",
        type: "list",
        choices: 
        [{name: "Departments", value: "Dept"},
        {name: "Employees", value: "Emp"},
        {name: "Roles", value: "Role"}],
        name: "viewType",
        when: (response) => response.choice === "SELECT"
    },{
        message: "What would you like to update?",
        type: "list",
        choices: 
        [{name: "Departments", value: "Dept"},
        {name: "Employees", value: "Emp"},
        {name: "Roles", value: "Role"}],
        name: "updateType",
        when: (response) => response.choice === "UPDATE"
    },{
        message: `What would you like to add?`,
        type: "list",
        choices: 
        [{name: "Departments", value: "Dept"},
        {name: "Employees", value: "Emp"},
        {name: "Roles", value: "Role"}],
        name: "addType",
        when: response => response.choice === "ADD"
    }]).then(response => {
        let doThis = "";
        switch (response.choice){
            case "ADD":
                doThis = "add" + response.addType + "()";
                eval(doThis);
                break;
            case "UPDATE":
                doThis = "update" + response.viewType + "()";
                eval(doThis);
                break;
            case "SELECT":
                doThis = "select" + response.viewType + "()";
                eval(doThis);
                break;
            default:
                connection.end();
                break;
        }
    })
}

const addDept = () => {
    connection.query('SELECT * FROM department', function(err, res){
        let idList = res.map(x => x.id);
        if(err) throw err;
        inquirer.prompt([{
            message: "What is the department id?",
            type: "input",
            name: "id",
            validate: (ans) => {
            //checking if department ID is in use, input is not a number or is an empty string
               let test = true;
               for(let i = 0; i < idList.length; i++){               
                   if(parseInt(ans)===idList[i]){
                       test = false;
                   }
               }
               if(isNaN(ans)){
                   return "Please Enter a Number Value";
               } else if(!test){
                   return "Please Enter an Original ID Number";
               } else if(ans===""){
                   return "Please Enter an ID Number";
               } else{
                   return true;
               };
           }
        },{
            message: "What is the department name?",
            type: "input",
            name: "name",
            validate: ans => ans === "" ? "Please enter a department name" : true
        }]).then(response => {
             connection.query(
                `INSERT INTO department SET ?`,{
                    id: response.id,
                    name: response.name
                },
                function(err, res2) {
                if (err) throw err;
                console.log(res2.affectedRows + ` department inserted!\n`);
                doMore();
                }
        )}
    )}
)} 

const addRole = () => {
    connection.query('SELECT * FROM role', function(err, res){
        connection.query('SELECT * FROM department', function(err, res2){
        let idList = res.map(x => x.id);
        let deptList = res2.map(x => [x.id,x.name]);
        if(err) throw err;
        inquirer.prompt([{
            message: "What is the role id?",
            type: "input",
            name: "id",
            validate: (ans) => {
            //checking if role ID is in use, input is not a number or is an empty string
               let test = true;
               for(let i = 0; i < idList.length; i++){               
                   if(parseInt(ans)===idList[i]){
                       test = false;
                   }
               }
               if(isNaN(ans)){
                   return "Please Enter a Number Value";
               } else if(!test){
                   return "Please Enter an Original ID Number";
               } else if(ans===""){
                   return "Please Enter an ID Number";
               } else{
                   return true;
               };
           }
        },{
            message: "What is the role title?",
            type: "input",
            name: "name",
            validate: ans => ans === "" ? "Please enter a role name" : true
        },{
            message: "What is the salary?",
            type: "input",
            name: "salary",
            validate: ans => ans === "" || isNaN(ans) ? "Please enter a salary number" : true
        },{
            message: "What is the department?",
            type: "list",
            name: "dept",
            choices: () => {
                let arr = []
                for(let i = 0; i < deptList.length; i++){
                    arr.push({name: deptList[i][1], value: deptList[i][0]});
                }
                return arr;
            }
        }]).then(response => {
             connection.query(
                `INSERT INTO role SET ?`,{
                    id: response.id,
                    title: response.name,
                    salary: response.salary,
                    department_id: response.dept
                },
                function(err, res3) {
                if (err) throw err;
                console.log(res3.affectedRows + ` role inserted!\n`);
                doMore();
                }
            )}
        )}
    )}
)} 

const addEmp = () => {
    connection.query('SELECT * FROM employee', function(err, res){
        connection.query('SELECT * FROM department', function(err, res2){
            let idList = res.map(x => x.id);
            let managerList = res.map(x => {
                if(x.role_id === 1){
                    let name = `${x.first_name} ${x.last_name}`; 
                    return [x.id, name]
                }
                }); 
            let roleList = res2.map(x => [x.id,x.name]);
            if(err) throw err;
            inquirer.prompt([{
                message: "What is the employee id?",
                type: "input",
                name: "id",
                validate: (ans) => {
                //checking if emp ID is in use, input is not a number or is an empty string
                let test = true;
                for(let i = 0; i < idList.length; i++){               
                    if(parseInt(ans)===idList[i]){
                        test = false;
                    }
                }
                if(isNaN(ans)){
                    return "Please Enter a Number Value";
                } else if(!test){
                    return "Please Enter an Original ID Number";
                } else if(ans===""){
                    return "Please Enter an ID Number";
                } else{
                    return true;
                };
            }
            },{
                message: "What is the employee's first name?",
                type: "input",
                name: "fname",
                validate: ans => ans === "" ? "Please enter a first name" : true
            },{
                message: "What is the employee's last name?",
                type: "input",
                name: "lname",
                validate: ans => ans === "" ? "Please enter a last name" : true
            },{
                message: "What is the role?",
                type: "list",
                name: "role",
                choices: () => {
                    let arr = []
                    for(let i = 0; i < roleList.length; i++){
                        arr.push({name: roleList[i][1], value: roleList[i][0]});
                    }
                    return arr;
                }
            },{
                message: "Who is their manager?",
                type: "list",
                name: "mang",
                choices: () => {
                    let arr = []
                    for(let i = 0; i < managerList.length; i++){
                        arr.push({name: managerList[i][1], value: managerList[i][0]});
                    }
                    if(arr.length < 1 || arr === undefined){
                        return [{name: "No managers available", value: "0"}];
                    }
                    return arr;
                }
            }]).then(response => {
                connection.query(
                    `INSERT INTO employee SET ?`,{
                        id: response.id,
                        first_name: response.fname,
                        last_name: response.lname,
                        role_id: response.role,
                        manager_id: response.mang
                    },
                    function(err, res4) {
                    if (err) throw err;
                    console.log(res4.affectedRows + ` employee inserted!\n`);
                    doMore();
                    }
            )}
        )}
    )}
)}

const selectDept = () => {
    connection.query(
        `SELECT * FROM department`,
        function(err, res) {
        if (err) throw err;
        let output = [];
        res.forEach(e=>{
            output.push({id: e.id, name: e.name})
        })       
        console.table(output);          
        doMore();
        })
}

const selectRole = () => {
    connection.query(
        `SELECT * FROM role`,
        function(err, res) {
        if (err) throw err;
        let output = [];
        res.forEach(e=>{
            output.push({id: e.id, title: e.title, salary: e.salary, department_id: e.department_id})
        })       
        console.table(output);          
        doMore();
        })
}




const doMore = () => {
    inquirer.prompt([{
        message: "Do you want to make any more changes?",
        type: "confirm",
        name: "cont"
    }]).then(response => {
        if(response.cont === true){
            questionTime();
        }else{
            connection.end();
        }
    })
}