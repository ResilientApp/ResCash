import fetch from "cross-fetch"; // Ensure cross-fetch is installed for server-side requests
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Service function to get the public key
const getPublicKey = async (id) => {
  console.log("CROW_SERVER_URI:", process.env.CROW_SERVER_URI); // Log CROW_SERVER_URI
  console.log("Received transactionID:", id); // Log received transaction ID

  const url = `${process.env.CROW_SERVER_URI}/${id}`;
  console.log("Fetching public key from URL:", url); // Log the URL being fetched

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch public key. HTTP Status:", response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawText = await response.text(); // Log raw response text
    console.log("Raw response text:", rawText);

    try {
      const data = JSON.parse(rawText);
      const ownersBeforeArray = data.inputs[0].owners_before; // Extract the owners_before array
      if (Array.isArray(ownersBeforeArray) && ownersBeforeArray.length > 0) {
        console.log("Public key found:", ownersBeforeArray[0]);
        return ownersBeforeArray[0]; // Return the first element as the public key
      } else {
        console.error("Invalid owners_before array:", ownersBeforeArray);
        throw new Error("owners_before is not a valid array or is empty");
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Could not parse JSON response");
    }
  } catch (error) {
    console.error("Error fetching public key:", error);
    throw new Error("Could not fetch public key");
  }
};

export default getPublicKey;
