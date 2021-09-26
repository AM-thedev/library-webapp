 import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { EDIT_BORN } from '../queries'


const Authors = ({ show, setError, authors=[], token }) => {
  const [ name, setName] = useState('')
  const [ born, setBorn ] = useState('')

  const [ changeBorn, result ] = useMutation(EDIT_BORN)


  useEffect(() => {
    if (result.data && result.data.editBorn === null) {
      setError('Author not found.')
    }
  }, [result.data]) // eslint-disable-line

  const submit = (event) => {
    event.preventDefault()

    changeBorn({ variables: { name, born } })

    setName('')
    setBorn('')
  }


  if (!show) { return null }
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      {
        token ?
        <>
          <h2>Change birth year:</h2>
          <form onSubmit={submit}>
            <div>
              name <select onChange={({ target }) => setName(target.value)}>
                <option value=''>Please select</option>
                {authors.map(a =>
                  <option key={a.id}
                    value={a.name}
                  >{a.name}</option>  
                )}
              </select>
            </div>
            <div>
              born <input
                value={born}
                onChange={({ target }) => setBorn(parseInt(target.value))}
              />
            </div>
            <button type="submit">change year</button>
          </form>
        </>
        : null
      }
    </div>
  )
}

export default Authors