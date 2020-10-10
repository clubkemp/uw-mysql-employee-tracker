const questions = [
  {
    name: "action",
    message: "What would you like to do?",
    type: "list",
    choices: ["add", "view", "update", "exit"],
  },
  {
    name: "action-type",
    message: `OK, what would you like to ${answers.action}`,
    choices: ["department", "role", "employee"],
    when: (answers) => answers.action != "exit"  },
];
