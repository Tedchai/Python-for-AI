# Python for AI Research

An English-language interactive course that introduces Python through data exploration, browser-based coding, and small AI research projects.

**Live course:** [https://tedchai.github.io/Python-for-AI/](https://tedchai.github.io/Python-for-AI/)

## Course overview

The course is designed for secondary-school students, undergraduate beginners, and learners who have only limited Python experience. Students do not need Python installed for Class 1: the first coding activity runs directly in the browser, and the instructor can guide the student through Kaggle registration and notebook setup during the lesson.

The learning path connects:

> research question → dataset → data preparation → visualization and EDA → model training and comparison → result interpretation → report, code, and presentation

Students gradually build a portfolio that may include:

- a reproducible notebook that runs from top to bottom;
- a dataset source record, variable dictionary, and cleaning log;
- three to five figures that support a research question;
- model experiments with fair comparisons and recorded metrics;
- a short research report or draft paper;
- a presentation that explains the problem, method, results, limitations, and next steps.

## Class 1: live beginner lesson

Class 1 runs for 60 minutes and is designed for a live, fully English online session.

Key features include:

- no local Python installation required;
- editable Python code powered by Pyodide in the browser;
- a **Run** button with visible output and error feedback;
- an **Explain Each Line** walkthrough with line numbers, active-line highlighting, automatic spoken English explanations, replay control, and Previous/Next navigation;
- beginner-friendly examples covering values, variables, lists, output, and simple data patterns;
- optional guided Kaggle registration using a Google account;
- privacy reminders before entering account details while screen sharing or recording;
- a clear handoff from the browser exercise to a saved Kaggle Notebook.

The line-by-line explanation is deterministic and works on static GitHub Pages without a paid AI backend.

## Course sequence

| Class | Topic | Main outcome |
|---:|---|---|
| 1 | Python Basics & Kaggle Notebook | Run browser Python and create a first notebook |
| 2 | Python Control Structures | Build decisions and loops with boundary checks |
| 3 | Python Data Structures | Organize records with lists, dictionaries, tuples, and sets |
| 4 | NumPy for Scientific Computing | Use arrays, vectorized operations, and simulation |
| 5 | pandas for Data Analysis | Inspect, filter, group, and summarize tabular data |
| 6 | Data Cleaning | Record reproducible cleaning decisions |
| 7 | Data Visualization | Produce three evidence-focused plots |
| 8 | Exploratory Data Analysis (EDA) | Connect observations to a research question |
| 9 | Machine Learning with Scikit-learn | Build a baseline and a complete training workflow |
| 10 | Linear Regression | Predict continuous values and analyze MAE |
| 11 | Classification: Logistic Regression & KNN | Compare classifiers and interpret a confusion matrix |
| 12 | Decision Tree & Random Forest | Examine tree models, feature importance, and overfitting |
| 13 | SVM & XGBoost | Compare advanced models in a consistent framework |
| 14 | AI Research Workflow | Assemble project evidence into a reproducible project v1 |
| 15 | Final AI Research Project | Submit code, figures, a report, and a presentation |

## Lesson duration

- Class 1 runs for 60 minutes.
- Class 2 runs for 120 minutes.
- Classes 3–15 currently use a 60-minute structure.

Formal notebook saving, versioning, and assignment submission take place in Kaggle. The Class 1 browser lab provides a low-friction first coding experience before that handoff.

## Teaching principles

- Every class produces a visible learning artifact.
- Code supports a data, modeling, documentation, or research-communication task.
- Core work is completed before optional extensions.
- Model complexity and code length are not treated as evidence of quality.
- Students must be able to explain the code, figures, and conclusions they submit.
- AI tools may help explain concepts, debug code, or improve writing, but may not be used to fabricate data, sources, code ownership, or experimental results.
- External data should be documented with its source, license, access date, variables, and usage restrictions.

Suggested assessment weights:

- weekly class artifacts and notebooks: 25%;
- data preparation and EDA: 25%;
- modeling and experiments: 30%;
- final report and presentation: 20%.

## Repository structure

- `scripts/build.js` — course content, page templates, and interactive components;
- `scripts/course-validator.js` — structural, pacing, English-only, and feature validation;
- `scripts/lab-smoke-test.js` — static checks for representative browser labs;
- `scripts/server.js` — optional local preview server and server-side features;
- `narration/python-ai-en/lesson-01/` — English narration manifest and audio for Class 1;
- `.github/workflows/deploy-pages.yml` — GitHub Pages build and deployment workflow;
- `_site/` — generated English-only deployment artifact.

Generated course pages are build artifacts and are not committed as source files.

## Run locally

Node.js 18 or later is required.

```bash
npm run build
npm run validate
npm run serve
```

Then open:

- course home: `http://localhost:3100/`
- English Class 1: `http://localhost:3100/python-ai-en/lesson-01/`

## Validation and publishing

Before publishing, run:

```bash
npm run validate
```

The validation suite checks the lesson order, approved timing, required slide structure, browser lab controls, narration coverage, and absence of Chinese characters from the public English build.

Pushing or merging into `main` starts the GitHub Actions workflow. The workflow builds the course, validates it, stages only the English public output in `_site`, and deploys that artifact to GitHub Pages.

## License

MIT
