# Admin panel, order tracking and staff logins: setup guide

The website has three logins:

| Page | Who uses it | What it does |
|---|---|---|
| `/admin/` | You (owner) | Edit website text, photos, testimonials and blog posts. Changes go live in about 2 minutes. |
| `/staff/` | You and your staff | Create orders (an order ID is made automatically), update each order's status step by step, and create staff IDs. |
| `/track/` | Clients | Check their order with the order ID and the last 4 digits of their phone number. No account needed. |

You need three free accounts: **GitHub** (stores the website), **Netlify** (hosts it) and **Supabase** (stores orders and staff logins). Setup takes about an hour, once.

---

## Part 1: Put the website on GitHub and Netlify

1. Create a free account at [github.com](https://github.com). Create a **private** repository called `msgraphics-website`.
2. Upload the contents of this folder to it (on the repository page: *Add file → Upload files*, drag everything in except `node_modules` and `dist`, then *Commit changes*). If you use GitHub Desktop or git, push the folder as usual.
3. Create a free account at [netlify.com](https://www.netlify.com) and log in with GitHub.
4. *Add new site → Import an existing project → GitHub* → pick `msgraphics-website`. The build settings are filled in automatically from `netlify.toml`. Click *Deploy*.
5. In Netlify, *Domain management → Add a domain* and connect `msgraphicsstudio.com`. (Keep `/shop` working: see "Deploying" in README.md.)

From now on, every change saved to GitHub (by you or the admin panel) republishes the site automatically.

## Part 2: Admin panel (`/admin/`)

1. Open `src/config/site.config.js` and set `cmsRepo` to your GitHub username and repository, e.g. `"msgraphics/msgraphics-website"`. Save it to GitHub.
2. Create a GitHub login app: on GitHub, *Settings → Developer settings → OAuth Apps → New OAuth App*.
   - Application name: `MS Graphics admin`
   - Homepage URL: `https://msgraphicsstudio.com`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
   - Click *Register*, then *Generate a new client secret*. Keep the page open.
3. In Netlify: *Site (or Project) configuration → Access & security → OAuth → Install provider → GitHub*, and paste the **Client ID** and **Client secret** from step 2.
4. Go to `https://msgraphicsstudio.com/admin/` and click *Login with GitHub*.

**What you can edit:** every section of every page (business details, home, services, Our Unit, Work, About, contact), client testimonials, and blog posts. Images: click an image field, upload a photo, and write what is in it in "Image description". When you replace a 3D image with a real photo, delete its "3D note" text.

**Who else can log in:** anyone you add as a collaborator on the GitHub repository (*Settings → Collaborators*).

## Part 3: Orders and staff (Supabase)

1. Create a free account at [supabase.com](https://supabase.com) and a *New project* (region: Mumbai). Save the database password somewhere safe.
2. In the project, open *SQL Editor → New query*, paste the whole of `supabase/schema.sql`, and click *Run*. It should say "Success". Whenever `schema.sql` is updated later, run the whole file again the same way: it keeps all existing orders and only adds what is new.
3. Turn off public sign-ups so only you can create logins: *Authentication → Sign In / Providers → Email*: switch off **Allow new users to sign up** and **Confirm email**, then save.
4. Create your own owner login: *Authentication → Users → Add user → Create new user*. Enter your email and a strong password and tick **Auto Confirm User**.
5. Make that login the admin: in *SQL Editor*, run (with your email):
   ```sql
   insert into public.profiles (id, staff_id, full_name, role)
   select id, 'owner', 'Owner', 'admin' from auth.users where email = 'msgraphicsstudio@gmail.com';
   ```
6. Copy the keys from *Project Settings → API* (or *Data API* / *API Keys*):
   - **Project URL** and the **anon / publishable key** go into `src/config/site.config.js` as `supabaseUrl` and `supabaseAnonKey`. These two are safe to publish.
   - The **service_role / secret key** must stay secret. In Netlify, *Site configuration → Environment variables → Add a variable*: add `SUPABASE_URL` (the Project URL) and `SUPABASE_SERVICE_ROLE_KEY` (the secret key). Never put this key in any file.
7. Save `site.config.js` to GitHub (or edit it in GitHub's website). Netlify rebuilds the site.
8. Go to `https://msgraphicsstudio.com/staff/`, log in with your **email** and password.

## Daily use

**Creating a staff ID** (admins only): in `/staff/`, click *Staff → Create a staff ID*. Choose a Staff ID (e.g. `ravi`), their name, a password and the role:
- *Staff*: can create and update orders.
- *Admin*: can also create staff, reset passwords, switch staff off and delete orders.

Staff log in at `/staff/` with their Staff ID (no email needed). When someone leaves, untick **Active** next to their name; they can no longer log in to the panel.

**Creating an order:** *New order* → fill in the client's name and phone (and the rest if known) → *Save order*. The order ID (e.g. `MS2610-4821`) is created automatically. Click **Send tracking link** to WhatsApp it to the client, or *Copy link*.

**Updating an order:** click the order → *Update status* → choose the step, add a short note → *Save update*. Untick **Show this update to the client** for internal notes. Every update is kept in the history with who made it and when. The status can only change through an update, so nothing is lost.

The steps are: Order received → Design in progress → Waiting for your approval → Printing / production → Fabrication → Quality check & packing → Out for delivery / installation → Completed, plus On hold and Cancelled. To rename a step, edit the `label` in `src/config/order-steps.js`.

**Products:** *Products* (top of `/staff/`) holds your categories (Flex, Vinyl, Standee, Canopy to start) and the qualities under each (Flex → Normal, Black Out, Star Flex). Anyone on staff can add a category or a quality and set an optional default rate; it is saved for good and shows up in every new order. Only an admin can delete one. Old orders keep their items even if a product is deleted later.

**Bill items:** in *New order* / *Edit details*, click *Add item*, choose the category and quality, enter width × height in feet (for sq ft items) and the quantity. The rate fills in from Products and can be changed. Add a discount, GST and the advance received; the total and balance are worked out automatically.

**Generate bill:** open an order → *Generate bill*. An A5 bill opens in a new tab; click *Print / Save as PDF*. To print your GSTIN on bills (it is never shown on the website), fill `billGstin` in `src/config/site.config.js`; the bill is then titled "Tax Invoice". Lines such as bank details go in `billNotes`.

**Today's report:** *Today's report* at the top of `/staff/` shows the day's new orders, every status update with who made it, a count per staff member and the orders due today or overdue. Pick another date at the top to see an older day. *Share on WhatsApp* sends a text summary to whoever you choose (e.g. the owner); *Print / Save as PDF* makes a PDF.

**What clients see** at `/track/`: the job, the current step, the expected date and the updates you marked as visible. They never see the phone number, amount, internal notes or staff-only updates.

## Costs and limits

- GitHub, Netlify and Supabase free plans are enough for a business of this size (Supabase free: 500 MB database, 50,000 monthly users).
- A free Supabase project **pauses after 7 days with no activity**. Daily use keeps it awake; if it pauses, click *Restore* in Supabase. Upgrade to the Pro plan (about US$25 a month) if you want it never to pause and to get daily backups.
- Back up orders any time from Supabase: *Table Editor → orders → Export to CSV*.
