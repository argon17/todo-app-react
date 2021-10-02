import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import API_ENDPOINT from './config';

const client = new ApolloClient({
  uri: API_ENDPOINT,
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
