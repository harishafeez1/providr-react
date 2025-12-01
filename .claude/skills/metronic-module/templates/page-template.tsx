import { Fragment } from 'react';
import { Container } from '@/components/Container';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/layouts/demo1';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { [Feature]Content } from './[Feature]Content';

/**
 * [Feature]Page Component
 *
 * Main page component for [feature description].
 * Uses Demo1Layout with toolbar and container structure.
 */
const [Feature]Page = () => {
  return (
    <Fragment>
      {/* Page Header with Toolbar */}
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="[Page Title]"
            description="[Page description or subtitle]"
          />
          <ToolbarActions>
            {/* Add action buttons here */}
            <Button variant="light" size="sm">
              <KeenIcon icon="filter" className="ki-outline" />
              Filter
            </Button>
            <Button variant="primary" size="sm">
              <KeenIcon icon="plus" className="ki-filled" />
              Add New
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      {/* Main Content */}
      <Container>
        <[Feature]Content />
      </Container>
    </Fragment>
  );
};

export { [Feature]Page };
