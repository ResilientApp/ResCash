// src/components/CreateUser.tsx
import React from "react";
import { gql, useMutation } from "@apollo/client";

// Define the mutation
const CREATE_USER_MUTATION = gql`
  mutation CreateUser {
    generateKeys {
      privateKey
      publicKey
    }
  }
`;

// Define types for the mutation result and variables
interface GenerateKeysData {
  generateKeys: {
    privateKey: string;
    publicKey: string;
  };
}

const CreateUser: React.FC = () => {
  // useMutation with type inference for the data
  const [createUser, { data, loading, error }] =
    useMutation<GenerateKeysData>(CREATE_USER_MUTATION);

  const handleCreateUser = async () => {
    try {
      const response = await createUser();
      console.log("Keys generated:", response.data?.generateKeys);
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  return (
    <div>
      <button onClick={handleCreateUser}>Generate Keys</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div>
          <p>Private Key: {data.generateKeys.privateKey}</p>
          <p>Public Key: {data.generateKeys.publicKey}</p>
        </div>
      )}
    </div>
  );
};

export default CreateUser;
