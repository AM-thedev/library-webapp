import React from 'react'
import { useQuery } from '@apollo/client'
import { ME } from '../queries'


const Recommended = ({ show, books }) => {
  const user = useQuery(ME)

  if (!show) { return null }

  if (user.loading) { return <div>loading...</div> }

  const recommendedBooks = books.filter(b => 
    b.genres.includes(user.data.me.favoriteGenre)  
  )
  
  return (
    <div>
      <h2>Recommendations</h2>
      <p>Some books based on your favorite genre: <strong>{user.data.me.favoriteGenre}</strong></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {recommendedBooks.map(b =>
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended