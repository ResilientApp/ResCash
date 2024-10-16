import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider, InMemoryCache, ApolloClient } from "@apollo/client"; // Import necessary Apollo components
import App from "./App";
import "./index.css";

// Set up Apollo Client
const client = new ApolloClient({
  uri: "https://resdb.quiet98k.com/graphql", // Replace with your GraphQL server endpoint
  cache: new InMemoryCache(),
});

// Fetch the root element from the DOM
const rootElement = document.getElementById("root");

// Ensure the root element exists before attempting to render
if (!rootElement) {
  throw new Error(
    "Root element not found. Make sure your HTML has a div with id='root'."
  );
}

// Create a root and render the application, wrapped in ApolloProvider for GraphQL support
createRoot(rootElement).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
);
