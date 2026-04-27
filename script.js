// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Highlight active navigation link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Project data structure - you can populate this with your projects
const projects = {
    undergraduate: [
        {
            title: "Atmospheric Extinction",
            description: "Analysis of atmospheric extinction effects on stellar observations. This practical investigates how Earth's atmosphere absorbs and scatters light from stars, affecting observations at different wavelengths and altitudes. Uses observational data to determine extinction coefficients and atmospheric transparency.",
            tags: ["Python", "Data Analysis", "Astronomy", "Report"],
            pdf: "For%20Website/Atmospheric%20extincion/ATM-EXT3.pdf",
            code: ["For%20Website/Atmospheric%20extincion/Atmos.py"],
            folder: "For Website/Atmospheric extincion"
        },
        {
            title: "Cosmic Rays",
            description: "Investigation of cosmic ray detection and analysis using advanced data processing techniques. This project analyzes cosmic ray events, their energy distributions, and arrival patterns. Multiple data processing scripts handle different aspects of cosmic ray event analysis and correlation.",
            tags: ["Python", "Data Processing", "Physics", "Report"],
            pdf: "For%20Website/Cosmic%20rays/Schoeman_38655349_KOS.pdf",
            code: ["For%20Website/Cosmic%20rays/dataStuff.py", "For%20Website/Cosmic%20rays/evenMoreData.py", "For%20Website/Cosmic%20rays/moreDataStuff.py"],
            folder: "For Website/Cosmic rays"
        },
        {
            title: "HiSPARC Cosmic Ray Detector",
            description: "Analysis of cosmic ray events using the HiSPARC detector network. This project processes event data from cosmic ray detectors, examining coincidence patterns between multiple detector stations. Includes data analysis of detector responses and event reconstruction.",
            tags: ["Python", "Detector Physics", "Data Analysis", "Report"],
            pdf: "For%20Website/Hispark%20cosmic%20ray%20detector/Report.pdf",
            code: ["For%20Website/Hispark%20cosmic%20ray%20detector/hisparc.py"],
            folder: "For Website/Hispark cosmic ray detector"
        },
        {
            title: "Numerical Methods",
            description: "Implementation and analysis of numerical methods for solving differential equations. This practical covers Euler's method and other numerical integration techniques, demonstrating their application to physics problems with comparative error analysis.",
            tags: ["Python", "Numerical Methods", "Computational Physics", "Report"],
            pdf: "For%20Website/Numerical%20Method/Schoeman_38655349_NUMMET.pdf",
            code: ["For%20Website/Numerical%20Method/euler.py", "For%20Website/Numerical%20Method/temp.py"],
            folder: "For Website/Numerical Method"
        },
        {
            title: "Solar Telescope",
            description: "Analysis of solar observations using telescope imagery. This project involves processing telescopic observations of the Sun, measuring solar features and their evolution. Includes photometric analysis and image processing techniques applied to solar data.",
            tags: ["Astronomy", "Image Analysis", "Solar Physics", "Report"],
            pdf: "For%20Website/Solar%20telescope/Schoeman_38655349.pdf",
            code: [],
            folder: "For Website/Solar telescope"
        },
        {
            title: "Statistical Fluctuations of Radioactive Substances",
            description: "Investigation of statistical fluctuations in radioactive decay events. This practical examines the statistical nature of radioactive decay, testing predictions of quantum mechanics and probability distributions. Includes analysis of near and far field measurements.",
            tags: ["Python", "Statistics", "Radioactivity", "Report"],
            pdf: "For%20Website/Statistical%20fluctuations%20of%20radioactive%20substances/STATFLUX%20-%20Group%202.pdf",
            code: [],
            folder: "For Website/Statistical fluctuations of radioactive substances"
        }
    ],
    honours: [
        // Waiting for honours projects
    ],
    ancillary: [
        // Waiting for ancillary projects
    ]
};

// Function to create and display project cards
function displayProjects(category, sectionId) {
    const grid = document.querySelector(`#${sectionId} .projects-grid`);
    const projectList = projects[category];

    if (projectList.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #5f6368;">Projects coming soon...</p>';
        return;
    }

    grid.innerHTML = projectList.map((project, index) => `
        <div class="project-card" onclick="navigateToProject('${category}', ${index})">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// Function to navigate to project detail page
function navigateToProject(category, index) {
    const project = projects[category][index];
    const projectSlug = project.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    window.location.href = `project.html?category=${category}&index=${index}&slug=${projectSlug}`;
}

// Initialize projects on page load
document.addEventListener('DOMContentLoaded', () => {
    displayProjects('undergraduate', 'undergraduate');
    displayProjects('honours', 'honours');
    displayProjects('ancillary', 'ancillary');
});
