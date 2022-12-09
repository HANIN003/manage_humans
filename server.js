const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");
const figlet = require("figlet");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "o4CHx1QeTgbE",
  database: "employee_db",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connection has been established!");
  startMessage();
});

startMessage = () => {
  figlet("Employee \n \n Manager", (err, data) => {
    if (err) throw err;
    console.log(data);
  });
};

function startPrompt() {
  inquirer
    .prompt({
      type: "list",
      name: "choices",
      message: "What would you like to do?",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "Add A Department",
        "Add A Role",
        "Add An Employee",
        "Update An Employee Role",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.choices) {
        case "View All Departments":
          viewDepts();
          break;

        case "View All Roles":
          viewRoles();

        case "View All Employees":
          viewEmp();

        case "Add A Department":
          addDept();

        case "Add A Role":
          addRole();

        case "Add An Employee":
          addEmp();

        case "Update An Employee Role":
          updateEmp();

        case "Exit":
          connection.end();
          break;
      }
    });
}

function viewDepts() {
  connection.query("SELECT * FROM department", (err, data) => {
    if (err) throw err;
    console.log("Viewing all departments:");
    console.table(data);
    startPrompt();
  });
}

function viewRoles() {
  connection.query("SELECT * FROM role", (err, data) => {
    if (err) throw err;
    console.log("Viewing all roles:");
    console.table(data);
    startPrompt();
  });
}

function viewEmp() {
  connection.query("SELECT * FROM employees", (err, data) => {
    if (err) throw err;
    console.log("Viewing all employees:");
    console.table(data);
    startPrompt();
  });
}

function addDept() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "Please enter new department name.",
        validate: (value) => {
          if (value) {
            return true;
          } else {
            console.log("Please enter the new department name.");
          }
        },
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO department SET ?",
        { name: answer.department },
        (err) => {
          if (err) throw err;
          console.log(`Added ${answer.department} to departments.`);
          startPrompt();
        }
      );
    });
}

function addRole() {
  const roleSql = "SELECT * FROM department";
  connection.query(roleSql, (err, results) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "input",
          name: "role",
          message: "Please enter a title for the new role.",
          validate: (value) => {
            if (value) {
              return true;
            } else {
              console.log("Please enter a title.");
            }
          },
        },

        {
          type: "input",
          name: "salary",
          message: "Please enter the salary for the new role.",
          validate: (value) => {
            if (isNaN(value) === false) {
              return true;
            } else {
              console.log("Please enter a number for the salary.");
            }
          },
        },

        {
          type: "rawlist",
          name: "department",
          choices: () => {
            var choiceArray = [];
            for (let i = 0; i < results.length; i++) {
              choiceArray.push(results[i].name);
            }
            return choiceArray;
          },
          message: "What department will this new role be under?",
        },
      ])
      .then((answer) => {
        var deptChoice;
        for (let i = 0; i < results.length; i++) {
          if (results[i].name === answer.department) {
            deptChoice = results[i];
          }
        }

        connection.query(
          "INSERT INTO role SET ?",
          {
            role: answer.role,
            salary: answer.salary,
            department_id: deptChoice,
          },
          (err) => {
            if (err) throw err;
            console.log(`Added ${answer.role} to roles.`);
            startPrompt();
          }
        );
      });
  });
}

function addEmp() {
  const empSql = "SELECT * FROM employee, role";
  connection.query(empSql, (err, results) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "input",
          name: "firstName",
          message: "What is the employee's first name?",
          validate: (value) => {
            if (value) {
              return true;
            } else {
              console.log("Please enter the employee's first name.");
            }
          },
        },

        {
          type: "input",
          name: "lastName",
          message: "What is the employee's last name?",
          validate: (value) => {
            if (value) {
              return true;
            } else {
              console.log("Please enter the employee's last name.");
            }
          },
        },

        {
          type: "rawlist",
          name: "role",
          choices: () => {
            var choiceArray = [];
            for (let i = 0; i < results.length; i++) {
              choiceArray.push(results[i].title);
            }
            var cleanChoiceArray = [...new Set(choiceArray)];
            return cleanChoiceArray;
          },
          message: "What is the employee's role?",
        },
      ])
      .then((answer) => {
        var chosenRole;

        for (let i = 0; i < results.length; i++) {
          if (results[i].title === answer.role) {
            chosenRole = results[i];
          }
        }

        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: chosenRole.id,
          },
          (err) => {
            if (err) throw err;
            console.log(
              `New employee ${answer.firstName} ${answer.lastName} has been added as a ${answer.role}.`
            );
            startPrompt();
          }
        );
      });
  });
}

function updateEmp() {
  connection.query("SELECT * FROM employee, role", (err, results) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "rawlist",
          name: "employee",
          choices: () => {
            var choiceArray = [];
            for (let i = 0; i < results.length; i++) {
              choiceArray.push(results[i].last_name);
            }
            var cleanChoiceArray = [...new Set(choiceArray)];
            return cleanChoiceArray;
          },
          message: "Which employee would you like to update?",
        },
        {
          type: "rawlist",
          name: "role",
          choices: () => {
            var choiceArray = [];
            for (let i = 0; i < results.length; i++) {
              choiceArray.push(results[i].title);
            }
            var cleanChoiceArray = [...new Set(choiceArray)];
            return cleanChoiceArray;
          },
          message: "What is the employee's new role?",
        },
      ])
      .then((answer) => {
        var chosenEmp;
        var chosenRole;

        for (let i = 0; i < results.length; i++) {
          if (results[i].last_name === answer.employee) {
            chosenEmp = results[i];
          }
        }

        for (let i = 0; i < results.length; i++) {
          if (results[i].title === answer.role) {
            chosenRole = results[i];
          }
        }

        connection.query(
          "UPDATE employee SET ? WHERE ?",
          [
            {
              role_id: chosenRole,
            },
            {
              last_name: chosenEmp,
            },
          ],
          (err) => {
            if (err) throw err;
            console.log(`Employee's role has been updated.`);
            startPrompt();
          }
        );
      });
  });
}
