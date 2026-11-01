// Site-wide details. SITE_URL is set per host so canonical links and share
// links point at the right domain (GitHub Pages preview, Vercel, or scips.org.uk).
const base = {
  "name": "SCIPS",
  "fullName": "Sandwell Community Information and Participation Service",
  "legalName": "Sandwell Community Information and Participation Service Limited",
  "phone": "0121 544 1230",
  "phoneHref": "+441215441230",
  "email": "enquiries@scips.org.uk",
  "address": [
    "2nd Floor, National Metalforming Centre",
    "37–47 Birmingham Road",
    "West Bromwich",
    "B70 6PY"
  ],
  "hours": "Monday to Friday, 9:30am to 5:30pm",
  "charityNumber": "1097702",
  "companyNumber": "03071683",
  "url": "https://www.scips.org.uk",
  "concept": true,
  "charityRegister": "https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/3103391",
  "strategy": "https://www.sandwell.gov.uk/housing/tenant-engagement-strategy",
  "liveUrl": "https://yrb1.github.io/scips-website"
};

const fromEnv = process.env.SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null);

export default { ...base, liveUrl: (fromEnv || base.liveUrl).replace(/\/$/, "") };
