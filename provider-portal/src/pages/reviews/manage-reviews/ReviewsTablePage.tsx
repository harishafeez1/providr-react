import { Fragment, useState } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { ReviewsTableContent } from '.';
import { useAuthContext } from '@/auth';
import { Copy } from 'lucide-react';

const ReviewsTablePage = () => {
  const [clientSecretInput, setClientSecretInput] = useState('');
  const [copied, setCopied] = useState(false);
  const { auth } = useAuthContext();

  const url = `https://app.providr.au/provider-profile/${auth?.user?.provider_company_id || ''}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
              <div className="flex  items-center gap-6 py-2">
                <label className="form-label truncate pt-2">
                  <div className="flex flex-col">
                    <span>share this URL with your client:</span>

                    {url}
                  </div>
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="relative flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  title={copied ? 'Copied!' : 'Copy URL'}
                >
                  <Copy className="w-5 h-5" />
                  {copied && (
                    <span className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
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
