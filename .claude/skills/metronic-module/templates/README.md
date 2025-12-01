# Component Templates

This directory contains ready-to-use component templates for creating new modules in the Providr Provider Portal.

## Available Templates

### 1. `page-template.tsx`
**Purpose:** Main page component template

**Use when:** Creating a new page that uses the Demo1 layout

**Placeholders to replace:**
- `[Feature]` - Feature name in PascalCase (e.g., `TasksList`, `UserProfile`)
- `[Page Title]` - Human-readable page title (e.g., "Tasks Management")
- `[Page description]` - Page subtitle or description

**Example:**
```tsx
// Replace [Feature] with "TasksList"
const TasksListPage = () => {
  // ...
}
```

### 2. `content-template.tsx`
**Purpose:** Content wrapper component template

**Use when:** Creating the main content component for a feature

**Placeholders to replace:**
- `[Feature]` - Feature name in PascalCase
- `[Component]` - Component name in PascalCase (e.g., `Tasks`, `Users`)
- `[Card Title]` - Title for the card
- `[Card description]` - Card subtitle

### 3. `table-template.tsx`
**Purpose:** Data table component template with full CRUD operations

**Use when:** Creating a table to display and manage data

**Placeholders to replace:**
- `[Component]` - Component name in PascalCase
- `[data description]` - Description of the data being displayed

**Features included:**
- Loading state with spinner
- Error state with retry button
- Empty state with call-to-action
- Column definitions with various cell types
- Action buttons (view, edit, delete)
- Status badges

### 4. `form-template.tsx`
**Purpose:** Form component template with Formik + Yup validation

**Use when:** Creating a form for creating or editing data

**Placeholders to replace:**
- `[Entity]` - Entity name in PascalCase (e.g., `Task`, `User`)
- `[Component]` - Component name in PascalCase
- `[entity]` - Entity name in lowercase (e.g., `task`, `user`)

**Features included:**
- Full Formik integration
- Yup validation schema
- Error display for each field
- Loading state during submission
- Success/error handling with toast notifications

### 5. `data-layer-template.tsx`
**Purpose:** Data layer template with React Query hooks

**Use when:** Creating API integration for a module

**Placeholders to replace:**
- `[Entity]` - Entity name in PascalCase (singular, e.g., `Task`, `User`)
- `[entities]` - Entity name in lowercase (plural, e.g., `tasks`, `users`)

**Features included:**
- Query hook for fetching all items
- Query hook for fetching single item by ID
- Mutation hook for creating
- Mutation hook for updating
- Mutation hook for deleting
- Mutation hook for bulk operations
- Automatic cache invalidation
- Toast notifications

## How to Use Templates

### Step 1: Copy the Template
Copy the template file you need to your feature directory.

### Step 2: Replace Placeholders
Find and replace all placeholders (text in square brackets):

**Example:** Creating a Tasks module
- `[Feature]` → `TasksList`
- `[Entity]` → `Task`
- `[entities]` → `tasks`
- `[Component]` → `Tasks`
- `[Page Title]` → `Tasks Management`

### Step 3: Customize
Modify the template to fit your specific needs:
- Add/remove form fields
- Adjust column definitions
- Update validation rules
- Modify API endpoints

### Step 4: Create Supporting Files
Create the necessary supporting files:
- `index.ts` for barrel exports
- Type definition files if needed
- Additional block components

## Complete Example

Creating a "Teams" module:

### 1. Page Component
```tsx
// teams-list/TeamsListPage.tsx
import { Fragment } from 'react';
import { Container } from '@/components/Container';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/layouts/demo1';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { TeamsListContent } from './TeamsListContent';

const TeamsListPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Teams Management"
            description="Manage your teams and team members"
          />
          <ToolbarActions>
            <Button variant="primary" size="sm">
              <KeenIcon icon="plus" className="ki-filled" />
              Add Team
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <TeamsListContent />
      </Container>
    </Fragment>
  );
};

export { TeamsListPage };
```

### 2. Directory Structure
```
src/pages/teams/
├── teams-list/
│   ├── TeamsListPage.tsx       (from page-template.tsx)
│   ├── TeamsListContent.tsx    (from content-template.tsx)
│   ├── blocks/
│   │   ├── TeamsTable.tsx      (from table-template.tsx)
│   │   ├── TeamsTableData.tsx  (from data-layer-template.tsx)
│   │   └── TeamForm.tsx        (from form-template.tsx)
│   └── index.ts
└── index.ts
```

## Tips

1. **Use Find & Replace:** Use your editor's find-and-replace feature (Ctrl/Cmd + F) to replace all placeholders at once

2. **Maintain Consistency:** Keep naming conventions consistent across all files in a module

3. **Start Simple:** Begin with the basic templates, then add complexity as needed

4. **Reference Examples:** Look at existing modules in the codebase (like `incidents` or `service-offerings`) for real-world examples

5. **Test Incrementally:** Build and test each component before moving to the next

## Next Steps

After using templates:
1. Add routes in `src/App.tsx`
2. Add menu items in `src/config/menu.config.tsx`
3. Test on all breakpoints (mobile, tablet, desktop)
4. Verify dark mode support
5. Test all CRUD operations
