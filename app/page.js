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
	const [postgresData, setPostgresData] = useState(null)
	const [mongoDBData, setMongoDBData] = useState(null)
	const [isPostgresPending, startPostgresTransition] = useTransition()
	const [isMongoDBPending, startMongoDBTransition] = useTransition()
	const [formState, setFormState] = useState({ isEditing: false, currentDB: 'Postgres' })
	const [tabs, setTabs] = useState({
		active: 0,
		list: ['Postgres', 'MongoDB', 'Join DBs', formState.isEditing ? 'Update' : 'Add New'],
	})
	const [inputs, setInputs] = useState({ pk: '', name: '', email: '', salary: '', active: false })
	const onInputChange = e => setInputs({ ...inputs, [e.target.name]: e.target.value })

	const fetchPostgresData = () => {
		if (postgresData) return
		startPostgresTransition(async () => {
			const res = await postgres_getEmployees()
			setPostgresData(res)
		})
	}

	const fetchMongoDBData = () => {
		if (mongoDBData) return
		startMongoDBTransition(async () => {
			const res = await mongo_getEmployees()
			setMongoDBData(res)
		})
	}

	useEffect(() => fetchMongoDBData(), [postgresData])
	useEffect(() => fetchPostgresData(), [mongoDBData])

	const renderTable = tableData => {
		if (tableData) {
			if (tableData.length === 0) return <p>No Entries</p>
			return (
				<table className='w-full table-auto border-collapse border border-gray-300'>
					<thead>
						<tr>
							{Object.keys(tableData[0]).map(column => (
								<th className='capitalize border border-gray-300 bg-gray-50' key={column}>
									{column}
								</th>
							))}
							<th className='capitalize border border-gray-300 bg-gray-50'></th>
						</tr>
					</thead>
					<tbody>
						{tableData.map((row, idx) => (
							<tr key={idx}>
								{Object.keys(tableData[0]).map(column => (
									<td className='p-1 border border-gray-300 bg-gray-50' key={column}>
										{column === 'id' || column === '_id' ? (row.id ? row.id : row._id) : row[column]}
									</td>
								))}
								<td className='py-1 border border-gray-300 bg-gray-50'>E D</td>
							</tr>
						))}
					</tbody>
				</table>
			)
		} else return <p>Loading...</p>
	}

	const onCreate = e => {
		e.preventDefault()
		console.log({ DB: formState.currentDB, ...inputs })
	}

	const onUpdate = e => {
		e.preventDefault()
		console.log({ DB: formState.currentDB, ...inputs })
	}

	const onDelete = () => {
		console.log({ DB: formState.currentDB, ...inputs })
	}

	return (
		<div className='mt-4 min-w-[800px] min-h-96 rounded-xl bg-white overflow-hidden shadow-xl'>
			<h1 className='py-3 border-b border-gray-300 text-center text-lg font-bold'>SQL NoSQL Databases</h1>
			<div className='h-full grid grid-cols-9'>
				<div className='col-span-2 flex flex-col border-r border-gray-300'>
					{tabs.list.map((tab, key) => (
						<button
							key={key}
							className={`p-2 border-b transition ${
								tabs.active === key ? 'bg-gray-100' : 'bg-transparent hover:bg-gray-200'
							}`}
							onClick={() => {
								setTabs({ ...tabs, active: key })
								if (key < 2) setFormState({ currentDB: tab })
							}}
						>
							{tab}
						</button>
					))}
				</div>
				<div className='col-span-7 p-4'>
					{tabs.active === 0 ? (
						renderTable(postgresData)
					) : tabs.active === 1 ? (
						renderTable(mongoDBData)
					) : tabs.active === 2 ? (
						renderTable(
							postgresData && mongoDBData && [...postgresData, ...mongoDBData].sort((a, b) => a.name - b.name)
						)
					) : (
						<div className='flex flex-col gap-2 select-none'>
							<p>Add New Employee</p>
							<select
								className='px-2 py-1 border rounded outline-none'
								value={formState.currentDB}
								onChange={e => setFormState({ ...formState, currentDB: e.target.value })}
							>
								<option value='Postgres'>Postgres - SQL</option>
								<option value='MongoDB'>MongoDB - NoSQL</option>
							</select>
							<input
								className='px-2 py-1 border rounded outline-none'
								name='name'
								value={inputs.name}
								onChange={onInputChange}
								type='text'
								placeholder='Name'
							/>
							<input
								className='px-2 py-1 border rounded outline-none'
								name='email'
								value={inputs.email}
								onChange={onInputChange}
								type='email'
								placeholder='Email'
							/>
							<input
								className='px-2 py-1 border rounded outline-none'
								name='salary'
								value={inputs.salary}
								onChange={onInputChange}
								type='number'
								placeholder='Salary'
							/>
							<div className='px-2 flex gap-2'>
								<input
									checked={inputs.active}
									onChange={e => setInputs({ ...inputs, active: !inputs.active })}
									id='active'
									type='checkbox'
								/>
								<label htmlFor='active'>{inputs.active ? '' : 'Not'} Active</label>
							</div>
							<div className='flex gap-2'>
								<button
									onClick={formState.isEditing ? onUpdate : onCreate}
									className='py-2 px-4 border rounded text-white bg-gray-600 hover:bg-gray-500'
								>
									{formState.isEditing ? 'Update' : 'Create'} Employee
								</button>
								<button
									onClick={() => {
										setInputs({ pk: '', name: '', email: '', salary: '', active: false })
										if (!formState.isEditing) return
										setFormState({ isEditing: false })
									}}
									className='py-2 px-4 border rounded bg-red-200 hover:bg-red-100'
								>
									{formState.isEditing ? 'Cancel' : 'Reset'}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

// renderTable(tabs.list[tabs.active].data)
