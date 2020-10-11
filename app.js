const mysql = require("mysql");
const inquirer = require("inquirer");
const questions = require("./utils/questions.js")

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
    .prompt(questions)
    .then(answers => {
        // Use user feedback for... whatever!!
    })
    .catch(error => {
        if(error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
        } else {
        // Something else when wrong
        }
    });
}

