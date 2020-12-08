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

//UPDATE?

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
                doThis = "update" + response.updateType + "()";
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
        inquirer.prompt([{
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
                function(err, res) {
                if (err) throw err;
                console.log(res.affectedRows + ` department inserted!\n`);
                doMore();
                }
        )}
    )}

const addRole = () => {
        connection.query('SELECT * FROM department', function(err, resDept){
        let deptList = resDept.map(x => [x.id,x.name]);
        if(err) throw err;
        inquirer.prompt([{
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
                function(err, res) {
                if (err) throw err;
                console.log(res.affectedRows + ` role inserted!\n`);
                doMore();
                }
            )}
        )}
    )} 

const addEmp = () => {
    connection.query('SELECT * FROM employee', function(err, resEmp){
        connection.query('SELECT * FROM role', function(err, resRole){
            let managerList = resEmp.map(x => {
                if(x.role_id === 1){
                    let name = `${x.first_name} ${x.last_name}`; 
                    return [x.id, name]
                }
                }); 
            let roleList = resRole.map(x => [x.id,x.title]);
            if(err) throw err;
            inquirer.prompt([{
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
                        first_name: response.fname,
                        last_name: response.lname,
                        role_id: response.role,
                        manager_id: response.mang
                    },
                    function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ` employee inserted!\n`);
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
        `SELECT * FROM department`,
        function(err,resDept){  
            if(err) throw err;  
        connection.query(
            `SELECT * FROM role`,
            function(err, resRole) {
            if (err) throw err;
            let output = [];
            resRole.forEach(e=>{
                let deptName = "";
                for(let i = 0; i < resDept.length; i++){
                    if(parseInt(resDept[i].id) === parseInt(e.department_id)){
                        deptName = resDept[i].name;
                    }
                }
                output.push({id: e.id, title: e.title, salary: e.salary, "department id": deptName})
            })       
            console.table(output);          
            doMore();
            })
        })
    }

const selectEmp = () => {
    connection.query(
        `SELECT * FROM role`,
        function(err,resRole){  
            if(err) throw err;     
        connection.query(
            `SELECT * FROM employee`,
            function(err, resEmp) {
            if (err) throw err;
            let output = [];
            let empList = resEmp.map(x => [x.id,x.title]);          
            resEmp.forEach(e=>{                
                let roleName, managerName = "";  
                for(let i = 0; i < resRole.length; i++){
                    if(resRole[i].id === e.role_id){
                        roleName = resRole[i].title;
                    }
                }
                for(let j = 0; j < empList.length; j++){
                    if(resEmp[j].id === e.manager_id){
                        managerName = `${resEmp[j].first_name} ${resEmp[j].last_name}`;
                    }
                }
                output.push({id: e.id, "first name": e.first_name, "last name": e.last_name,
                    role: roleName, manager: managerName})
            })       
            console.table(output);          
            doMore();
        })
    })
}

const updateDept = () => {
    connection.query(
        `SELECT * FROM department`,
        function(err, resDept) {
        if (err) throw err;
        deptList = resDept.map(e=> [e.id,e.name]);
        inquirer.prompt([{
            message: "Which department name do you want to change?",
            type: "list",
            choices: () => {
                let arr = []
                for(let i = 0; i < deptList.length; i++){
                    arr.push({name: deptList[i][1], value: deptList[i][0]});
                }
                return arr;
            },
            name: "whichName"
        },{
            message: "What do you want the new department name to be?",
            type: "input",
            validate: ans => ans === "" ? "Please enter a new department name" : true,
            name: "newName"
        }]).then(response => {  
            connection.query(
                `UPDATE department SET name = "${response.newName}" WHERE id = "${response.whichName}"`,
                function(err, res) {
                if (err) throw err;
                console.log(res.affectedRows + ` department updated!\n`);
                doMore();
                })
            })
        })
}

const updateRole = () => {
    connection.query(
        `SELECT * FROM department`,
        function(err, resDept) {
        if (err) throw err;
        connection.query(
            `SELECT * FROM role`,
            function(err, resRole) {
            if (err) throw err;
            let deptList = []
            resDept.forEach(e=> deptList.push({value: e.id, name: e.name}));
            console.log(deptList);
            roleList = resRole.map(e=> [e.id,e.title,e.salary,e.department_id]);
            inquirer.prompt([{
                message: "Which do you want change?",
                type: "list",
                choices: [{name: "Role Name", value: "title"},
                {name: "Role Salary", value: "salary"},
                {name: "Role Department", value: "department_id"}],
                name: "choice"                
            },{
                message: "Which role name do you want to change?",
                type: "list",
                choices: () => {
                    let arr = []
                    for(let i = 0; i < roleList.length; i++){
                        arr.push({name: roleList[i][1], value: roleList[i][0]});
                    }
                    return arr;
                },
                name: "whichName",
                when: response => response.choice === "title"
            },{
                message: "What do you want the new role name to be?",
                type: "input",
                validate: ans => ans === "" ? "Please enter a new role name" : true,
                name: "newName",
                when: response => response.choice === "title"
            },{
                message: "Which role salary do you want to change?",
                type: "list",
                choices: () => {
                    let arr = []
                    for(let i = 0; i < roleList.length; i++){
                        arr.push({name: `${roleList[i][1]} $${roleList[i][2]}`, value: roleList[i][0]});
                    }
                    return arr;
                },
                name: "whichName",
                when: response => response.choice === "salary"
            },{
                message: "What do you want the new role salary to be?",
                type: "input",
                validate: ans => ans === "" || isNaN(ans) ? "Please enter a salary number" : true,
                name: "newName",
                when: response => response.choice === "salary"
            },{
                message: "Which role department do you want to change?",
                type: "list",
                choices: () => {
                    let arr = []
                    for(let i = 0; i < roleList.length; i++){
                        let deptName = "";
                        for(let j = 0; j < resDept.length; j++){
                            if(resDept[j].id === roleList[i][0]){
                                deptName = resDept[j].name;
                            }
                        }
                        arr.push({name: `${roleList[i][1]} Dept: ${deptName}`, value: roleList[i][0]});
                    }
                    return arr;
                },
                name: "whichName",
                when: response => response.choice === "department_id"
            },{
                message: "What do you want the new role department to be?",
                type: "list",
                choices: deptList,
                name: "newName",
                when: response => response.choice === "department_id"
            }]).then(response => {  
                connection.query(
                    `UPDATE role SET ${response.choice} = "${response.newName}" 
                    WHERE id = "${response.whichName}"`,
                    function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ` role updated!\n`);
                    doMore();
                    })
                })
            })
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