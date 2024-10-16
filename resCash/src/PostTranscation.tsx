import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";

// Define the GraphQL mutation
const POST_TRANSACTION_MUTATION = gql`
  mutation PostTransaction(
    $operation: String!
    $amount: Int!
    $signerPublicKey: String!
    $signerPrivateKey: String!
    $recipientPublicKey: String!
    $asset: String!
  ) {
    postTransaction(
      data: {
        operation: $operation
        amount: $amount
        signerPublicKey: $signerPublicKey
        signerPrivateKey: $signerPrivateKey
        recipientPublicKey: $recipientPublicKey
        asset: $asset
      }
    ) {
      id
    }
  }
`;

const PostTransaction: React.FC = () => {
  // Define state for each field in the form
  const [operation, setOperation] = useState("CREATE"); // Default to "CREATE"
  const [amount, setAmount] = useState(50); // Default to 50
  const [signerPublicKey, setSignerPublicKey] = useState("");
  const [signerPrivateKey, setSignerPrivateKey] = useState("");
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  const [assetData, setAssetData] = useState(
    '{"data": {"time": 1690881023169}}'
  ); // Default asset structure as string

  // Use the Apollo useMutation hook
  const [postTransaction, { data, loading, error }] = useMutation(
    POST_TRANSACTION_MUTATION
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await postTransaction({
        variables: {
          operation,
          amount,
          signerPublicKey,
          signerPrivateKey,
          recipientPublicKey,
          asset: assetData,
        },
      });
      alert("Transaction posted successfully");
    } catch (err) {
      console.error("Error posting transaction:", err);
    }
  };

  if (loading) return <p>Posting transaction...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Post a Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Operation:</label>
          <input
            type="text"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Signer Public Key:</label>
          <input
            type="text"
            value={signerPublicKey}
            onChange={(e) => setSignerPublicKey(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Signer Private Key:</label>
          <input
            type="text"
            value={signerPrivateKey}
            onChange={(e) => setSignerPrivateKey(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Recipient Public Key:</label>
          <input
            type="text"
            value={recipientPublicKey}
            onChange={(e) => setRecipientPublicKey(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Asset (as JSON string):</label>
          <textarea
            value={assetData}
            onChange={(e) => setAssetData(e.target.value)}
            required
          />
        </div>
        <button type="submit">Post Transaction</button>
      </form>

      {/* Display success message or transaction ID */}
      {data && <p>Transaction ID: {data.postTransaction.id}</p>}
    </div>
  );
};

export default PostTransaction;
