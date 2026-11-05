// Site-wide settings for the landing page and the docs. Edit here, no build step needed.
window.PILOTKYC = {
  siteName: "PilotKYC",
  docsTitle: "PilotKYC Docs",
  version: "v1",

  // Public API. Substituted for {{BASE_URL}} / {{API_ORIGIN}} in docs/content/*.md and shown on the landing page.
  baseUrl: "https://kyc-api.pilotbot.net/v1",
  apiOrigin: "https://kyc-api.pilotbot.net",

  // "Get API keys" button and {{CONTACT_URL}} in the docs.
  contactUrl: "https://t.me/pilotbotnet",

  defaultPage: "overview",
  // Set to e.g. "https://github.com/<org>/pilotkyc-docs/edit/main/docs/content/" to show an "edit this page" link.
  editBase: "",

  // Landing-page pricing. Amounts are numbers; the landing page formats them.
  pricing: {
    currency: "$",
    sandbox: { free: true },
    production: { amount: 0.05 },
    volume: { contact: true }
  }
};
