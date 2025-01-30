import { Fragment, useState } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { ReviewsTableContent } from '.';

const ReviewsTablePage = () => {
  const [clientSecretInput, setClientSecretInput] = useState('');
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Manage your reviews efficiently with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
        <Toolbar>
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <div className="grow py-3">
              <label className="form-label max-w-80 py-2">
                Invite your clients to review via email:
              </label>
              <div className="input-group">
                <input
                  className="input"
                  type="text"
                  value={clientSecretInput}
                  onChange={(e) => setClientSecretInput(e.target.value)}
                />
                <span className="btn btn-primary">Invite</span>
              </div>
              <label className="form-label max-w-80 py-2">
                share this URL with your client:
                https://clickability.com.au/provider/helping-hands#review
              </label>
            </div>
          </div>
        </Toolbar>
      </Container>

      <Container>
        <ReviewsTableContent />
      </Container>
    </Fragment>
  );
};

export { ReviewsTablePage };
