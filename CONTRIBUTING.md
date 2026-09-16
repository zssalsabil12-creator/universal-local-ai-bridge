# Contributing to ULAB

First off, thank you for considering contributing to ULAB! It's people like you that make ULAB such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible.
* **Provide specific examples to demonstrate the steps**.
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Provide specific examples to demonstrate the steps**.
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Explain why this enhancement would be useful** to most ULAB users.

### Pull Requests

The process described here has several goals:

- Maintain ULAB's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible ULAB
- Enable a sustainable system for ULAB's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in the template
2. Follow the styleguides
3. After you submit your pull request, verify that all status checks are passing

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome or Edge browser (for testing the extension)
- Git

### Setup Steps

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ulab.git
   cd ulab
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`

### Building

To build the project for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Style Guides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### JavaScript/TypeScript Styleguide

* Use TypeScript for all new code
* Follow the existing code style
* Use meaningful variable names
* Add comments for complex logic
* Write tests for new features

### Documentation Styleguide

* Use Markdown for documentation
* Reference examples when possible
* Keep documentation up to date with code changes

## Additional Notes

### Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests.

* `bug` - Issues for bugs in the code
* `enhancement` - Issues for new features or improvements
* `documentation` - Issues for documentation improvements
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `question` - Further information is requested

## Getting Help

If you need help, you can:

* Check the [documentation](./README.md)
* Search existing [issues](../../issues)
* Create a new issue with the `question` label

Thank you for contributing to ULAB! 🎉
