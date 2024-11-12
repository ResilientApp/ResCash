// services/getPublicKey.js
import fetch from "cross-fetch"; // Ensure cross-fetch is installed for server-side requests
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Service function to get the public key
const getPublicKey = async (id) => {
  const url = `${process.env.CROW_SERVER_URI}/${id}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const ownersBeforeArray = data.inputs[0].owners_before; // Extract the owners_before array
    if (Array.isArray(ownersBeforeArray) && ownersBeforeArray.length > 0) {
      return ownersBeforeArray[0]; // Return the first element as the public key
    } else {
      throw new Error("owners_before is not a valid array or is empty");
    }
  } catch (error) {
    console.error("Error fetching public key:", error);
    throw new Error("Could not fetch public key");
  }
};

export default getPublicKey;
