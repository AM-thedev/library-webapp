import React, { useState } from 'react'
import { useApolloClient, useQuery, useSubscription } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED } from './queries'
import LoginForm from './components/LoginForm'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Recommended from './components/Recommended'
import Notify from './components/Notify'


const App = () => {
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const loading = authors.loading || books.loading
  const client = useApolloClient()
  

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
      set.map(b => b.id).includes(object.id)  

    const booksInStore = client.readQuery({ query: ALL_BOOKS })
    const authorsInStore = client.readQuery({ query: ALL_AUTHORS })
    if (!includedIn(booksInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks : booksInStore.allBooks.concat(addedBook) }
      })
    }
    if (!includedIn(authorsInStore.allAuthors, addedBook.author)) {
      client.writeQuery({
        query: ALL_AUTHORS,
        data: { allAuthors: authorsInStore.allAuthors.concat(addedBook.author) }
      })
    }
  }
  
  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      updateCacheWith(addedBook)
      window.alert(`New Book "${addedBook.title}" added.`)
    }
  })

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5*1000)
  }

  if (loading) {
    return <div>loading...</div>
  }
  else {
    console.log(authors.data.allAuthors, books.data.allBooks)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }


  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {
          !token
            ? <button onClick={() => setPage('login')}>login</button>
            : <>
                <button onClick={() => setPage('recommended')}>recommended</button>
                <button onClick={() => setPage('add')}>add book</button>
                <button onClick={() => logout()}>logout</button>
              </>
        }
      </div>
      <Notify errorMessage={errorMessage} />

      <Authors
        show={page === 'authors'} setError={notify} authors={authors.data.allAuthors} token={token}
      />

      <Books
        show={page === 'books'} totalBooks={books.data.allBooks}
      />

      <Recommended
        show={page === 'recommended'} books={books.data.allBooks}
      />

      <NewBook
        show={page === 'add'} setError={notify}
      />

      <LoginForm
        show={page === 'login'} setError={notify} setToken={setToken} setPage={setPage}
      />

    </div>
  )
}

export default App