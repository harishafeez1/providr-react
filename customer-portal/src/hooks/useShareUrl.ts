import { useCallback, useState } from 'react';

const useSharePageUrl = () => {
  const [status, setStatus] = useState<'idle' | 'copied' | 'shared' | 'error'>('idle');

  const sharePage = useCallback(async () => {
    const currentUrl = window.location.href;
    setStatus('idle');

    try {
      await navigator.clipboard.writeText(currentUrl);
      console.log('Copied to clipboard');
      setStatus('copied');

      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: 'Check out this page:',
          url: currentUrl
        });
        setStatus('shared');
      } else {
        alert('Web Share API is not supported on this browser.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setStatus('error');
    }
  }, []);

  const isShareSupported = !!navigator.share;

  return {
    sharePage,
    isShareSupported,
    status
  };
};

export default useSharePageUrl;
