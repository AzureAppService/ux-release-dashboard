import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-boost";
import { initializeIcons } from "@uifabric/icons";

// Register icons and pull the fonts from the default SharePoint CDN:
initializeIcons();

const client = new ApolloClient({
  uri: 'https://graphqlv3.azurewebsites.net/graphql'
 // uri: "http://localhost:3000/graphql"
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
