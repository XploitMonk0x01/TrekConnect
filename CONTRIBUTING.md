# Contributing to TrekConnect

First off, thank you for considering contributing to TrekConnect! It's people like you that make TrekConnect such a great tool for the trekking community.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the JavaScript/TypeScript styleguides
- Include thoughtfully-worded, well-structured tests
- Document new code
- End all files with a newline

## Development Process

1. Fork the repository
2. Create a new branch from `main` for your feature/fix
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Update documentation if needed
7. Submit a pull request

### Setting up Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/TrekConnect.git
cd TrekConnect

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development servers
npm run dev
npm run genkit:dev
```

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure your code is properly formatted (Prettier)
- Follow ESLint rules

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### Testing

- Write tests for new features
- Ensure all existing tests still pass
- Run `npm run typecheck` to check TypeScript
- Run `npm run lint` to check code style

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # Reusable React components
├── contexts/     # React Context providers
├── ai/           # Genkit AI flows
├── lib/          # Utilities and configuration
├── services/     # API integrations
└── hooks/        # Custom React hooks
```

## Technologies Used

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Firebase (Auth, Realtime Database)
- **AI**: Google Genkit with Gemini models
- **External APIs**: Pexels, YouTube Data API

## Questions?

Feel free to create an issue with the question label or reach out to the maintainers.

Thank you for contributing! 🚀
