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
        if(answers.action === "Add employee"){
            addEmployee();
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
        if(err) throw err;
        return data
    })
const readEmployees = connection.query("SELECT * FROM employee",(err,data) =>{
        if(err) throw err;
        return data
    })
 
async function addEmployee (){
    try{
        const rolesData = await readRoles._results
        const employeeData = await readEmployees._results
        const roletitles = rolesData.map(e => e.title)
        console.log(roles)
        inquirer
        .prompt([
            {
                name: "employee-firstName",
                type: "input",
                message: `What is the first name of the employee?`
            },
            {
                name: "employee-lastName",
                type:"input",
                message: `What is the last name of the employee?` 
            },
            {
                name: "employee-role",
                type:"list",
                message: `What is the employee's role?`,
                choices: roletitles
            },
            {
                name: "employee-manager",
                type:"list",
                message: `Who is the employee's manager?`,
                choices: ["me"]
            }
            //TODO: add in another prompt asking for employee manager
        ]
        ).then(answers => {
            //TODO: Ne 
            // connection.query("INSERT INTO employee (first_name, last_name, roleVALUES",
            // {firstName: answers.employee-firstName},
            // (err,data) =>{
            //     if(err) throw err;
            //     const roles = data.map(e => e.title)
            //     addEmployee(roles)
        
            // })
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
    
}




// const readRoles = () =>{
//     connection.query("SELECT * FROM role",function(err,data){
//         if(err) throw err;
//         console.table(data);
//         return data;

//     })
// }

