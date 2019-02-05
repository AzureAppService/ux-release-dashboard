import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({
  uri: 'https://graphqlv3.azurewebsites.net/graphql',
  //uri: 'http://localhost:3000/graphql',
});

ReactDOM.render(
  <ApolloProvider client={client}>  
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);
