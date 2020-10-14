DROP DATABASE IF EXISTS employee_trackerDB;

CREATE DATABASE employee_trackerDB;

USE employee_trackerDB;

CREATE TABLE department(
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE role(
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT DEFAULT NULL,
  PRIMARY KEY (id)
);

INSERT INTO department (name)
VALUES ("IT"),
  ("HR"),
  ("Marketing"),
  ("Development Ops"),
  ("Admin");

INSERT INTO role (title, salary, department_id)
VALUES ("President", 50000, 5 ),
  ("CEO", 50000, 5),
  ("IT Director", 100000, 1),
  ("HR Director", 100000, 2),
  ("Marketing Director", 100000, 3),
  ("Dev Ops Director", 120000, 4),
  ("Recruiter", 60000, 2),
  ("Sys Administrator", 150000, 1),
  ("Associate", 60000, 3),
  ("Ninja", 0, 5),
  ("Junior Dev", 80000, 4),
  ("Senior Dev", 100000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Shakira","Moonbeam", 1, 0),
("Jack", "Johnson", 2,1),
("Dan","Rather",3, 1),
("Skip", "Noles", 4, 1),
("Susann", "Hixbee", 5, 1),
("Lisa", "Adolfson", 6, 1),
("Rambo", "Perkins", 7,4),
("Jimbo", "Taylor", 8, 3),
("Ramona", "Gatter", 8, 3),
("Hanna", "Rizz", 11,6),
("Don", "Won", 11, 6)

