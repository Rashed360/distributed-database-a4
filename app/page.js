'use client'

import { useState, useTransition, useEffect } from 'react'
import {
	postgres_getEmployees,
	postgres_addEmployee,
	postgres_updateEmployee,
	postgres_deleteEmployee,
	mongo_getEmployees,
	mongo_addEmployee,
	mongo_updateEmployee,
	mongo_deleteEmployee,
} from './actions'

export default function App() {
	const [isPending, startTransition] = useTransition()

	const handleFetchData = () => {
		startTransition(async () => {
			const res1 = await postgres_getEmployees()
			const res2 = await mongo_getEmployees()
			console.log(res1, res2)
		})
	}

	useEffect(() => {
		handleFetchData()
	}, [])

	return <div>Hello World!</div>
}
