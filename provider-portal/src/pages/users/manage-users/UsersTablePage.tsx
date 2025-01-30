import { Fragment, useState } from 'react';

import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { UsersTableContent } from '.';
import { ModalAddInvite } from './blocks';
import { setRefreshTable } from '@/redux/slices/users-slice';
import { store } from '@/redux/store';

const UsersTablePage = () => {
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const handleModalClose2 = () => {
    setIsModalOpen2(false);
  };
  const handleModalOpen2 = () => {
    console.log('hello2');
    setIsModalOpen2(true);
  };
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Manage your Users efficiently with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <a onClick={handleModalOpen2} className="btn btn-sm btn-primary">
              Invite User
            </a>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <UsersTableContent />
      </Container>
      <ModalAddInvite
        open={isModalOpen2}
        onOpenChange={handleModalClose2}
        onSaveConfirm={() => {
          store.dispatch(setRefreshTable(true));
        }}
      />
    </Fragment>
  );
};

export { UsersTablePage };
