import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'


const Books = ({ show, totalBooks }) => {
  const [books, setBooks] = useState([])
  const [genre, setGenre] = useState("")
  const [genresList, setGenresList] = useState([])
  const [getBooks, { loading }] = useLazyQuery(ALL_BOOKS, {
    onCompleted: data => setBooks(data.allBooks),
    fetchPolicy: 'no-cache'
  })
  
  //initialize the page
  //goes through all the books
  totalBooks.map(b =>
    //goes through all the genresList in that book
    b.genres.map(g =>
        //does the genre list already have that genre?
        genresList.includes(g) ?
        // yes? skip
        null :
        // no? add it to the array of genresList
        setGenresList([ ...genresList, g ])
    )
  )
  //sets the initial books list to all of the books
  useEffect(() => {
    setBooks(totalBooks)
  }, [show]) // eslint-disable-line
  
  useEffect(() => {
    getBooks({ variables: { genre } });
  }, [genre]) // eslint-disable-line

  
  if (!show) { return null }
  if (loading) { return <div>loading...</div> }
  return (
    <div>
      <h2>books</h2>
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
          {books.map(a =>
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <button onClick={() => setGenre("")}>all</button>
      {genresList.map(g =>
        //bug? onClick={() => getBooks({ variables: { g } })} will NOT work
        <button key={g} onClick={() => setGenre(g)}>{g}</button>  
      )}
    </div>
  )
}

export default Books