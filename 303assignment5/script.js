// Get all project elements
const projects = document.querySelectorAll('.project');

// Calculate the number of columns you want (in this case, 2)
const columns = 2;

// Calculate the number of rows needed based on the number of projects
const rows = Math.ceil(projects.length / columns);

// Create a container for the rows
const rowContainer = document.createElement('div');
rowContainer.classList.add('project-rows');

// Loop through the projects and group them into rows
for (let i = 0; i < rows; i++) {
  const row = document.createElement('div');
  row.classList.add('project-row');

  // Determine how many projects should be in this row
  const projectsInThisRow = (i === rows - 1) ? projects.length % columns || columns : columns;

  // Loop through the projects for this row
  for (let j = 0; j < projectsInThisRow; j++) {
    const project = projects[i * columns + j].cloneNode(true); // Clone the project element
    row.appendChild(project);
  }

  rowContainer.appendChild(row);
}

// Replace the existing .marquee-content with the new row container
const marqueeContent = document.querySelector('.marquee-content');
marqueeContent.innerHTML = ''; // Clear the existing content
marqueeContent.appendChild(rowContainer);