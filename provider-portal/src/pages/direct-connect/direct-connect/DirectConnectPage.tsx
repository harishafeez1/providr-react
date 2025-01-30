import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading } from '@/partials/toolbar';
import { toAbsoluteUrl } from '@/utils';

const DirectConnectPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium leading-none text-gray-900">
              Direct Connect Requests
            </h1>
          </ToolbarHeading>
        </Toolbar>
        <ToolbarDescription>
          Direct Connect requests are specifically addressed to you by participants and require your
          prompt attention. To maintain a high level of service and responsiveness, please ensure
          that you respond to these requests within a 48-hour timeframe.
        </ToolbarDescription>
        <div className="flex flex-col items-center">
          <img
            src={toAbsoluteUrl('/media/illustrations/empty-inbox.svg')}
            className="w-[40vh] h-[40vh]"
          />
          <ToolbarDescription>
            You do not have any Direct Connect request at this moment. Please check back later.
          </ToolbarDescription>
        </div>
      </Container>
    </Fragment>
  );
};

export { DirectConnectPage };
