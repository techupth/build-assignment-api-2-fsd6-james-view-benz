import express, { json } from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
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
