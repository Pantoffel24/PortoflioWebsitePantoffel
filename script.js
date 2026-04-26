let projects = [];
const API_URL = "http://localhost:3001";
let selectedTags = new Set();

const projectList = document.getElementById("project-list");
const previewTitle = document.getElementById("preview-title");
const codeBlock = document.getElementById("code-block");
const outputBlock = document.getElementById("output-block");
const copyButton = document.getElementById("copy-button");
const themeToggle = document.getElementById("theme-toggle");
const loadingSpinner = document.getElementById("loading-spinner");
const filterContainer = document.getElementById("filter-container");
const tagFiltersContainer = document.getElementById("tag-filters");
const clearFiltersBtn = document.getElementById("clear-filters");

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light-mode");
    themeToggle.textContent = "🌙";
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.remove("light-mode");
    themeToggle.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  }
}

themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.classList.contains("light-mode") ? "light" : "dark";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  applyTheme(newTheme);
});

// Load projects from JSON
async function loadProjects() {
  try {
    const response = await fetch("projects.json");
    const data = await response.json();
    projects = data;
    setupFilterTags();
    renderProjects();
    loadingSpinner.style.display = "none";
    filterContainer.style.display = "block";
  } catch (error) {
    console.error("Error loading projects:", error);
    outputBlock.textContent = "Error loading projects.json";
    loadingSpinner.innerHTML = `<p style="color: #ef4444;">Error loading projects</p>`;
  }
}

// Extract all unique tags from projects
function setupFilterTags() {
  const allTags = new Set();
  projects.forEach((project) => {
    project.tags.forEach((tag) => allTags.add(tag));
  });

  const sortedTags = Array.from(allTags).sort();
  tagFiltersContainer.innerHTML = "";

  sortedTags.forEach((tag) => {
    const button = document.createElement("button");
    button.className = "tag-filter";
    button.textContent = tag;
    button.addEventListener("click", () => toggleTag(tag, button));
    tagFiltersContainer.appendChild(button);
  });
}

function toggleTag(tag, button) {
  if (selectedTags.has(tag)) {
    selectedTags.delete(tag);
    button.classList.remove("active");
  } else {
    selectedTags.add(tag);
    button.classList.add("active");
  }
  filterAndRenderProjects();
}

clearFiltersBtn.addEventListener("click", () => {
  selectedTags.clear();
  document.querySelectorAll(".tag-filter").forEach((btn) => btn.classList.remove("active"));
  filterAndRenderProjects();
});

function filterAndRenderProjects() {
  const cards = document.querySelectorAll(".project-card");
  cards.forEach((card) => {
    const projectId = card.dataset.projectId;
    const project = projects.find((p) => p.id === projectId);

    if (selectedTags.size === 0) {
      card.classList.remove("hidden");
    } else {
      const hasMatchingTag = Array.from(selectedTags).some((tag) => project.tags.includes(tag));
      card.classList.toggle("hidden", !hasMatchingTag);
    }
  });
}

function renderProjects() {
  projectList.innerHTML = "";
  projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.dataset.projectId = project.id;
    card.innerHTML = `
      <div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
      </div>
      <span class="badge">${project.tags.join(" • ")}</span>
    `;

    card.addEventListener("click", () => selectProject(project));
    projectList.appendChild(card);
  });
}

async function selectProject(project) {
  previewTitle.textContent = project.title;
  copyButton.disabled = false;

  try {
    // Load the Python file
    const response = await fetch(`${project.folder}/${project.mainFile}`);
    if (response.ok) {
      const code = await response.text();
      const codeElement = codeBlock.querySelector("code") || codeBlock;
      codeElement.textContent = code;
      codeElement.className = "language-python";
      copyButton.setAttribute("data-code", code);

      // Apply syntax highlighting
      if (window.hljs) {
        hljs.highlightElement(codeElement);
      }
    } else {
      codeBlock.textContent = `# Could not load ${project.mainFile}`;
    }
  } catch (error) {
    codeBlock.textContent = `# Error loading file: ${error.message}`;
  }

  // Display project info and try to run the script
  let outputText = `📁 Project: ${project.title}\n\n`;
  outputText += `📝 Description:\n${project.description}\n\n`;
  outputText += `🏷️  Tags: ${project.tags.join(", ")}\n\n`;
  outputText += `📂 Location: ${project.folder}/${project.mainFile}`;

  if (project.dataFiles && project.dataFiles.length > 0) {
    outputText += `\n\n📊 Data Files:\n${project.dataFiles.map((f) => `  • ${f}`).join("\n")}`;
  }

  outputBlock.textContent = outputText;

  // Try to run the script via the backend
  runScriptOnServer(project);
}

