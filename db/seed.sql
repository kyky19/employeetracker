USE tracker_db;

INSERT INTO department(department_id, department_name)
VALUES(1, "Sales"),
      (2, "Engineering"),
      (3, "Finance"),
      (4, "Legal");

INSERT INTO role(role_id, title, department_id, salary)
VALUES(1, "Sales Lead", 1, 125000),
      (2, "Salesperson", 1, 75000),
      (3, "Lead Engineer", 2, 150000),
      (4, "Software Engineer", 2, 120000),
      (5, "Account Manager", 3, 150000),
      (6, "Accountant", 3, 120000),
      (7, "Legal Team Lead", 4, 300000),
      (8, "Lawyer", 4, 200000);

INSERT INTO employee(employee_id, first_name, last_name, role_id, manager_id)
VALUES(1, "Kyle", "Lane", 1, null),
      (2, "Savannah", "Lane", 2, 1),
      (3, "Vlad", "Stoiculescu", 3, null),
      (4, "Victor", "Pollock", 4, 3),
      (5, "Cameron", "Lusk", 5, null),
      (6, "Asia", "Jolly", 6, 5),
      (7, "Jacob", "Babb", 7, null),
      (8, "Justin", "Hendrick", 8, 7);