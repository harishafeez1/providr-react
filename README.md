# Providr React Project

This repository contains the Providr Provider Portal and Customer Portal applications built with React and Metronic Tailwind theme.

## Project Structure

```
providr-react/
├── provider-portal/     # Provider Portal application
├── customer-portal/     # Customer Portal application
└── .claude/            # Claude Code configuration
    └── skills/         # Custom Claude Code skills
```

## Claude Code Skills

This project includes custom Claude Code skills to help streamline development. Skills are specialized capabilities that Claude can use when working on this codebase.

### Available Skills

#### 🎨 Metronic Module Creator (`metronic-module`)

**Location:** `.claude/skills/metronic-module/`

**Purpose:** Automates the creation of new modules for the Providr Provider Portal following established Metronic theme patterns and conventions.

**When to use:**
- Creating new feature modules or pages
- Building UI components that follow Metronic design patterns
- Setting up new sections in the Provider Portal

**Documentation Structure:**

The skill is organized into focused reference documents:

- **[SKILL.md](/.claude/skills/metronic-module/SKILL.md)** - Main skill overview and quick start guide
- **[patterns.md](/.claude/skills/metronic-module/patterns.md)** - File structure, naming conventions, and module organization
- **[components.md](/.claude/skills/metronic-module/components.md)** - UI component usage and patterns (Cards, Buttons, Forms, Tables, etc.)
- **[styling.md](/.claude/skills/metronic-module/styling.md)** - Tailwind CSS and Metronic styling conventions, dark mode, responsive design
- **[api-integration.md](/.claude/skills/metronic-module/api-integration.md)** - React Query patterns, data fetching, mutations, error handling
- **[routing-menu.md](/.claude/skills/metronic-module/routing-menu.md)** - Route configuration, protected routes, sidebar menu setup
- **[templates/](/.claude/skills/metronic-module/templates/)** - Ready-to-use component templates:
  - `page-template.tsx` - Main page component
  - `content-template.tsx` - Content wrapper
  - `form-template.tsx` - Form with Formik + Yup validation
  - `table-template.tsx` - Data table with CRUD operations
  - `data-layer-template.tsx` - React Query hooks for API integration
- **[examples/](/.claude/skills/metronic-module/examples/)** - Complete working module examples

**Key Technologies Covered:**
- Metronic Tailwind React Theme (Demo1 Layout)
- Shadcn UI Components
- KeenIcons (Metronic custom icons)
- TanStack React Table (DataGrid)
- React Query for data fetching
- Formik + Yup for forms
- Tailwind CSS v3.4.14

**How to use:**
Simply ask Claude to create a new module using Metronic conventions. For example:
- "Create a new tasks module using Metronic patterns"
- "Build a users management page following the Metronic conventions"
- "Generate a dashboard module with the established patterns"

Claude will automatically use this skill to generate properly structured code that follows all project conventions.

**Manual Reference:**
You can also manually reference specific documentation when you need guidance:
- Need file structure help? → See [patterns.md](/.claude/skills/metronic-module/patterns.md)
- Need component examples? → See [components.md](/.claude/skills/metronic-module/components.md)
- Need styling guidance? → See [styling.md](/.claude/skills/metronic-module/styling.md)
- Need API integration? → See [api-integration.md](/.claude/skills/metronic-module/api-integration.md)
- Need routing setup? → See [routing-menu.md](/.claude/skills/metronic-module/routing-menu.md)
- Need templates? → See [templates/](/.claude/skills/metronic-module/templates/)

### Creating New Skills

To create additional skills for this project:

1. Create a new directory in `.claude/skills/` with your skill name (lowercase, hyphens)
2. Create a `SKILL.md` file with proper YAML frontmatter:

```yaml
---
name: your-skill-name
description: What the skill does and when to use it
---

# Your Skill Title

[Detailed instructions and examples]
```

3. Optionally add supporting files (reference.md, templates/, scripts/)
4. Commit to git to share with your team

For complete documentation on Claude Code skills, visit:
- https://code.claude.com/docs/en/skills.md

## Development

### Provider Portal

The Provider Portal uses:
- React with TypeScript
- Metronic Tailwind Theme
- Shadcn UI components
- React Query for state management
- Formik + Yup for forms

Navigate to `provider-portal/` directory for development.

### Customer Portal

Navigate to `customer-portal/` directory for development.

## Getting Started

1. Clone the repository
2. Install dependencies for the portal you want to work on
3. Start the development server
4. Use Claude Code with the custom skills to accelerate development

## Contributing

When contributing to this project:
- Follow the established Metronic module patterns
- Use TypeScript for all components
- Ensure responsive design with Tailwind breakpoints
- Add dark mode support
- Use Shadcn UI components where available
- Follow the file structure conventions
- Update this README when adding new skills or major features
