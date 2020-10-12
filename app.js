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
            //TODO: add in another prompt asking for employee manager
        ]
        ).then(answers => {
            const {employeeFirstName, employeeLastName, employeeRole, employeeManager} = answers;

            //TODO: pull out the IDs used
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
    
}




// const readRoles = () =>{
//     connection.query("SELECT * FROM role",function(err,data){
//         if(err) throw err;
//         console.table(data);
//         return data;

//     })
// }

