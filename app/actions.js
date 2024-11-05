'use server'

import { Client } from 'pg'
import { MongoClient, ObjectId } from 'mongodb'

const postgres = new Client({ connectionString: process.env.POSTGRES_URL })
const mongodb = new MongoClient(process.env.MONGODB_URL)

export async function postgres_getEmployees() {
	await postgres.connect()
	const res = await postgres.query(`SELECT * FROM employees`)
	await postgres.close()
	return res.rows
}
export async function postgres_addEmployee(name, email, salary, active) {
	await postgres.connect()
	const res = await postgres.query(
		'INSERT INTO employees (name, email, salary, active) VALUES ($1, $2, $3, $4) RETURNING *',
		[name, email, salary, active]
	)
	await postgres.close()
	return res.rows[0]
}
export async function postgres_updateEmployee(id, name, email, salary, active) {}
export async function postgres_deleteEmployee(id) {
	await postgres.connect()
	const res = await postgres.query('DELETE FROM employees WHERE id = $1', [id])
	await postgres.close()
	return res.rows
}

export async function mongo_getEmployees() {
	await mongodb.connect()
	result = await mongodb.db('mydb').collection('employees').find({}).toArray()
	await mongodb.close()
	return result
}
export async function mongo_addEmployee(name, email, salary, active) {
	await mongodb.connect()
	result = await mongodb.db('mydb').collection('employees').insertOne({ name, email, salary, active })
	await mongodb.close()
	return result
}
export async function mongo_updateEmployee(id, name, email, salary, active) {
	await mongodb.connect()
	result = await mongodb
		.db('mydb')
		.collection('employees')
		.findOneAndUpdate(
			{ _id: new ObjectId(id) },
			{ $set: { name, email, salary, active } },
			{ returnDocument: 'after' }
		)
	await mongodb.close()
	return result
}
export async function mongo_deleteEmployee(id) {
	await mongodb.connect()
	result = await mongodb
		.db('mydb')
		.collection('employees')
		.findOneAndDelete({ _id: new ObjectId(id) })
	await mongodb.close()
	return result
}
