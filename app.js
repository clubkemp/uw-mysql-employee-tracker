//require in mysql to connect to sql db
const mysql = require("mysql")
//require in inquirere to prompt the user
const inquirer = require("inquirer");
//requrie in utils so we can promisify the sql queries
const util = require("util")
const figlet = require('figlet');
 

//connection params used to establish our mysql connection
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
//async mysql query variable
const query = util.promisify(connection.query).bind(connection);
//connection function to start the user prompt upon connection
connection.connect(function (err) {
    if (err) throw err;
    //log the connection
    console.log("connected as id " + connection.threadId);figlet('Employee Tracker', function(err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(data)
        promptUser();
    });
    //start the user prompt cycle
    
});
//main application logic switches in here
const promptUser = () =>{  
    //use inquierer to get what the user wants to do
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
    //then we can perform some checks to see what function needs to fire next
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
        }
        //if none of the above is true, then the user must have chosen exit so end connection
        else{
            connection.end()
        }
        
        
    })
    //cach any errors thrown 
    .catch(error => {
        if(error.isTtyError) {
        console.log("Prompt couldn't be rendered in the current environment")
        } else {
        console.log("Somethin else went wrong")
        }
    });
}
// -------------Read db helper functions-----------------------------------------------
//read the roles table, needs to be async to work in later functions
const readRoles = async () =>{
    try{
        // wait until query select roles comes back
        const data = await query("SELECT * FROM role")
        //return it
        return data
    }catch(err){
        console.log(err)
    }
    
}
//async read the employees table 
const readEmployees = async () =>{
    try{
        //wait until select query is fullfilled
        const data = await query("SELECT * FROM employee")
        //then return the data
        return data
    }catch(err){
        console.log(err)
    }
} 
//async read departments table
const readDepartments = async () =>{
    try{
        //wait until select query if fullfilled
        const data =query("SELECT * FROM department")
        //return the data
        return data
    }catch(err){
        console.log(err)
    }
}
// ------------------Functions for user actions -------------------------------- 
//view all employees
const viewEmployees = async () => {
    try{
        //do a select on joined tables
        //we select the names, role, salary, department, and manager from a joine across all tables
        const data = await query(`SELECT e.first_name, e.last_name, title AS Position, salary AS Salary, name AS Department, CONCAT (m.first_name, " ", m.last_name) AS Manager
        FROM employee e
        INNER JOIN role
        ON e.role_id = role.id
        INNER JOIN department
        ON role.department_id = department.id
        INNER JOIN employee m
        on e.manager_id = m.id;`
        ); 
       //log that as a table
        console.table(data);
        //start prompt over again
       promptUser();
    }
    catch(err){
        console.log(err)
    }
};
//view employees by manager
const viewEmployeeByManager = async () => {
    try{
        //fire readEmployees helper function, await data
        const employeeData = await readEmployees()
        //map that data into a list format for use in prompt firstName lastName : id
        const employeeNames = employeeData.map(e => `${e.first_name} ${e.last_name} id:${e.id}`)
    
        inquirer
        .prompt([
            {
                name: "team",
                type: "list",
                message: `Who's team would you like to see?`,
                //we can use the employee names generated above to help the user
                choices: employeeNames
            },
        ]
        ).then(answers => {;
            //since we built the id into the answer choices, we can split it off and use in our query
            const employeeId = answers.team.split(':')[1]
            //select the employees whos manager_id matches the id chosen above
            connection.query(`SELECT CONCAT(first_name, " ",last_name) AS Employee FROM employee WHERE manager_id=?`,
            [employeeId],
            (err, data)=>{
                if(err) throw err;
                //return the data as table and start the prompt over again
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
//view all departments
const viewDepartments = async () => {
    try{
        //await the data from our read departments helper function
       const departmentData = await readDepartments()
       //log those results and restart the prompt cycle
       console.table(departmentData);
       promptUser();
    }
    catch(err){
        console.log(err)
    }
};
//view all roles
const viewRoles = async () => {
    try{
        //await the arrival of our data via the readRoles helper function
        const roleData = await readRoles() 
        //log that data and restart the userPrompt
        console.table(roleData);
        promptUser();
       
    }
    catch(err){
        console.log(err)
    }
};
//add an employee
const addEmployee = async () => {
    try{
        //await the roles data via our readRoles helper function
        const rolesData = await readRoles();
        //do the same but for our employee table
        const employeeData = await readEmployees()
        //get a list of just the role titles
        const roletitles = rolesData.map(e => e.title)
        //get a list of employee names with their ids to use for manager choice
        const employeeNames = employeeData.map(e => `${e.first_name} ${e.last_name} id:${e.id}`)
        //push N/A onto that employee list in case there is no manager
        employeeNames.push("N/A")
        //fire up inquirere to get input from user
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
                //role title list generated above
                choices: roletitles
            },
            {
                name: "employeeManager",
                type:"list",
                message: `Who is the employee's manager?`,
                //list of current employees to choose from, generated above
                choices: employeeNames
            }
        ]
        ).then(answers => {
            // spread the answers into variables
            const {employeeFirstName, employeeLastName, employeeRole, employeeManager} = answers;
            //since we only grabbed the role string, we need to match it back
            const role = rolesData.filter(e => e.title === employeeRole)
            //then grab the id of the role
            const roleId = role[0].id
            //declare the manager id variable
            let managerId
            if (employeeManager != "N/A"){
                //as long as the user didn't pick NA, we can split the id off the user they chose
                managerId = employeeManager.split(':')[1]
            }
            //now we can insert the new data into our employee table
            connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)",
            //employee names from prompt, role id matched from prompt above, manager id split off from prompt
            [employeeFirstName, employeeLastName, roleId, managerId],
            (err,data) =>{
                if(err) throw err;
                //log a succesfull entry and restart the user prompt
                console.log(`${employeeFirstName} ${employeeLastName} added to employees`)
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
//update an employee role
const updateRole = async () => {
    try{
        //get and await the roles data from helper function
        const rolesData = await readRoles()
        // next get the employee data the same way
        const employeeData = await readEmployees()
        //get a list of roles from the roles data
        const roletitles = rolesData.map(e => e.title)
        //do the same for employee names
        const employeeNames = employeeData.map(e => `${e.first_name} ${e.last_name} id:${e.id}`)
        
        inquirer
        .prompt([
            {
                name: "employeeEdit",
                type: "list",
                message: `What is the name of the employee you would like to change?`,
                //choice from employee list generated above
                choices: employeeNames
            },
            {
                name: "newRole",
                type:"list",
                message: `What is their new role?` ,
                //roles list from above
                choices: roletitles
            }
        ]
        ).then(answers => {
            //spread the answers into variables
            const {employeeEdit, newRole} = answers;

            //match the role chosen from our roles data 
            const role = rolesData.filter(e => e.title === newRole)
            //se we can get the proper role id
            const roleId = role[0].id
            //employee id rolled up in the user prompt, just need to split it off
            const employeeId = employeeEdit.split(':')[1]
            //update the role id of employee with a matching employee id
            connection.query(`UPDATE employee SET role_id=? WHERE id=?`,
            [roleId, employeeId],
            (err,data) =>{
                if(err) throw err;
                //log a successful add and restart the user prompt
                console.log(`${employeeEdit} has been moved to role of ${newRole}`)
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
//update the manager of a chosen employee
const updateManager = async () => {
    try{
        //get and await the employee data from reademployees helper function
        const employeeData = await readEmployees()
        //generate a list of employee names with ids for the user to choose
        const employeeNames = employeeData.map(e => `${e.first_name} ${e.last_name} id:${e.id}`)
        
        inquirer
        .prompt([
            {
                name: "employee",
                type: "list",
                message: `Which Employee would you like to update the manager for?`,
                //list genreated above
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
            //spread the answers into variables
            const {employee, manager} = answers;

            //id of the employee
            const employeeId = employee.split(':')[1]
            //id of the manager
            const managerId = manager.split(":")[1]
            //use two ids to update the employee record
            connection.query(`UPDATE employee SET manager_id=? WHERE id=?`,
            [managerId, employeeId],
            (err,data) =>{
                if(err) throw err;
                //log a successfull update and restart the user prompt
                console.log(`${employee} now answers to ${manager}`)
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
//delete an employee from the employees table
const deleteEmployee = async () => {
    try{
        //get and await the employee data
        const employeeData = await readEmployees()
        //map that return into a list of employee names
        const employeeNames = employeeData.map(e => `${e.first_name} ${e.last_name} id:${e.id}`)
    
        inquirer
        .prompt([
            {
                name: "deleteEmployee",
                type: "list",
                message: `Who would you like to delete?`,
                //list of employees generated above
                choices: employeeNames
            },
        ]
        ).then(answers => {;
            //id of the employee to delet
            const employeeId = answers.deleteEmployee.split(':')[1]
            //feed that id into a delete query
            connection.query(`DELETE FROM employee WHERE id=?`,
            [employeeId],
            (err, data)=>{
                if(err) throw err;
                //log the succcessful deletion and restart the userprompt
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