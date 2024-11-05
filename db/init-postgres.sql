CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    salary INT,
    active BOOLEAN
);

INSERT INTO employees (name, email, salary, active) VALUES
    ('Employee1', 'employee1@email.com', 49000, TRUE),
    ('Employee3', 'employee3@email.com', 51000, TRUE),
    ('Employee4', 'employee4@email.com', 50000, FALSE),
    ('Employee6', 'employee6@email.com', 45000, TRUE),
    ('Employee9', 'employee9@email.com', 52000, TRUE);
