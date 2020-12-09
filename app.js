var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');

//this one is a mess and in need of a major refactor, hopefully I will have time to do so in the near future

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
//start connection to database
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    questionTime();
  });
//main function, start of inquirer prompts
function questionTime(){    
    inquirer.prompt([{
        message: "What would you like to do?",
        type: "list",
        choices: 
        [{name: "Add (dept, roles, emps)", value: "ADD"},
        {name: "View (dept, dept budgets, roles, emps, emps by category)", value: "SELECT"},
        {name: "Update (dept, roles, emps)", value: "UPDATE"},
        {name: "Delete (dept, roles, emps)", value: "DELETE"},
        "Quit"],
        name: "choice"
    },{
        message: "What would you like to view?",
        type: "list",
        choices: 
        [{name: "Departments", value: "Dept"},
        {name: "Department Budgets", value: "DeptBudget"},
        {name: "Roles", value: "Role"},
        {name: "Employees", value: "Emp"},
        {name: "Employees by Category", value: "EmpByCat"}],
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
    },{
        message: `What would you like to delete?`,
        type: "list",
        choices: 
        [{name: "Departments", value: "department"},
        {name: "Employees", value: "employee"},
        {name: "Roles", value: "role"}],
        name: "deleteType",
        when: response => response.choice === "DELETE"
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
            case "DELETE":
                deleteThis(response.deleteType);
                break;
            default:
                connection.end();
                break;
        }
    })
}
//add Dept function
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
//add role function
const addRole = () => {
        connection.query('SELECT * FROM department', function(err, resDept){
        let deptList = [];
        resDept.forEach(d => deptList.push({value: x.id, name: x.name}));
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
                if(deptList.length < 1 || deptList === undefined){
                    return [{name: "No departments available", value: "0"}];
                }
                return deptList;
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
//add Employee function
const addEmp = () => {
    connection.query('SELECT first_name,last_name,id FROM employee WHERE role_id = "1"', function(err, resEmp){
        if (err) throw err;
        connection.query('SELECT id,title FROM role', function(err, resRole){
            if (err) throw err;
            let managerList = [];
            resEmp.forEach(e => {managerList.push({value: e.id, name: `${e.first_name} ${e.last_name}`})});
            let roleList = [];
            resRole.forEach(r => roleList.push({value: r.id, name: r.title}));
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
                    if(roleList.length < 1 || roleList === undefined){
                        return [{name: "No roles available", value: "0"}];
                    }
                    return roleList;
                }
            },{
                message: "Who is their manager?",
                type: "list",
                name: "mang",
                choices: () => {
                    if(managerList.length < 1 || managerList === undefined){
                        return [{name: "No managers available", value: "0"}];
                    }
                    return managerList;
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

//If I ever get the chance to refactor this mess, I want it to look more like this function
//If only to get better at SQL queries
const selectDeptBudget = () => {
    connection.query(
        `SELECT COUNT(role_id) as roleCount, role.salary, department.name, department.id
        FROM employee
        INNER JOIN role
        ON employee.role_id = role.id
        INNER JOIN department
        ON role.department_id = department.id
        GROUP BY role_id
        ORDER BY department.id ASC;`,
        function(err, resJoin){
        if (err) throw err;
                let output = [];
                resJoin.forEach(e=>{
                    //thank you Umair Ahmed on stackoverflow for the following if condition
                    if(output.findIndex(obj => obj.id == e.id) > -1){
                        let id = output.findIndex(obj => obj.id == e.id);
                        output[id].budget = Math.round(parseInt(output[id].budget)+(parseFloat(e.salary) * parseInt(e.roleCount)));
                    }else{
                        output.push({id: e.id, name: e.name, budget: (parseFloat(e.salary) * parseInt(e.roleCount)).toFixed(0)});
                }
                })
                console.table(output);          
                doMore();
    })
}
//view Roles function
const selectRole = () => { 
        connection.query(
            `SELECT role.*, department.name 
            FROM role
            INNER JOIN department
            WHERE role.department_id = department.id`,
            function(err, resJoin) {
            if (err) throw err;
            let output = [];
            resJoin.forEach(e=>{
                output.push({id: e.id, title: e.title, salary: e.salary, "department id": e.name})
            })       
            console.table(output);          
            doMore();
            })
    }
//view Employees function
//pretty proud of this SQL query
const selectEmp = () => {
    connection.query(
            `SELECT e.*, role.title, 
            (SELECT CONCAT(e2.first_name, " ", e2.last_name) 
            FROM employee as e2 WHERE e2.id = e.manager_id) as mangName	
            FROM employee as e
            INNER JOIN role
            WHERE role.id = e.role_id`,
            function(err, resEmp) {
            if (err) throw err;
            let output = [];          
            resEmp.forEach(e=>{
                output.push({id: e.id, "first name": e.first_name, "last name": e.last_name,
                    role: e.title, manager: e.mangName})
            })       
            console.table(output);          
            doMore();
        })
    
}
//view Employees by category function
const selectEmpByCat = () => {
    inquirer.prompt([{
        message: "What category would you like to sort by?",
        type: "list",
        name: "sortChoice",
        choices: [{name: "Sort by Role", value: "role_id"},
        {name: "Sort by Manager", value: "manager_id"}]
    }
    ]).then(response => {
        if(response.sortChoice === "manager_id"){
            connection.query(
            `SELECT employee.*, role.title
            FROM employee
            INNER JOIN role
            WHERE role_id=role.id;`,
            function(err, resEmp){
            if (err) throw err;
                    let managerList = [];
                    resEmp.forEach(e=> {if(e.role_id === 1)managerList.push({value: e.id, name: `${e.first_name} ${e.last_name}`})})
                    inquirer.prompt([{
                        message: "Which manager's employee would you like to list?",
                        name: "managerID",
                        type: "list",
                        choices: managerList
                    }]).then(secondRes=>{
                        let output = [];
                        resEmp.forEach(e=> {if(e.manager_id === secondRes.managerID)output
                            .push({id: e.id, name: `${e.first_name} ${e.last_name}`, title: e.title})})                    
                        console.table(output);          
                        doMore();
                        })
            })
        }else if(response.sortChoice === "role_id"){
        connection.query(
            `SELECT title,id FROM role`,
            function(err, resRole){
                if (err) throw err;
                let roleList = [];
                resRole.forEach(e=> roleList.push({name: e.title, value: e.id}));
                    inquirer.prompt([{
                        message: "Which manager's employee would you like to list?",
                        name: "roleID",
                        type: "list",
                        choices: roleList
                    }]).then(secondRes=>{
                        connection.query(
                            `SELECT employee.*, role.title
                            FROM employee
                            INNER JOIN role
                            WHERE role_id = ${secondRes.roleID}
                            AND role_id = role.id`,
                            function(err, resEmp){
                                let output = [];
                                resEmp.forEach(e=> output.push({id: e.id, name: `${e.first_name} ${e.last_name}`, title: e.title}));                  
                                console.table(output);          
                                doMore();
                        })
                    })
                }
        )}                
    })
}
//update Dept function
const updateDept = () => {
    connection.query(
        `SELECT * FROM department`,
        function(err, resDept) {
        if (err) throw err;
        deptList = []
        resDept.forEach(e=> deptList.push({value: e.id, name:e.name}));
        inquirer.prompt([{
            message: "Which department name do you want to change?",
            type: "list",
            choices: deptList,
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
//update Role function
const updateRole = () => {
    connection.query(
        `SELECT * FROM department`,
        function(err, resDept) {
        if (err) throw err;
        connection.query(
            `SELECT role.*, department.name 
            FROM role
            INNER JOIN department
            WHERE role.department_id = department.id`,
            function(err, resRole) {
            if (err) throw err;
            let deptList = [], roleNameList = [], roleSalList = [], roleDeptList = [];
            resDept.forEach(e=> deptList.push({value: e.id, name: e.name}));
            resRole.forEach(e=> {roleNameList.push({value: e.id, name: e.title})
                                roleSalList.push({value: e.id, name: `${e.title} $${e.salary}`})
                                roleDeptList.push({value: e.id, name: `${e.title} Dept:${e.name}`})});
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
                choices: roleNameList,
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
                choices: roleSalList,
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
                choices: roleDeptList,
                name: "whichName",
                when: response => response.choice === "department_id"
            },{
                message: "What do you want the new role department to be?",
                type: "list",
                choices: deptList,
                name: "newName",
                when: response => response.choice === "department_id",
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
//update Emp function
const updateEmp = () => {
    connection.query(
        `SELECT e.*, role.title, 
        (SELECT CONCAT(e2.first_name, " ", e2.last_name) 
        FROM employee as e2 WHERE e2.id = e.manager_id) as mangName	
        FROM employee as e
        INNER JOIN role
        WHERE role.id = e.role_id`,
        function(err, resEmp) {
        if (err) throw err;
        connection.query(
            `SELECT * FROM role`,
            function(err, resRole) {
            if (err) throw err;
            let roleList = [], managerList = [], empNameList = [], empRoleList = [], empMangList = [];            
            resRole.forEach(e=> roleList.push({value: e.id, name: e.title}));
            resEmp.forEach(e=> {
                if(e.role_id === 1)managerList.push({value: e.id, name: `${e.first_name} ${e.last_name}`});
                empNameList.push({value: e.id, name: `${e.first_name} ${e.last_name}`});
                empRoleList.push({value: e.id, name: `${e.first_name} ${e.last_name}, Role: ${e.title}`});
                empMangList.push({value: e.id, name: `${e.first_name} ${e.last_name}, Manager: ${e.mangName}`});})
            inquirer.prompt([{
                message: "Which do you want change?",
                type: "list",
                choices: [{name: "Employee's First Name", value: "first_name"},
                {name: "Employee's Last Name", value: "last_name"},
                {name: "Employee's Role", value: "role_id"},
                {name: "Employee's Manager", value: "manager_id"}],
                name: "choice"
            },{
                message: "Which employee's first name do you want to change?",
                type: "list",
                choices: empNameList,
                name: "whichName",
                when: response => response.choice === "first_name"
            },{
                message: "What do you want the new first name to be?",
                type: "input",
                validate: ans => ans === "" ? "Please enter a new name" : true,
                name: "newName",
                when: response => response.choice === "first_name"
            },{
                message: "Which employee's last name do you want to change?",
                type: "list",
                choices: empNameList,
                name: "whichName",
                when: response => response.choice === "last_name"
            },{
                message: "What do you want the new last name to be?",
                type: "input",
                validate: ans => ans === "" ? "Please enter a new name" : true,
                name: "newName",
                when: response => response.choice === "last_name"
            },{
                message: "Which employee's role do you want to change?",
                type: "list",
                choices: empRoleList,
                name: "whichName",
                when: response => response.choice === "role_id"
            },{
                message: "What do you want the employee's new role to be?",
                type: "list",
                choices: roleList,
                name: "newName",
                when: response => response.choice === "role_id"
            },{
                message: "Which employee's manager do you want to change?",
                type: "list",
                choices: empMangList,
                name: "whichName",
                when: response => response.choice === "manager_id"
            },{
                message: "Who do you want the employee's new manager to be?",
                type: "list",
                choices: managerList,
                name: "newName",
                when: response => response.choice === "manager_id"
            }]).then(response => {  
                connection.query(
                    `UPDATE employee SET ${response.choice} = "${response.newName}" 
                    WHERE id = "${response.whichName}"`,
                    function(err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + ` employee updated!\n`);
                    doMore();
                    })
                })
            })
        })  
}
//catch-all delete function
const deleteThis = (tableName) => {
    connection.query(`SELECT * FROM ${tableName}`,
    function(err, res) {
        if (err) throw err;
        let selList = [];            
        res.forEach(e=> selList.push({value: e.id, name: e.name || e.title  || `${e.first_name} ${e.last_name}`}));
        inquirer.prompt([{
            message: `Which ${tableName} do you want to delete?`,
            type: "list",
            choices: selList,
            name: "selID"
        }]).then(response => {
            connection.query(
                `DELETE FROM ${tableName} WHERE id = "${response.selID}"`,
                function(err, res) {
                  if (err) throw err;
                  console.log(`${res.affectedRows} ${tableName} deleted!\n`);
                  doMore();
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

//<o.o;>
//johnwestermeyer.github.io