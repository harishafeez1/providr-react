import { Fragment } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { AddCompanyProfileContent } from './AddCompanyProfileContent';

const AddCompanyProfilePage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Add Company Profile" />
            <ToolbarDescription>
              Add your Company Profile efficiently with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>

      <Container>
        <AddCompanyProfileContent />
      </Container>
    </Fragment>
  );
};

export { AddCompanyProfilePage };
