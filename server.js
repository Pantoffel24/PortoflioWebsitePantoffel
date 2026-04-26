const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const multer = require("multer");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Configure file upload
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/plain" || file.originalname.endsWith(".py")) {
      cb(null, true);
    } else {
      cb(new Error("Only Python files (.py) are allowed"));
    }
  },
});

// Directory for temporary plot outputs
const PLOTS_DIR = path.join(__dirname, "plots");
if (!fs.existsSync(PLOTS_DIR)) {
  fs.mkdirSync(PLOTS_DIR);
}

/**
 * Execute a Python script and optionally capture plots
 * Returns: { success, output, plots, error }
 */
app.post("/api/run-script", (req, res) => {
  const { folder, mainFile } = req.body;

  if (!folder || !mainFile) {
    return res.status(400).json({ error: "Missing folder or mainFile" });
  }

  const scriptPath = path.join(__dirname, folder, mainFile);

  // Validate script exists
  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({ error: `Script not found: ${scriptPath}` });
  }

  try {
    // Create a wrapper that captures matplotlib output
    const wrapperScript = path.join(__dirname, "run_with_plots.py");
    const outputDir = path.join(PLOTS_DIR, `project-${Date.now()}`);
    fs.mkdirSync(outputDir, { recursive: true });

    // Execute the Python script with plot capture
    const command = `python "${wrapperScript}" "${scriptPath}" "${outputDir}"`;
    const output = execSync(command, {
      cwd: path.dirname(scriptPath),
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });

    // Collect any generated plots
    const plots = fs
      .readdirSync(outputDir)
      .filter((file) => file.endsWith(".png"))
      .map((file) => `/plots/project-${Date.now()}/${file}`);

    res.json({
      success: true,
      output,
      plots,
      error: null,
    });
  } catch (error) {
    res.json({
      success: false,
      output: error.stdout ? error.stdout.toString() : "",
      error: error.stderr ? error.stderr.toString() : error.message,
      plots: [],
    });
  }
});

/**
 * Serve plots directory
 */
app.use("/plots", express.static(PLOTS_DIR));

/**
 * Get available projects
 */
app.get("/api/projects", (req, res) => {
  try {
    const projectsPath = path.join(__dirname, "projects.json");
    const projects = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Upload new project file
 */
app.post("/api/upload-project", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { title, description, tags, folder } = req.body;
    
    if (!title || !description) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Title and description are required" });
    }

    // Create uploads folder if it doesn't exist
    const uploadsFolder = path.join(__dirname, folder || "uploads");
    if (!fs.existsSync(uploadsFolder)) {
      fs.mkdirSync(uploadsFolder, { recursive: true });
    }

    // Move file to uploads folder with original name
    const fileName = req.file.originalname;
    const newFilePath = path.join(uploadsFolder, fileName);
    fs.copyFileSync(req.file.path, newFilePath);
    fs.unlinkSync(req.file.path);

    // Generate project ID
    const projectId = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Create project entry
    const newProject = {
      id: projectId,
      title: title,
      description: description,
      tags: tags ? tags.split(",").map((t) => t.trim()) : ["Python", "User Upload"],
      folder: folder || "uploads",
      mainFile: fileName,
      dataFiles: [],
      uploadedAt: new Date().toISOString(),
    };

    // Read current projects.json
    const projectsPath = path.join(__dirname, "projects.json");
    let projects = [];
    if (fs.existsSync(projectsPath)) {
      projects = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));
    }

    // Add new project (at the beginning)
    projects.unshift(newProject);

    // Write updated projects.json
    fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2));

    res.json({
      success: true,
      message: `Project "${title}" uploaded successfully!`,
      project: newProject,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✨ Python Portfolio Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${__dirname}`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