async function runScriptOnServer(project) {
  try {
    const response = await fetch(`${API_URL}/api/run-script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder: project.folder,
        mainFile: project.mainFile,
      }),
    });

    if (!response.ok) {
      console.log("Server not running - static mode");
      return;
    }

    const result = await response.json();

    // Update output with script execution results
    let outputText = `📁 ${project.title}\n\n`;
    outputText += `📝 ${project.description}\n\n`;

    if (result.success) {
      outputText += `✅ Script Output:\n`;
      outputText += result.output || "(No output)";

      // Add plots section if available
      if (result.plots && result.plots.length > 0) {
        outputText += `\n\n📊 Generated Plots: ${result.plots.length} plot(s)`;
      }
    } else {
      outputText += `❌ Error:\n`;
      outputText += result.error || result.output || "Unknown error";
    }

    outputBlock.textContent = outputText;

    // Display plots if generated
    if (result.plots && result.plots.length > 0) {
      displayPlots(result.plots);
    }
  } catch (error) {
    // Server not running - that's okay, show static mode
    console.log("Backend server not running. Static mode active.");
  }
}

function displayPlots(plotPaths) {
  const plotsContainer = document.getElementById("plots-container");
  if (!plotsContainer) return;

  plotsContainer.innerHTML = "";
  plotPaths.forEach((plotPath) => {
    const img = document.createElement("img");
    img.src = `${API_URL}${plotPath}?t=${Date.now()}`;
    img.alt = "Generated plot";
    img.style.maxWidth = "100%";
    img.style.marginTop = "1rem";
    plotsContainer.appendChild(img);
  });
}

copyButton.addEventListener("click", () => {
  const code = copyButton.getAttribute("data-code");
  navigator.clipboard.writeText(code).then(() => {
    copyButton.textContent = "✓ Copied!";
    setTimeout(() => {
      copyButton.textContent = "Copy code";
    }, 2000);
  });
});

// Upload Section Management
const toggleUploadBtn = document.getElementById("toggle-upload");
const uploadSection = document.getElementById("upload-section");
const uploadForm = document.getElementById("upload-form");
const cancelUploadBtn = document.getElementById("cancel-upload-btn");
const fileInput = document.getElementById("project-file");
const fileInputLabel = document.querySelector(".file-input-label");
const uploadStatus = document.getElementById("upload-status");
const statusSpinner = document.getElementById("status-spinner");
const statusMessage = document.getElementById("status-message");

// Toggle upload section visibility
toggleUploadBtn.addEventListener("click", () => {
  uploadSection.style.display = uploadSection.style.display === "none" ? "block" : "none";
  if (uploadSection.style.display === "block") {
    uploadSection.scrollIntoView({ behavior: "smooth" });
  }
});

cancelUploadBtn.addEventListener("click", () => {
  uploadSection.style.display = "none";
  uploadForm.reset();
  uploadStatus.style.display = "none";
});

// Drag and drop file handling
fileInputLabel.addEventListener("dragover", (e) => {
  e.preventDefault();
  fileInputLabel.style.borderColor = "#60a5fa";
  fileInputLabel.style.background = "rgba(15, 23, 42, 0.7)";
});

fileInputLabel.addEventListener("dragleave", () => {
  fileInputLabel.style.borderColor = "rgba(96, 165, 250, 0.4)";
  fileInputLabel.style.background = "rgba(15, 23, 42, 0.5)";
});

fileInputLabel.addEventListener("drop", (e) => {
  e.preventDefault();
  fileInputLabel.style.borderColor = "rgba(96, 165, 250, 0.4)";
  fileInputLabel.style.background = "rgba(15, 23, 42, 0.5)";
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
  }
});

fileInputLabel.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    const fileName = fileInput.files[0].name;
    const uploadText = fileInputLabel.querySelector(".upload-text");
    uploadText.textContent = `✓ Selected: ${fileName}`;
    uploadText.style.color = "#86efac";
  }
});

// Handle form submission
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formData = new FormData(uploadForm);
  const title = document.getElementById("project-title").value;
  
  if (!fileInput.files.length) {
    showUploadStatus("error", "Please select a Python file");
    return;
  }
  
  showUploadStatus("loading", "Uploading project...");
  
  try {
    const response = await fetch(`${API_URL}/api/upload-project`, {
      method: "POST",
      body: formData,
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      showUploadStatus("success", `✓ ${result.message}`);
      uploadForm.reset();
      const uploadText = fileInputLabel.querySelector(".upload-text");
      uploadText.textContent = "Click to upload or drag and drop";
      uploadText.style.color = "#e2e8f0";
      
      // Reload projects after a short delay
      setTimeout(() => {
        loadProjects();
        uploadSection.style.display = "none";
      }, 1500);
    } else {
      showUploadStatus("error", `Error: ${result.error || "Upload failed"}`);
    }
  } catch (error) {
    showUploadStatus("error", `Connection error: ${error.message}`);
    console.error("Upload error:", error);
  }
});

function showUploadStatus(type, message) {
  uploadStatus.style.display = "block";
  uploadStatus.className = `upload-status ${type}`;
  statusMessage.textContent = message;
  
  if (type === "loading") {
    statusSpinner.style.display = "block";
  } else {
    statusSpinner.style.display = "none";
  }
}

// Load projects on page load
initTheme();
loadProjects();
