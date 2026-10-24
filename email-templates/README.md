# Progress Rooms email branding

Open `preview.html` in a browser for a local preview with the bundled logo and a sample code. It is a static QA copy, not the production template; keep its markup synchronized when editing `verification.html`.

`verification.html` is a responsive, table-based email template using the approved leaf-knot logo already supplied in `public/brand/logo-transparent.png`. Use an absolute HTTPS URL to that public asset for `{{logo_url}}`, and HTML-escape `{{otp_code}}` when rendering. Inline base styles preserve the layout in clients that ignore media queries. The logo has alt text for clients that block images.

This is a web-owned template for handoff. The active email sender is `../progressrooms-api/app/core/email_service.py`; it has intentionally not been changed because this task is limited to the web/UI app. Connecting this template to delivery requires a separate API change. Do not claim emails use this template until it is connected.
