import React from "react";
import CreateUser from "./CreateUser"; // Adjust the path as needed
import PostTransaction from "./PostTranscation";

const App: React.FC = () => {
  return (
    <div>
      <h1>Generate User Keys</h1>
      <CreateUser /> {/* Render the CreateUser component */}
      <PostTransaction />
    </div>
  );
};

export default App;
