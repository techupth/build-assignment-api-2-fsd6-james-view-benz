import express from "express";
import connectionPool from "./utils/db.mjs";
import { lengthCal } from "./utils/lengthCal.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
    create_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
    status: "publish",
    length: lengthCal(req.body.content),
  };

  const requiredFields = ["title", "content", "category"];
  for (const field of requiredFields) {
    if (!newAssignment[field]) {
      return res.status(400).json({
        message: `Server could not create assignment because there are missing data from client: ${field} is required`,
      });
    }
  }

  console.log(newAssignment);

  try {
    const queryText = `
      INSERT INTO assignments (user_id, title, content, category, length, status, created_at, updated_at, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const values = [
      1,
      newAssignment.title,
      newAssignment.content,
      newAssignment.category,
      newAssignment.length,
      newAssignment.status,
      newAssignment.create_at,
      newAssignment.updated_at,
      newAssignment.published_at,
    ];

    await connectionPool.query(queryText, values);

    return res.status(201).json({
      message: "Created assignment successfully",
    });
  } catch (error) {
    console.error("Error inserting assignment:", error);
    return res.status(500).json({
      message: "Server could not create assignment because of a database error",
    });
  }
});

app.get("/assignments", async (req, res) => {
  try {
    const response = await connectionPool.query(`SELECT * FROM assignments`);
    return res.status(200).json({
      data: response.rows,
    });
  } catch (error) {
    console.error("Error querying the database:", error);
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentid", async (req, res) => {
  try {
    const assignmentIdFromClient = req.params.assignmentid;

    const response = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentIdFromClient]
    );

    if (!response.rows[0]) {
      return res.status(404).json({
        message: `Server could not find a requested assignment id: ${assignmentIdFromClient}`,
      });
    }

    return res.status(200).json({
      data: response.rows[0],
    });
  } catch (error) {
    console.error("Error querying the database:", error);
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.put("/assignments/:assignmentid", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentid;
  const updatedAssignment = {
    ...req.body,
    updated_at: new Date(),
    length: lengthCal(req.body.content),
  };

  const requiredFields = ["title", "content", "category"];
  for (const field of requiredFields) {
    if (!updatedAssignment[field]) {
      return res.status(400).json({
        message: `Server could not update assignment because there are missing data from client: ${field} is required`,
      });
    }
  }

  try {
    const response = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentIdFromClient]
    );

    if (!response.rows[0]) {
      return res.status(404).json({
        message: `Server could not find the requested assignment to update with id: ${assignmentIdFromClient}`,
      });
    }

    await connectionPool.query(
      `
      UPDATE assignments
      SET title = $2,
          content = $3,
          category = $4,
          updated_at = $5,
          length = $6
      WHERE assignment_id = $1   
      `,
      [
        assignmentIdFromClient,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.updated_at,
        updatedAssignment.length,
      ]
    );

    return res.status(200).json({ message: "Updated assignment successfully" });
  } catch (error) {
    console.error("Error querying the database:", error);
    return res.status(500).json({
      message: "Server could not update assignment because of a database error",
    });
  }
});

app.delete("/assignments/:assignmentid", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentid;

  try {
    const response = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentIdFromClient]
    );

    if (!response.rows[0]) {
      return res.status(404).json({
        message: `Server could not find the requested assignment to delete with id: ${assignmentIdFromClient}`,
      });
    }

    await connectionPool.query(
      `DELETE FROM assignments WHERE assignment_id = $1`,
      [assignmentIdFromClient]
    );

    return res.status(200).json({
      message: "Deleted assignment successfully",
    });
  } catch (error) {
    console.error("Error querying the database:", error);
    return res.status(500).json({
      message: "Server could not delete assignment because of a database issue",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
