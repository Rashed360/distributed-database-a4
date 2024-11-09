'use server'

import { Pool } from 'pg'
import { MongoClient, ObjectId } from 'mongodb'

const postgres = new Pool({ connectionString: process.env.POSTGRES_URL })
const mongodb = new MongoClient(process.env.MONGODB_URL)

const sanitizedResponse = res => JSON.parse(JSON.stringify(res))

export async function postgres_getEmployees() {
	const res = await postgres.query(`SELECT * FROM employees`)
	return res.rows
}
export async function postgres_addEmployee(values = { name: '', email: '', salary: '', active: '' }) {
	const res = await postgres.query(
		'INSERT INTO employees (name, email, salary, active) VALUES ($1, $2, $3, $4) RETURNING *',
		[values.name, values.email, values.salary, values.active]
	)
	return res.rows[0]
}
export async function postgres_updateEmployee(id, values = { name: '', email: '', salary: '', active: '' }) {
	const res = await postgres.query(
		'UPDATE employees SET name = $1, email = $2, salary = $3, active = $4 WHERE id = $5',
		[values.name, values.email, values.salary, values.active, id]
	)
	return res.rows
}
export async function postgres_deleteEmployee(id) {
	const res = await postgres.query('DELETE FROM employees WHERE id = $1', [id])
	return res.rows
}

export async function mongo_getEmployees() {
	await mongodb.connect()
	const result = await mongodb.db('mydb').collection('employees').find({}).toArray()
	await mongodb.close()
	return sanitizedResponse(result)
}
export async function mongo_addEmployee(values = { name: '', email: '', salary: '', active: '' }) {
	await mongodb.connect()
	const result = await mongodb.db('mydb').collection('employees').insertOne(values)
	await mongodb.close()
	return sanitizedResponse(result)
}
export async function mongo_updateEmployee(id, values = { name: '', email: '', salary: '', active: '' }) {
	await mongodb.connect()
	const result = await mongodb
		.db('mydb')
		.collection('employees')
		.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: values }, { returnDocument: 'after' })
	await mongodb.close()
	return sanitizedResponse(result)
}
export async function mongo_deleteEmployee(id) {
	await mongodb.connect()
	const result = await mongodb
		.db('mydb')
		.collection('employees')
		.findOneAndDelete({ _id: new ObjectId(id) })
	await mongodb.close()
	return sanitizedResponse(result)
}
