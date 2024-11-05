db = db.getSiblingDB('mydb')

db.createCollection('employees')
db.employees.insertMany([
	{ name: 'Employee2', email: 'employee2@email.com', salary: 54000, active: true },
	{ name: 'Employee5', email: 'employee5@email.com', salary: 54000, active: true },
	{ name: 'Employee7', email: 'employee7@email.com', salary: 51000, active: true },
	{ name: 'Employee8', email: 'employee8@email.com', salary: 48000, active: false },
	{ name: 'Employee10', email: 'employee10@email.com', salary: 53000, active: false },
])
