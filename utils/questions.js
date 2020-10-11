const db = require("../app.js")
const questions = [
    {
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
    },
    {
        name: "employee-firstName",
        type: "input",
        message: `What is the first name of the employee`,
        when: (answers) => answers.action === "Add employee"  
    },
    {
        name: "employee-lastName",
        type:"input",
        message: `What is the last name of the employee`,
        when: (answers) => answers.action === "Add employee"  
    },
    {
        name: "employee-role",
        type:"list",
        message: `What is the employee's role?`,
        choices: db.readRoles(),
        when: (answers) => answers.action === "Add employee"  
    },
];

module.exports = questions;
