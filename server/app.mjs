import express, { json } from "express";
import connectionPool from "./utils/db.mjs";

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
    length: "short",
    title: "test",
  };

  const requiredFields = ["content", "category"];
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
  let result;
  try {
    result = await connectionPool.query(`select * from assignments`);
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
      error: error.message,
    });
  }

  return res.status(200).json({
    data: result.rows,
  });
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(
      `select * from assignments where assignment_id=$1`,
      [assignmentId]
    );
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
      error: error.message,
    });
  }

  if (!result.rows[0]) {
    return res.status(404).json({
      message: "Server could not find a requested assignment",
    });
  } else {
    return res.status(200).json({
      data: result.rows[0],
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  let result;
  const assignmentId = req.params.assignmentId;
  const updatedAssignment = { ...req.body };
  try {
    result = await connectionPool.query(
      `
      update assignments
      set title= $2,
          content= $3,
          category= $4
      where assignment_id = $1
      `,
      [
        assignmentId,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
      ]
    );
  } catch (error) {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
      error: error.message,
    });
  }

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "Server could not find a requested assignment to update",
    });
  } else {
    return res.status(200).json({
      message: "Updated assignment successfully",
      assignment: result.rows[0],
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(
      `
      delete from assignments
      where assignment_id = $1
      `,
      [assignmentId]
    );
  } catch (error) {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
      error: error.message,
    });
  }

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "Server could not find a requested assignment to delete",
    });
  } else {
    return res.status(200).json({
      message: "Deleted assignment sucessfully",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
