const mysql = require("mysql")
const inquirer = require("inquirer");
const util = require("util")
// const questions = require("./utils/questions.js")
const connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "password",
    database: "employee_trackerdb"
  });


connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    promptUser();
});

const promptUser = () =>{  
    inquirer
    .prompt( {
        name: "action",
        message: "What would you like to do?",
        type: "list",
        choices: [
            "View all employees",
            "View departments",
            "View roles",
            "Add employee",
            "Add role",
            "Add department",
            "update employee role",
            "exit"
        ],
    })
    .then(answers => {
        if(answers.action === "View all employees"){
            viewEmployees();
        }else if(answers.action === "View departments"){
            viewDepartments();
        }else if(answers.action === "view roles"){
            viewRoles();
        }else if(answers.action === "Add employee"){
            addEmployee();
        }else if(answers.action === "Add role"){
            addRole();
        }else if(answers.action === "Add department"){
            addDepartment();
        }else if(answers.action === "update employee role"){
            updateRole();
        }else{
            connection.end()
        }
    })
    .catch(error => {
        if(error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
        } else {
        // Something else when wrong
        }
    });
}
const readRoles = connection.query("SELECT * FROM role",(err,data) =>{
    if(err) {
        throw err;
    }
    return data
})
const readEmployees = connection.query("SELECT * FROM employee",(err,data) =>{
    if(err) throw err;
    return data
})

const readDepartments = connection.query("SELECT * FROM department",(err,data) =>{
    if(err) throw err;
    return data
})
const joinAll = connection.query(`SELECT first_name, last_name, title AS Position, salary AS Salary, name AS Department
FROM employee
INNER JOIN role
ON role_id = role.id
INNER JOIN department
ON department_id = department.id`
,(err,data) =>{
    if(err) {
        throw err;
    }
    return data
})
 
const viewEmployees = async () => {
    try{
       const employeeData = await joinAll._results[0] 
       console.table(employeeData);
       promptUser();
    }
    catch(err){
        console.log(err)
    }
};

const viewDepartments = async () => {
    try{
       const departmentData = await readDepartments._results[0] 
       console.table(departmentData);
       promptUser();
    }
    catch(err){
        console.log(err)
    }
};

const viewRoles = async () => {
    try{
       const roleData = await readRoles._results[0] 
       console.table(roleData);
       promptUser();
    }
    catch(err){
        console.log(err)
    }
};

const addEmployee = async () => {
    try{
        const rolesData = await readRoles._results[0]
        console.log(rolesData)
        const employeeData = await readEmployees._results[0]
        const roletitles = rolesData.map(e => e.title)
        //TODO: BUild in the employee # too
        const employeeNames = employeeData.map(e => `${e.first_name} ${e.last_name} id:${e.id}`)
        employeeNames.push("N/A")
        
        inquirer
        .prompt([
            {
                name: "employeeFirstName",
                type: "input",
                message: `What is the first name of the employee?`
            },
            {
                name: "employeeLastName",
                type:"input",
                message: `What is the last name of the employee?` 
            },
            {
                name: "employeeRole",
                type:"list",
                message: `What is the employee's role?`,
                choices: roletitles
            },
            {
                name: "employeeManager",
                type:"list",
                message: `Who is the employee's manager?`,
                choices: employeeNames
            }
        ]
        ).then(answers => {
            const {employeeFirstName, employeeLastName, employeeRole, employeeManager} = answers;

            const role = rolesData.filter(e => e.title === employeeRole)
            const roleId = role[0].id
            let managerId
            if (employeeManager != "N/A"){
                managerId = employeeManager.split(':')[1]
            }
            console.log(employeeFirstName, employeeLastName, roleId, managerId)
            connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)",
            [employeeFirstName, employeeLastName, roleId, managerId],
            (err,data) =>{
                if(err) throw err;
                promptUser();
            })
        })
        .catch(error => {
        if(error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
        } else {
        // Something else when wrong
        }
    });
    }catch(err){
        console.log(err)
    }

};

const addRole = async () => {
    try {
        const departmentData = await readDepartments._results[0]
        console.log(departmentData);
        const departmentNames = departmentData.map(e => e.name)
        inquirer
        .prompt([
        {
            name:"title",
            type:"input",
            message:"What is the role title?"
        },
        {
            name: "salary",
            type:"number",
            message:"How much does the role pay?"
        },
        {
            name:"department",
            type:"list",
            choices: departmentNames
        }

        ])
        .then(answers => {
            const {title, salary, department} = answers
            const roleDepartment = departmentData.filter(e => e.name === department)
            const departmentId = roleDepartment[0].id
            
            connection.query("INSERT INTO role (title, salary, department_id) VALUES (?,?,?)",
            [title, salary, departmentId],
            (err,data) =>{
                if(err) throw err;
                promptUser();
            })
        })
        .catch(error => {
        if(error.isTtyError) {
            // Prompt couldn't be rendered in the current environment
        } else {
            // Something else when wrong
        }
        });
    }catch(err){
        console.log(err)
    }
    
};

const addDepartment = async () => {
        inquirer
        .prompt(
        {
            name:"name",
            type:"input",
            message:"What is the new department called?"
        })
        .then(answers => {
            connection.query(`INSERT INTO department (name) VALUES ("${answers.name}")`,
            (err,data) =>{
                if(err) throw err;
                promptUser();
            })
        })
        .catch(error => {
        if(error.isTtyError) {
            // Prompt couldn't be rendered in the current environment
        } else {
            // Something else when wrong
        }
        });
    
}

//TODO: Update employee role
const updateRole = async () => {
    try{
        const rolesData = await readRoles._results[0]
        console.log(rolesData)
        const employeeData = await readEmployees._results[0]
        const roletitles = rolesData.map(e => e.title)
        //TODO: BUild in the employee # too
        const employeeNames = employeeData.map(e => `${e.first_name} ${e.last_name} id:${e.id}`)
        
        inquirer
        .prompt([
            {
                name: "employeeEdit",
                type: "list",
                message: `What is the name of the employee you would like to change?`,
                choices: employeeNames
            },
            {
                name: "newRole",
                type:"list",
                message: `What is their new role?` ,
                choices: roletitles
            }
        ]
        ).then(answers => {
            const {employeeEdit, newRole} = answers;

            //TODO: pull out the IDs used
            const role = rolesData.filter(e => e.title === newRole)
            const roleId = role[0].id
            const employeeId = employeeEdit.split(':')[1]
            

            connection.query(`UPDATE employee SET role_id=? WHERE id=?`,
            [roleId, employeeId],
            (err,data) =>{
                if(err) throw err;
                promptUser();
            })
        })
        .catch(error => {
        if(error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
        } else {
        // Something else when wrong
        }
    });
    }catch(err){
        console.log(err)
    }

};