const mysql2 = require("mysql2");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
require("dotenv").config();
const figlet = require("figlet");
let depts = [];
let roles = [];
let employees = [];
let managers = [];

var envaccess = mysql2.createConnection({
  host: "localhost",
  port: 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

figlet("Employee\nManager", function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
});

envaccess.connect(function (err) {
  init();
});

const userChoices = [
  {
    type: "list",
    name: "data",
    message: "What would you like to do?",
    choices: [
      "View All Employees",
      "Add Employee",
      "Update Employee Role",
      "View All Roles",
      "Add Role",
      "View All Departments",
      "Add Department",
      "Update Employee Manager",
      "View Employees By Manager",
      "View Employees By Department",
      "Delete Department",
      "Delete Role",
      "Delete Employee",
      "View Department Budget",
      "Quit",
    ],
  },
];

function init() {
  inquirer.prompt(userChoices).then((answer) => {
    switch (answer.data) {
      case "View All Employees":
        viewAllEmployees();
        break;
      case "Add Employee":
        addEmployee();
        break;
      case "Update Employee Role":
        updateEmployeeRole();
        break;
      case "View All Roles":
        viewAllRoles();
        break;
      case "Add Role":
        addRole();
        break;
      case "View All Departments":
        viewAllDepartments();
        break;
      case "Add Department":
        addDepartment();
        break;
      case "Update Employee Manager":
        updateEmployeeManager();
        break;
      case "View Employees By Manager":
        viewEmployeesByManager();
        break;
      case "View Employees By Department":
        viewEmployeesByDepartment();
        break;
      case "Delete Department":
        deleteDepartment();
        break;
      case "Delete Role":
        deleteRole();
        break;
      case "Delete Employee":
        deleteEmployee();
        break;
      case "View Department Budget":
        viewDepartmentBudget();
        break;
      case "Quit":
        envaccess.end();
        break;
      default:
        envaccess.end();
    }
  });
  updateDepartments();
  updateRoles();
  updateManagers();
}

function updateDepartments() {
  envaccess.query(
    `SELECT department_name FROM department`,
    function (err, data) {
      if (err) throw err;
      depts = [];
      for (i = 0; i < data.length; i++) {
        depts.push(data[i].department_name);
      }
    }
  );
}

function updateRoles() {
  envaccess.query(`SELECT title FROM role`, function (err, data) {
    if (err) throw err;
    roles = [];
    for (i = 0; i < data.length; i++) {
      roles.push(data[i].title);
    }
  });
}

function updateManagers() {
  envaccess.query(
    `SELECT employee.last_name FROM employee`,
    function (err, data) {
      if (err) throw err;
      employees = [];
      for (i = 0; i < data.length; i++) {
        managers.push(data[i].last_name);
      }
    }
  );
}

function viewAllEmployees() {
  envaccess.query(
    `SELECT employee.employee_id, employee.first_name, employee.last_name, role.title, department.department_name AS department,role.salary,CONCAT(a.first_name, " ", a.last_name) AS manager FROM employee
    LEFT JOIN role ON employee.role_id = role.role_id
    LEFT JOIN department ON role.department_id = department.department_id
    LEFT JOIN employee a ON a.employee_id = employee.manager_id`,
    function (err, data) {
      if (err) throw err;
      console.table(data);
      init();
    }
  );
}

function addEmployee() {
  envaccess.query("SELECT * FROM role", function (err, answer) {
    if (err) throw err;
    envaccess.query("SELECT * FROM employee", function (err, userData) {
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "first_name",
            type: "input",
            message: "What is the employee's first name?",
          },
          {
            name: "last_name",
            type: "input",
            message: "What is the employee's last name?",
          },
          {
            name: "role",
            type: "list",
            message: "What is the employee's role?",
            choices: roles,
          },
          {
            name: "manager",
            type: "list",
            message: "Who is the employee's manager?",
            choices: managers,
          },
        ])
        .then(function (data) {
          let roleID;
          for (let x = 0; x < answer.length; x++) {
            if (answer[x].title == data.role) {
              roleID = answer[x].role_id;
            }
          }
          let managerID;
          for (let y = 0; y < userData.length; y++) {
            if (userData[y].last_name == data.managerName) {
              managerID = userData[y].employee_id;
            }
          }
          envaccess.query(
            "INSERT INTO employee SET ?",
            {
              first_name: data.first_name,
              last_name: data.last_name,
              role_id: roleID,
              manager_id: managerID,
            },
            function (err) {
              if (err) throw err;
            }
          );
          init();
        });
    });
  });
}

