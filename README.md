# Melopal landing page

Static marketing site for [Melopal](https://app.melopal.com) - the teacher ⇔ student
workspace for one-to-one music lessons. No build step, no framework: plain HTML + CSS + a
small vanilla-JS file.

## Pages

| File            | Purpose                                                            |
| --------------- | ------------------------------------------------------------------ |
| `index.html`    | Main landing page, aimed at music teachers                         |
| `ipad.html`     | Deep-dive for iPad/forScore teachers (the highest-intent audience) |
| `students.html` | The student & parent side                                          |
| `pricing.html`  | Early-access pricing (free; students always free)                  |
| `faq.html`      | Objection handling: Drive/email, copyright, GDPR, devices          |

## Design system

Everything mirrors the app so the site feels like an extension of it:

- **Font:** Space Grotesk (Google Fonts), Caveat for small handwritten annotations
- **Colors:** ink `#0f172a`, lilac `#a552db` / soft `#f6eaff` (teacher), green `#047857`
  / soft `#ecfdf5` (student), slate `#64748b`, page bg `#f8fafc`
- **Hand-drawn outlines:** `assets/melopal.js` draws a jittered rounded-rect SVG path
  around every element with the `.sk` class (same idea as the app's "ink" outlines).
  `data-jitter` / `data-stroke` / `data-double` tune the look per element.
- **Motion:** logo spins on load/click/random intervals; outlined elements with
  `.sk-pluck` vibrate like a plucked string on hover; sections fade in on scroll.
  All motion respects `prefers-reduced-motion`.

## Local preview

Any static server works, e.g.:

```bash
npx http-server -p 4173 .
```

## Deploy

The site is deployed with Cloudflare Pages from the GitHub `main` branch.

## Things you may want to change

- **CTA target:** all "Try Melopal free" / "Log in" buttons point to
  `https://app.melopal.com`. `assets/melopal.js` has an `IOS_APP_URL` placeholder
  for the App Store link.
- **Contact form:** `/contact` posts to `/api/contact`. Configure `RESEND_API_KEY`,
  `CONTACT_TO`, and `CONTACT_FROM` in Cloudflare Pages environment variables.
- **Email signup form:** exit-intent signup posts to `/api/subscribe`. Create a
  Cloudflare D1 database and bind it to the Pages project as `EMAIL_SIGNUPS_DB`.
  The schema lives in `migrations/0001_email_subscribers.sql`, and the Function
  also creates the table if it is missing. The table includes export fields for
  later automation into an email marketing platform.
- **Pricing copy:** `pricing.html` promises "students never pay" and a future simple
  teacher plan - adjust when real pricing is decided.
