import axios from "axios";

const extractEmail = (text = "") => {
  const matches =
    text.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    ) || [];

  const blockedExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".svg",
  ];

  const ignoredDomains = [
    "example.com",
    "example.org",
    "example.net",
    "sentry.io",
    "wixpress.com",
  ];

  return (
    matches
      .map((email) => email.trim().toLowerCase())
      .find(
        (email) =>
          !blockedExtensions.some((ext) =>
            email.endsWith(ext)
          ) &&
          !ignoredDomains.some((domain) =>
            email.endsWith(`@${domain}`)
          )
      ) || ""
  );
};

const getBaseUrl = (domain = "") => {
  if (!domain) return "";

  try {
    const value = domain.startsWith("http")
      ? domain
      : `https://${domain}`;

    const url = new URL(value);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return "";
    }

    return url.origin;
  } catch {
    return "";
  }
};

const fetchWebsite = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 7000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      validateStatus: (status) =>
        status >= 200 && status < 400,
    });

    return typeof response.data === "string"
      ? response.data
      : "";
  } catch {
    return "";
  }
};

export const findEmail = async ({
  companyName,
  domain,
}) => {
  if (!domain) {
    return {
      email: "",
      status: "not_found",
      source: "Website",
    };
  }

  const baseUrl = getBaseUrl(domain);

  if (!baseUrl) {
    return {
      email: "",
      status: "not_found",
      source: "Website",
    };
  }

  const pages = [
    baseUrl,
    `${baseUrl}/contact`,
    `${baseUrl}/contact-us`,
    `${baseUrl}/about`,
    `${baseUrl}/about-us`,
  ];

  console.log(
    `Finding email for: ${companyName || domain}`
  );

  for (const pageUrl of pages) {
    console.log(`Checking email page: ${pageUrl}`);

    const html = await fetchWebsite(pageUrl);

    if (!html) {
      continue;
    }

    const email = extractEmail(html);

    if (email) {
      console.log(
        `Email found: ${email}`
      );

      return {
        email,
        status: "found",
        source: "Website",
      };
    }
  }

  console.log(
    `No email found for: ${companyName || domain}`
  );

  return {
    email: "",
    status: "not_found",
    source: "Website",
  };
};

export const verifyEmail = async (email) => {
  if (!email) {
    return {
      email: "",
      status: "invalid",
      score: 0,
      source: "Local validation",
    };
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return {
      email: normalizedEmail,
      status: "invalid",
      score: 0,
      source: "Local validation",
    };
  }

  return {
    email: normalizedEmail,
    status: "found",
    score: 0,
    source: "Local validation",
  };
};


