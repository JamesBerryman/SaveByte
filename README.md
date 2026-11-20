# SaveByte

Static website for SaveByte, James Berryman’s small UK brand for the school IT apps he builds as a hobby. The pages are plain HTML, CSS and JavaScript so [GitHub Pages](https://pages.github.com/) can serve them with no build step and no server.

- Home introduces SaveByte.
- Projects describes [CRASH](projects.html#crash) (Chromebook repairs, assets, loans and storage) and [Spyro](projects.html#spyro) (the library desk).
- Contact posts a form to [Formspree](https://formspree.io).

The apps themselves stay in their own private repositories: <https://github.com/JamesBerryman/crash> and <https://github.com/JamesBerryman/spyro>. This site does not contain their code. The CRASH pictures are mockups filled with fictional names and serials. The Spyro pictures are screenshots of the catalogue and show books only.

## Header logo

The logo in the header and on the home page is `images/savebyte-logo.png`. Replace that one file to swap it. The favicon is separate: `favicon.ico`, `images/icon-16.png`, `images/icon-32.png`, `images/icon-180.png` (apple touch icon), and the manifest icons `images/icon-192.png` and `images/icon-512.png`.

## Preview locally

From this folder:

```bash
python3 -m http.server 8080
```

Open <http://localhost:8080>. Use a local server rather than opening the files directly, so paths and the contact script behave as they will on Pages.

## Turn on GitHub Pages

1. Push this repository to GitHub (the default branch is `main`).
2. Open the repository **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **main** and folder **/ (root)**, then save.
5. Wait until Pages shows a visit URL. For this repository that is <https://jamesberryman.github.io/SaveByte/>.

The site is the files at the root of `main`. There is no Actions workflow and nothing to compile. `.nojekyll` is present so GitHub Pages serves the files as they are, without Jekyll processing.

A free GitHub account serves Pages from a public repository. If the repository is private, Pages is only available on a plan that includes it.

## Contact form (Formspree)

The form in `contact.html` posts to a placeholder address:

```text
https://formspree.io/f/YOUR_FORM_ID
```

Until that id is replaced, the page checks the fields in the browser and then shows the thank-you state with a note that nothing was sent.

To connect a free Formspree form:

1. Create a free account at <https://formspree.io> and confirm the email address you want messages sent to.
2. Create a new form. Formspree gives it an address like `https://formspree.io/f/abcdwxyz`.
3. Copy the id (the part after `/f/`, such as `abcdwxyz`).
4. In `contact.html`, replace `YOUR_FORM_ID` in the form’s `action` with that id. The script reads the action from the form, so this is the only place to change.
5. Commit and push. Pages will pick up the new file on the next deploy.
6. Send yourself a test from the live site. The thank-you state should say the message was sent, and it should arrive in the Formspree dashboard (and by email, if you turned notifications on).

The form asks for name, email, school (optional) and message. A hidden `_gotcha` field is included for Formspree’s spam check. Leave it unused.

## Custom domain later

`savebyte.co.uk` is not registered yet, so this repository deliberately has **no `CNAME` file**. Adding one now would tell GitHub Pages to expect that hostname before it exists.

When the domain is registered and the DNS below is in place:

1. Create a file named `CNAME` (no extension) in the root of the repository. The exact contents to put in it are in the HTML comment at the bottom of this README. Do not create that file before then.
2. In **Settings → Pages**, set the custom domain to `savebyte.co.uk` and, after the certificate is issued, turn on **Enforce HTTPS**.
3. At the domain registrar, add the GitHub Pages records:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `jamesberryman.github.io` |

Apex (`savebyte.co.uk`) uses the four A records. `www` points at the GitHub Pages host for the account, not at the repository name. GitHub’s [custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) is the reference if those addresses ever change. DNS can take a while to settle; Pages will keep showing a certificate warning until it does.

<!--
Do not create a CNAME file until savebyte.co.uk is registered and DNS is in place.
The file would be named CNAME, with no extension, and its only line would be:

savebyte.co.uk
-->
