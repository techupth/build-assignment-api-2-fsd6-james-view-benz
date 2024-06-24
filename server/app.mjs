import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});
app.get("/assignments", async (req, res) => {
  let result;
  try {
    result = await connectionPool.query(`select * from assignments`);
  } catch {
    return res.status(500).json({
      message: `Server could not create assignment because database connection`,
    });
  }

  return res.status(200).json({
    data: result.rows[0],
  });
});
app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(
      `select * from assignments where assignment_id=$1`,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: `Server could not create assignment because database connection`,
    });
  }
  if (!result.rows[0]) {
    return res
      .status(404)
      .json({ message: "Server could not find a requested assignment" });
  }
  return res.status(200).json({ data: result.rows[0] });
});
app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  const updateAssignment = { ...req.body };
  let result;
  try {
    result = await connectionPool.query(
      `update assignments 
      set 
           title= $2,
           content= $3,
           category= $4
      where assignment_id = $1
     `,
      [
        assignmentIdFromClient,
        updateAssignment.title,
        updateAssignment.content,
        updateAssignment.category,
      ]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment due to database error",
    });
  }
  if (result.rows === 0) {
    return res.status(404).json({
      message: "Server could not find a requested assignment to update",
    });
  }

  return res.status(200).json({ message: "Updated assignment sucessfully" });
});
app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(
      `delete from assignments where assignment_id=$1`,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
  if (result.rows) {
    return res.status(404).json({
      message: "Server could not find a requested assignment to delete",
    });
  }
  return res.status(200).json({ message: "Deleted assignment sucessfully" });
});
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