function updateEmployeeRole() {
  envaccess.query(
    `SELECT concat(employee.first_name, ' ' ,  employee.last_name) AS Name FROM employee`,
    function (err, data) {
      if (err) throw err;
      employees = [];
      for (i = 0; i < data.length; i++) {
        employees.push(data[i].Name);
      }
      envaccess.query("SELECT * FROM role", function (err, answer) {
        if (err) throw err;
        inquirer
          .prompt([
            {
              name: "updateEmployee",
              type: "list",
              message: "Which employee's role do you want to update?",
              choices: employees,
            },
            {
              name: "newRole",
              type: "list",
              message:
                "Which role do you want to assign the selected employee?",
              choices: roles,
            },
          ])
          .then(function (data) {
            let roleID;
            for (let x = 0; x < answer.length; x++) {
              if (answer[x].title == data.newRole) {
                roleID = answer[x].role_id;
              }
            }
            envaccess.query(
              `UPDATE employee SET role_id = ? WHERE employee_id = (SELECT employee_id FROM(SELECT employee_id FROM employee WHERE CONCAT(first_name," ",last_name) = ?)AS NAME)`,
              [roleID, data.updateEmployee],
              function (err) {
                if (err) throw err;
              }
            );
            init();
          });
      });
    }
  );
}

function viewAllRoles() {
  envaccess.query(`SELECT * FROM role`, function (err, data) {
    if (err) throw err;
    console.table(data);
    init();
  });
}

function addRole() {
  envaccess.query("SELECT * FROM department", function (err, answer) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What is the name of the role?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary of the role?",
        },
        {
          name: "departmentName",
          type: "list",
          message: "Which department does the role belong to?",
          choices: depts,
        },
      ])
      .then(function (data) {
        let deptID;
        for (let x = 0; x < answer.length; x++) {
          if (answer[x].department_name == data.departmentName) {
            deptID = answer[x].department_id;
          }
        }
        envaccess.query(
          "INSERT INTO role SET ?",
          {
            title: data.title,
            salary: data.salary,
            department_id: deptID,
          },
          function (err) {
            if (err) throw err;
          }
        );
        init();
      });
  });
}

function viewAllDepartments() {
  envaccess.query(`SELECT * FROM department`, function (err, data) {
    if (err) throw err;
    console.table(data);
    init();
  });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        name: "department",
        type: "input",
        message: "What is the name of the department?",
      },
    ])
    .then(function (data) {
      envaccess.query(
        "INSERT INTO department SET ?",
        {
          department_name: data.department,
        },
        function (err) {
          if (err) throw err;
        }
      );
      init();
    });
}

function updateEmployeeManager() {
  envaccess.query(`SELECT * FROM employee;`, (err, data) => {
    if (err) throw err;
    let employees = data.map((employee) => ({
      name: employee.first_name + " " + employee.last_name,
      value: employee.employee_id,
    }));
    inquirer
      .prompt([
        {
          name: "updatedEmployee",
          type: "list",
          message: "Which employee is getting a new manager?",
          choices: employees,
        },
        {
          name: "newManager",
          type: "list",
          message: "Who should be the employee's new manager?",
          choices: employees,
        },
      ])
      .then((answer) => {
        envaccess.query(
          `UPDATE employee SET ? WHERE ?`,
          [
            {
              manager_id: answer.newManager,
            },
            {
              employee_id: answer.updatedEmployee,
            },
          ],
          (err, res) => {
            if (err) throw err;
            init();
          }
        );
      });
  });
}

