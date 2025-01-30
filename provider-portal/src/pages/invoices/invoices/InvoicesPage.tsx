import { Fragment } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/partials/toolbar';
import { Alert } from '@/components';

const InvoicesPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium leading-none text-gray-900">Provider Invoices</h1>
          </ToolbarHeading>
        </Toolbar>

        <div className="flex flex-col ">
          <div className="py-2">
            <Alert variant="warning">No invoices available.</Alert>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { InvoicesPage };
