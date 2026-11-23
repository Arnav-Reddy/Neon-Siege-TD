// Ad-hoc sign the macOS app. Without any signature, Apple Silicon Macs report a downloaded
// app as "damaged". An ad-hoc signature (no Apple Developer account needed) makes macOS treat
// it as an unidentified-developer app instead, which the user can allow once in System Settings.
const { execFileSync } = require('child_process');
const path = require('path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
  execFileSync('codesign', ['--verify', '--deep', '--strict', '--verbose=2', app], { stdio: 'inherit' });
  console.log(`ad-hoc signed and verified: ${app}`);
};