function viewEmployeesByManager() {
  envaccess.query(
    `SELECT employee_id, first_name, last_name FROM employee;`,
    (err, data) => {
      if (err) throw err;
      let managers = data.map((employee) => ({
        name: employee.first_name + " " + employee.last_name,
        value: employee.employee_id,
      }));
      inquirer
        .prompt([
          {
            name: "manager",
            type: "list",
            message: "Which manager would you like to see the employee's of?",
            choices: managers,
          },
        ])
        .then((response) => {
          envaccess.query(
            `SELECT e.first_name, e.last_name, e.employee_id, role.title, department.department_name, role.salary, CONCAT(m.first_name, ' ', m.last_name) manager FROM employee m RIGHT JOIN employee e ON e.manager_id = m.employee_id JOIN role ON e.role_id = role.role_id JOIN department ON department.department_id = role.department_id WHERE e.manager_id = ${response.manager};`,
            (err, data) => {
              if (err) throw err;
              console.table(data);
              init();
            }
          );
        });
    }
  );
}

function viewEmployeesByDepartment() {
  envaccess.query(
    `SELECT employee.employee_id, employee.first_name, employee.last_name, department.department_name FROM employee LEFT JOIN role ON employee.role_id = role.role_id LEFT JOIN department ON role.department_id = department.department_id ORDER BY employee.employee_id`,
    function (err, data) {
      if (err) throw err;
      console.table(data);
      init();
    }
  );
}

function deleteDepartment() {
  envaccess.query(
    `SELECT * FROM department ORDER BY department_id ASC;`,
    (err, data) => {
      if (err) throw err;
      let departments = data.map((department) => ({
        name: department.department_name,
        value: department.department_id,
      }));
      inquirer
        .prompt([
          {
            name: "department",
            type: "list",
            message: "Which department are you deleting?",
            choices: departments,
          },
        ])
        .then((answer) => {
          envaccess.query(
            `DELETE FROM department WHERE ?`,
            [
              {
                department_id: answer.department,
              },
            ],
            (err, data) => {
              if (err) throw err;
              init();
            }
          );
        });
    }
  );
}

function deleteRole() {
  envaccess.query(`SELECT * FROM role ORDER BY role_id ASC;`, (err, data) => {
    if (err) throw err;
    let roles = data.map((role) => ({ name: role.title, value: role.role_id }));
    inquirer
      .prompt([
        {
          name: "role",
          type: "list",
          message: "Which role are you deleting?",
          choices: roles,
        },
      ])
      .then((answer) => {
        envaccess.query(
          `DELETE FROM role WHERE ?`,
          [
            {
              role_id: answer.role,
            },
          ],
          (err, data) => {
            if (err) throw err;
            init();
          }
        );
      });
  });
}

function deleteEmployee() {
  envaccess.query(
    `SELECT * FROM employee ORDER BY employee_id ASC;`,
    (err, data) => {
      if (err) throw err;
      let employees = data.map((employee) => ({
        name: employee.first_name + " " + employee.last_name,
        value: employee.employee_id,
      }));
      inquirer
        .prompt([
          {
            name: "employee",
            type: "list",
            message: "Which employee are you deleting?",
            choices: employees,
          },
        ])
        .then((answer) => {
          envaccess.query(
            `DELETE FROM employee WHERE ?`,
            [
              {
                employee_id: answer.employee,
              },
            ],
            (err, data) => {
              if (err) throw err;
              init();
            }
          );
        });
    }
  );
}

function viewDepartmentBudget() {
  envaccess.query(
    `SELECT * FROM department ORDER BY department_id ASC;`,
    (err, data) => {
      if (err) throw err;
      let departments = data.map((department) => ({
        name: department.department_name,
        value: department.department_id,
      }));
      inquirer
        .prompt([
          {
            name: "department",
            type: "list",
            message: "Which department would you like to view the salary of?",
            choices: departments,
          },
        ])
        .then((answer) => {
          envaccess.query(
            `SELECT department_id, SUM(role.salary) AS total_salary FROM role WHERE ?`,
            [
              {
                department_id: answer.department,
              },
            ],
            (err, data) => {
              if (err) throw err;
              console.table(data);
              init();
            }
          );
        });
    }
  );
}
