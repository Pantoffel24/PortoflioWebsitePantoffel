# Physics & Projects Portfolio

A clean, organized portfolio website showcasing undergraduate physics work, honours projects, and ancillary work.

## Structure

```
Portfolio/
├── index.html           # Main landing page
├── styles.css          # All styling
├── script.js           # Navigation and project display logic
├── package.json        # Dependencies
├── NPHY Practicals/    # Undergraduate physics coursework
├── PRACTICALS/         # Additional physics practicals
├── scripts/            # Python scripts
└── plots/              # Generated plots and visualizations
```

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Navigation**: Smooth scrolling between sections
- **Three Main Categories**:
  - Undergraduate Physics
  - Honours Physics
  - Ancillary Projects
- **Clean Modern UI**: Professional gradient design with hover effects

## Next Steps

1. **Update your name** in `index.html` - Look for "Your Name" in the hero section
2. **Customize the description** - Update the subtitle and description in the hero section
3. **Add projects** - Edit `script.js` and populate the `projects` object with your work:
   ```javascript
   undergraduate: [
       {
           title: "Project Name",
           description: "Description of the project",
           tags: ["Python", "Data Analysis", "Physics"]
       },
       // ... more projects
   ]
   ```
4. **Run locally**: `npm install` then `npm start` (if using Express server)

## Customization Tips

- Edit the color scheme in `styles.css` (`:root` variables)
- Modify the hero section styling for a different look
- Add images to projects by extending the project card structure
- Link to project documentation or GitHub repositories

---

Ready to populate your portfolio with your amazing work!
