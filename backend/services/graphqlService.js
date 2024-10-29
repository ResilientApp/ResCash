// services/transactionService.js
import pkg from "@apollo/client";
const { ApolloClient, InMemoryCache, gql } = pkg;
import fetch from "cross-fetch"; // Ensure cross-fetch is installed for server-side GraphQL requests

// Create an instance of ApolloClient
const client = new ApolloClient({
  uri: "http://100.64.166.61:8070/graphql", // Replace with .env URI!!!!!!
  // uri: process.env.GRAPHQL_URI,
  cache: new InMemoryCache(),
  fetch,
});

// Define the GraphQL query for fetching the public key
const GET_PUBLIC_KEY = gql`
  query GetPublicKey($id: ID!) {
    getTransaction(id: $id) {
      publicKey
    }
  }
`;

// Service function to get the public key
const getPublicKey = async (id) => {
  try {
    const response = await client.query({
      query: GET_PUBLIC_KEY,
      variables: { id }, // Pass the ID as a variable
    });
    return response.data.getTransaction.publicKey; // Return the public key
  } catch (error) {
    console.error("Error fetching public key:", error);
    throw new Error("Could not fetch public key");
  }
};

export default getPublicKey;
