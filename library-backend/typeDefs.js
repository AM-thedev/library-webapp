const { gql } = require('apollo-server-express')


module.exports = gql`

  type Mutation {

    addBook(
      title: String!
      author: String!
      published: Int
      genres: [String]!
    ): Book

    editBorn(
      name: String!
      born: Int!
    ): Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }

  type User {
    id: ID!
    username: String!
    favoriteGenre: String!
  }

  type Token {
    value: String!
  }

  type Author {
    id: ID!
    name: String!
    born: Int
    books: [Book!]!
    bookCount: Int!
  }

  type Book {
    id: ID!
    title: String!
    published: Int
    author: Author!
    genres: [String!]!
  }

  type Query {
    authorCount: Int!
    bookCount: Int!
    allAuthors: [Author!]!
    allBooks(author: String genre: String): [Book!]!
    findAuthor(name: String!): Author
    findBook(title: String!): Book
    me: User
  }

  type Subscription {
    bookAdded: Book!
  }
`