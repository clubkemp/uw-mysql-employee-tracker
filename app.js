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

const query = util.promisify(connection.query).bind(connection);
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
            "View Employee by Manager",
            "View departments",
            "View roles",
            "Add employee",
            "Add role",
            "Add department",
            "Update employee role",
            "Update employee manager",
            "Delete Employee",
            "exit"
        ],
    })
    .then(answers => {
        if(answers.action === "View all employees"){
            viewEmployees();
        }else if(answers.action === "View departments"){
            viewDepartments();
        }else if(answers.action === "View roles"){
            viewRoles();
        }else if(answers.action === "Add employee"){
            addEmployee();
        }else if(answers.action === "Add role"){
            addRole();
        }else if(answers.action === "Add department"){
            addDepartment();
        }else if(answers.action === "Update employee role"){
            updateRole();
        }else if(answers.action === "Update employee manager"){
            updateManager();
        }else if(answers.action === "View Employee by Manager"){
            viewEmployeeByManager();
        }else if(answers.action === "Delete Employee"){
            deleteEmployee();
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
const readRoles = async () =>{
    try{
        const data = await query("SELECT * FROM role")
        return data
    }catch(err){
        console.log(err)
    }
    
} 
const readEmployees = async () =>{
    try{
        const data = await query("SELECT * FROM employee")
        return data
    }catch(err){
        console.log(err)
    }
} 
const readDepartments = async () =>{
    try{
        const data =query("SELECT * FROM department")
        return data
    }catch(err){
        console.log(err)
    }
}
 
const viewEmployees = async () => {
    try{
        const data = await query(`SELECT e.first_name, e.last_name, title AS Position, salary AS Salary, name AS Department, CONCAT (m.first_name, " ", m.last_name) AS Manager
        FROM employee e
        INNER JOIN role
        ON e.role_id = role.id
        INNER JOIN department
        ON role.department_id = department.id
        INNER JOIN employee m
        on e.manager_id = m.id;`
        ); 
       console.table(data);
       promptUser();
    }
    catch(err){
        console.log(err)
    }
};
const viewEmployeeByManager = async () => {
    try{
        const employeeData = await readEmployees()
        const employeeNames = employeeData.map(e => `${e.first_name} ${e.last_name} id:${e.id}`)
    
        inquirer
        .prompt([
            {
                name: "team",
                type: "list",
                message: `Who's team would you like to see?`,
                choices: employeeNames
            },
        ]
        ).then(answers => {;
            const employeeId = answers.team.split(':')[1]
            console.log(employeeId)
            connection.query(`SELECT CONCAT(first_name, " ",last_name) AS Employee FROM employee WHERE manager_id=?`,
            [employeeId],
            (err, data)=>{
                if(err) throw err;
                console.table(data);
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
    catch(err){
        console.log(err)
    }
};

const viewDepartments = async () => {
    try{
       const departmentData = await readDepartments()
       console.table(departmentData);
       promptUser();
    }
    catch(err){
        console.log(err)
    }
};

const viewRoles = async () => {
    try{
        const roleData = await readRoles() 
        console.table(roleData);
        promptUser();
       
    }
    catch(err){
        console.log(err)
    }
};

const addEmployee = async () => {
    try{
        const rolesData = await readRoles();
        console.log(rolesData)
        const employeeData = await readEmployees()
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
        const departmentData = await readDepartments()
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
        const rolesData = await readRoles()
        console.log(rolesData)
        const employeeData = await readEmployees()
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

const updateManager = async () => {
    try{
        const employeeData = await readEmployees()
        //TODO: BUild in the employee # too
        const employeeNames = employeeData.map(e => `${e.first_name} ${e.last_name} id:${e.id}`)
        
        inquirer
        .prompt([
            {
                name: "employee",
                type: "list",
                message: `Which Employee would you like to update the manager for?`,
                choices: employeeNames
            },
            {
                name: "manager",
                type:"list",
                message: `Who is their new manager?` ,
                choices: employeeNames
            }
        ]
        ).then(answers => {
            const {employee, manager} = answers;

            //TODO: pull out the IDs used
            const employeeId = employee.split(':')[1]
            console.log(employeeId)
            const managerId = manager.split(":")[1]
            console.log(managerId)
            connection.query(`UPDATE employee SET manager_id=? WHERE id=?`,
            [managerId, employeeId],
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

const deleteEmployee = async () => {
    try{
        const employeeData = await readEmployees()
        const employeeNames = employeeData.map(e => `${e.first_name} ${e.last_name} id:${e.id}`)
    
        inquirer
        .prompt([
            {
                name: "deleteEmployee",
                type: "list",
                message: `Who would you like to delete?`,
                choices: employeeNames
            },
        ]
        ).then(answers => {;
            const employeeId = answers.deleteEmployee.split(':')[1]
            console.log(employeeId)
            connection.query(`DELETE FROM employee WHERE id=?`,
            [employeeId],
            (err, data)=>{
                if(err) throw err;
                console.log(`${answers.deleteEmployee} has been successfully deleted`)
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
    catch(err){
        console.log(err)
    }
};
const viewRoles = async () => {
    try{
        const roleData = await readRoles()
        inquirer.prompt({
            name: "deleteRole",
            type: "list",
            message: `Who would you like to delete?`,
            choices: employeeNames
        }) 
        console.table(roleData);
        promptUser();
       
    }
    catch(err){
        console.log(err)
    }
};