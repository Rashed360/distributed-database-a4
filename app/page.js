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
	const tabsList = ['🛢️ Postgres', '🗃️ MongoDB', '🔗 Joined']
	const [activeTab, setActiveTab] = useState(0)
	const [appState, setAppState] = useState({ isEditing: false, currentDB: tabsList[0] })
	const [data, setData] = useState({
		[tabsList[0]]: null,
		[tabsList[1]]: null,
		[tabsList[3]]: null,
	})
	const [isPostgresPending, startPostgresTransition] = useTransition()
	const [isMongoDBPending, startMongoDBTransition] = useTransition()
	const initialInputs = { pk: '', name: '', email: '', salary: '', active: false }
	const [inputs, setInputs] = useState(initialInputs)
	const onInputChange = e => setInputs({ ...inputs, [e.target.name]: e.target.value })

	const fetchPostgresData = () => {
		startPostgresTransition(async () => {
			const res = await postgres_getEmployees()
			setData({ ...data, [tabsList[0]]: res })
		})
	}

	const fetchMongoDBData = () => {
		startMongoDBTransition(async () => {
			const res = await mongo_getEmployees()
			setData({ ...data, [tabsList[1]]: res })
		})
	}

	useEffect(() => {
		switch (appState.currentDB) {
			case tabsList[0]:
				if (data[tabsList[0]]) return
				fetchPostgresData()
				break
			case tabsList[1]:
				if (data[tabsList[1]]) return
				fetchMongoDBData()
				break
			case tabsList[2]:
				if (!data[tabsList[0]]) fetchPostgresData()
				if (!data[tabsList[1]]) fetchMongoDBData()
		}
	}, [appState, data])

	useEffect(() => {
		if (!data[tabsList[2]] && data[tabsList[1]] && data[tabsList[0]]) {
			setData({ ...data, [tabsList[2]]: [...data[tabsList[0]], ...data[tabsList[1]]] })
		}
	}, [data])

	const onCreate = () => {
		const { pk, ...values } = inputs
		switch (appState.currentDB) {
			case tabsList[0]:
				postgres_addEmployee(values)
				fetchPostgresData()
				setActiveTab(0)
				setInputs(initialInputs)
				break
			case tabsList[1]:
				mongo_addEmployee(values)
				fetchMongoDBData()
				setActiveTab(1)
				setInputs(initialInputs)
				break
			case tabsList[2]:
				// TODO: Choose random 0/1, call onCreate() again
				break
		}
	}

	const onUpdate = e => {
		console.log({ DB: appState.currentDB, ...inputs })
	}

	const onDelete = id => {
		switch (appState.currentDB) {
			case tabsList[0]:
				postgres_deleteEmployee(id)
				fetchPostgresData()
				break
			case tabsList[1]:
				mongo_deleteEmployee(id)
				fetchMongoDBData()
				break
		}
	}

	const renderTable = () => {
		if (data[tabsList[activeTab]]) {
			if (data[tabsList[activeTab]].length === 0) return <p>No Entries</p>
			return (
				<table className='w-full table-auto border-collapse border border-gray-300'>
					<thead>
						<tr>
							{['Id', 'Name', 'Email', 'Salary', 'Active', 'Action'].map(head => (
								<th className='border border-gray-300 bg-gray-50' key={head}>
									{head}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data[tabsList[activeTab]].map((row, idx) => (
							<tr key={idx}>
								<td className='py-1 border border-gray-300 bg-gray-50'>{row.id ? row.id : row._id}</td>
								<td className='py-1 border border-gray-300 bg-gray-50'>{row.name}</td>
								<td className='py-1 border border-gray-300 bg-gray-50'>{row.email}</td>
								<td className='py-1 border border-gray-300 bg-gray-50'>{row.salary}</td>
								<td className='py-1 border border-gray-300 bg-gray-50'>{row.active ? 'Yes' : 'No'}</td>
								<td className='py-1 border border-gray-300 bg-gray-50 text-center'>
									<button onClick={() => {}} className='opacity-80 hover:opacity-100'>
										📝
									</button>
									<button
										onClick={() => onDelete(row.id ? row.id : row._id)}
										className='opacity-80 hover:opacity-100'
									>
										🗑️
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)
		} else
			return (
				<p>
					{isPostgresPending ? ' Postgres Loading...' : ''}
					{isMongoDBPending ? ' MongoDB Loading...' : ''}
				</p>
			)
	}

	return (
		<div className='mt-4 min-w-[800px] min-h-96 rounded-xl bg-white overflow-hidden shadow-xl'>
			<h1 className='py-3 border-b border-gray-300 text-center text-lg font-bold'>
				🛢️🗃️ SQL NoSQL Databases
			</h1>
			<div className='h-full flex'>
				<div className='flex flex-col border-r border-gray-300'>
					{tabsList.map((tab, key) => (
						<button
							key={key}
							className={`p-2 min-w-32 border-b text-left transition ${
								activeTab === key ? 'font-bold bg-gray-100' : 'bg-transparent hover:bg-gray-200'
							}`}
							onClick={() => {
								setActiveTab(key)
								setAppState({ currentDB: tab })
							}}
						>
							{tab}
						</button>
					))}
					<button
						className={`p-2 min-w-32 border-b text-left transition ${
							activeTab === 3 ? 'font-bold bg-gray-100' : 'bg-transparent hover:bg-gray-200'
						}`}
						onClick={() => setActiveTab(3)}
					>
						{appState.isEditing ? '📝 Update' : '➕ Add New'}
					</button>
				</div>
				<div className='flex-1 p-4'>
					{activeTab < 3 ? (
						renderTable()
					) : (
						<div className='flex flex-col gap-2 select-none'>
							<p>{appState.isEditing ? 'Update' : 'Add New'} Employee</p>
							<select
								className='px-2 py-1 border rounded outline-none disabled:opacity-50'
								value={appState.currentDB}
								onChange={e => setAppState({ ...appState, currentDB: e.target.value })}
								disabled={appState.isEditing}
							>
								<option value={tabsList[0]}>Postgres - SQL</option>
								<option value={tabsList[1]}>MongoDB - NoSQL</option>
								<option value={tabsList[2]}>Random - AnyDB</option>
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
									onClick={appState.isEditing ? onUpdate : onCreate}
									className='py-2 px-4 border rounded text-white bg-gray-600 hover:bg-gray-500 disabled:bg-gray-300'
									disabled={!inputs.name || !inputs.email || !inputs.salary}
								>
									{appState.isEditing ? 'Update' : 'Create'} Employee
								</button>
								<button
									onClick={() => {
										setInputs(initialInputs)
										if (!appState.isEditing) return
										setAppState({ isEditing: false })
										setActiveTab(tabsList.indexOf(appState.currentDB))
									}}
									className='py-2 px-4 border rounded bg-red-200 hover:bg-red-100'
								>
									{appState.isEditing ? 'Cancel' : 'Reset'}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
