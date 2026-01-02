/**
 * Screenshot Helper for Modal Capture
 *
 * Usage:
 * 1. Open the modal you want to screenshot
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Run: captureModalScreenshot()
 */

async function captureModalScreenshot() {
  // Find the modal element (adjust selector if needed)
  const modal = document.querySelector('[role="dialog"]') ||
                document.querySelector('.modal') ||
                document.querySelector('[class*="Dialog"]');

  if (!modal) {
    console.error('❌ Modal not found! Make sure the modal is open.');
    return;
  }

  console.log('📸 Preparing to capture modal screenshot...');

  // Get the scrollable container inside the modal
  const scrollContainer = modal.querySelector('[class*="scrollable"]') ||
                         modal.querySelector('[class*="overflow"]') ||
                         modal;

  // Store original styles
  const originalOverflow = scrollContainer.style.overflow;
  const originalMaxHeight = scrollContainer.style.maxHeight;
  const originalHeight = scrollContainer.style.height;

  try {
    // Remove scroll constraints temporarily
    scrollContainer.style.overflow = 'visible';
    scrollContainer.style.maxHeight = 'none';
    scrollContainer.style.height = 'auto';

    // Wait for any images or content to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use html2canvas library if available
    if (typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(modal, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // Convert to blob and download
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `modal-screenshot-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('✅ Screenshot captured and downloaded!');
      });
    } else {
      console.log('⚠️ html2canvas not loaded. Using browser\'s built-in screenshot instead.');
      console.log('Instructions:');
      console.log('1. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)');
      console.log('2. Type "screenshot"');
      console.log('3. Select "Capture node screenshot"');
      console.log('4. Click on the modal in the Elements tab');

      // Highlight the modal
      modal.style.outline = '3px solid red';
      setTimeout(() => {
        modal.style.outline = '';
      }, 3000);
    }
  } finally {
    // Restore original styles
    scrollContainer.style.overflow = originalOverflow;
    scrollContainer.style.maxHeight = originalMaxHeight;
    scrollContainer.style.height = originalHeight;
  }
}

// Load html2canvas from CDN
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (typeof html2canvas !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => {
      console.log('✅ html2canvas loaded successfully');
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Auto-load and run
(async function() {
  console.log('🚀 Screenshot Helper Loaded');
  console.log('📝 Instructions:');
  console.log('1. Make sure the modal is open');
  console.log('2. Run: captureModalScreenshot()');
  console.log('');
  console.log('⏳ Loading screenshot library...');

  try {
    await loadHtml2Canvas();
    console.log('✅ Ready! Run: captureModalScreenshot()');
  } catch (error) {
    console.log('⚠️ Could not load library. Use browser screenshot instead.');
  }
})();
