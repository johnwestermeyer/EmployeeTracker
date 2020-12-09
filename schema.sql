DROP DATABASE IF EXISTS employees_DB;
CREATE DATABASE employees_DB;
USE employees_DB;
CREATE TABLE department(
	id INT AUTO_INCREMENT,
    name VARCHAR(30),
    PRIMARY KEY (id)
);
CREATE TABLE role(
	id INT AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    PRIMARY KEY (id)
);
CREATE TABLE employee(
	id INT AUTO_INCREMENT,
    first_name VARCHAR(30),
	last_name VARCHAR(30),
    role_id INT,
    manager_id INT,	
    PRIMARY KEY (id)
);

INSERT INTO department(name)
VALUES ("Management");
INSERT INTO role(title,salary,department_id)
VALUES ("Manager",30000,1);
INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES ("Michael","Scott",1,1);