# Deployment security requirements

GitHub Pages does not let this repository configure all security response headers. A production host must apply and verify the policy in `_headers`; publishing the files without those headers is a beta deployment, not a completed security release.

Required production controls:

- HTTPS and HSTS;
- `Content-Security-Policy` with `frame-ancestors 'none'`;
- microphone restricted to the same origin;
- MIME sniffing disabled;
- strict referrer policy;
- versioned, atomic application-shell deployment;
- an origin that can roll back to the previous verified release;
- a release smoke test after CDN propagation, before QR codes are shared.

The application-side iframe warning is a fallback for static beta hosting. It is not a substitute for the `frame-ancestors` response header.
