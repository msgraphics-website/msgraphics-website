// =====================================================================
// SITE SETTINGS — form, analytics, links and map.
// Edit the values between quotes. Leave a value as "" to switch it off.
// Text content (services, photos, numbers…) lives in src/data/content/.
// =====================================================================

export default {
  // Your live domain, without a trailing slash. Used for SEO tags and sitemap.xml.
  siteUrl: "https://msgraphicsstudio.com",

  // "Shop Print Products" link in the header.
  shopUrl: "https://msgraphicsstudio.com/shop",

  // ---- Quote form -----------------------------------------------------
  // Paste your Formspree form endpoint here, e.g. "https://formspree.io/f/abcdwxyz".
  // Create a free form at https://formspree.io with the email msgraphicsstudio@gmail.com.
  // Any service that accepts a normal multipart POST (Formspree, Getform, Basin,
  // your own PHP script) works. Leave "" and the form will offer WhatsApp instead.
  formEndpoint: "",

  // Max upload size for artwork files, in MB.
  maxUploadMB: 10,

  // ---- WhatsApp -------------------------------------------------------
  whatsappMessage: "Hi M.S. Graphics Studio, I need a quote for ...",

  // ---- Analytics (leave "" until you have the IDs) -----------------------
  // Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX"
  ga4Id: "",
  // Meta (Facebook) Pixel ID, e.g. "123456789012345"
  metaPixelId: "",

  // ---- Map & local SEO --------------------------------------------------
  // Google Maps embed. Replace with the "Embed a map" link of your exact
  // Google Business listing once it is set up.
  mapEmbedUrl:
    "https://www.google.com/maps?q=Dwarka+Mor,+Patel+Garden+Extension,+New+Delhi+110059&output=embed",
  mapLinkUrl:
    "https://www.google.com/maps/search/?api=1&query=Plot+B-32+Dwarka+Mor+Patel+Garden+Extn+New+Delhi+110059",

  // Approximate coordinates of Dwarka Mor. Replace with the exact pin of the unit.
  geo: { latitude: 28.6192, longitude: 77.0331 },

  // Opening hours for Google (schema.org format). Fill in when confirmed, e.g.
  // [{ days: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], opens: "10:00", closes: "19:00" }]
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "10:00", closes: "19:00" },
  ],

  // Social share image (1200×630) in /public/images.
  ogImage: "/images/og-default.png",

  // ---- Order tracking & staff panel (Supabase) ---------------------------
  // From Supabase → Project Settings → API. Both values are safe to publish
  // (the database rules decide what each visitor can see). Leave "" to show
  // "tracking not connected yet" on /track/ and /staff/.
  supabaseUrl: "https://mqfttcyzshuamcxkfteg.supabase.co",
  supabaseAnonKey: "sb_publishable_Xq72ugp1YTxeXDgWJ-U74A_L9DxbGic",

  // ---- Bills (staff panel → Generate bill) ------------------------------
  // GSTIN printed on bills only (never on the website). With a GSTIN the bill
  // is titled "Tax Invoice"; without one it is titled "Bill".
  billGstin: "",
  // Short lines printed at the bottom of every bill, e.g. bank details or
  // "Goods once sold will not be taken back." Leave [] for none.
  billNotes: [],

  // Staff log in with a short Staff ID (e.g. "ravi"). Behind the scenes it is
  // stored as ravi@<staffEmailDomain>. No email is ever sent to this address.
  staffEmailDomain: "staff.msgraphicsstudio.com",

  // ---- Admin panel (Decap CMS at /admin/) --------------------------------
  // The GitHub repository that holds this website, as "username/repository".
  cmsRepo: "msgraphics-website/msgraphics-website",
  cmsBranch: "main",
};
