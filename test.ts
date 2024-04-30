import { writeToDatabase } from "./database";

async function testWriteToDatabase() {
  const data = [
    { name: "Player 1", position: "Forward" },
    { name: "Player 2", position: "Midfielder" },
    // Add more sample data as needed
  ];

  try {
    await writeToDatabase(data);
    console.log("Data inserted successfully!");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

// Call the test function
testWriteToDatabase();
