// PWA Install Prompt Handler
let deferredPrompt;
let installButton = null;

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

// Show install button
function showInstallButton() {
  if (installButton) return; // Button already exists
  
  installButton = document.createElement('button');
  installButton.textContent = '📱 Install App';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    background: #00ff88;
    color: #000;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
    z-index: 1000;
    transition: all 0.3s ease;
  `;
  
  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'scale(1.05)';
    installButton.style.boxShadow = '0 6px 16px rgba(0, 255, 136, 0.4)';
  });
  
  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'scale(1)';
    installButton.style.boxShadow = '0 4px 12px rgba(0, 255, 136, 0.3)';
  });
  
  installButton.addEventListener('click', installApp);
  document.body.appendChild(installButton);
}

// Handle install button click
async function installApp() {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`PWA install outcome: ${outcome}`);
  
  if (outcome === 'accepted') {
    hideInstallButton();
  }
  
  deferredPrompt = null;
}

// Hide install button
function hideInstallButton() {
  if (installButton) {
    installButton.style.opacity = '0';
    setTimeout(() => {
      if (installButton && installButton.parentNode) {
        installButton.parentNode.removeChild(installButton);
        installButton = null;
      }
    }, 300);
  }
}

// Handle app installed event
window.addEventListener('appinstalled', (evt) => {
  console.log('PWA was installed successfully');
  hideInstallButton();
});

// Check if app is already installed
window.addEventListener('load', () => {
  // Hide install button if app is running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('PWA is running in standalone mode');
  }
});

export { showInstallButton, hideInstallButton };