import axios from "axios";

const decodeHtmlEntities = (text = "") => {
  return text
    .replace(/&commat;/gi, "@")
    .replace(/&#64;/gi, "@")
    .replace(/&#x40;/gi, "@")
    .replace(/&period;/gi, ".")
    .replace(/&#46;/gi, ".")
    .replace(/&#x2e;/gi, ".");
};

const cleanEmail = (email = "") => {
  return email
    .trim()
    .toLowerCase()
    .replace(/^mailto:/i, "")
    .split("?")[0]
    .replace(/[<>"'(),;]+$/g, "");
};

const isValidEmail = (email = "") => {
  if (!email) return false;

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

  if (
    blockedExtensions.some((ext) =>
      email.endsWith(ext)
    )
  ) {
    return false;
  }

  if (
    ignoredDomains.some((domain) =>
      email.endsWith(`@${domain}`)
    )
  ) {
    return false;
  }

  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    email
  );
};

const extractEmails = (text = "") => {
  if (!text) return [];

  const decodedText =
    decodeHtmlEntities(text);

  const normalMatches =
    decodedText.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    ) || [];

  const obfuscatedMatches =
    decodedText.match(
      /[a-zA-Z0-9._%+-]+\s*(?:\[at\]|\(at\)|\sat\s)\s*[a-zA-Z0-9.-]+\s*(?:\[dot\]|\(dot\)|\sdot\s)\s*[a-zA-Z]{2,}/gi
    ) || [];

  const convertedObfuscated =
    obfuscatedMatches.map((email) =>
      email
        .replace(
          /\s*(\[at\]|\(at\)|\sat\s)\s*/gi,
          "@"
        )
        .replace(
          /\s*(\[dot\]|\(dot\)|\sdot\s*)\s*/gi,
          "."
        )
        .replace(/\s+/g, "")
    );

  return [
    ...new Set(
      [
        ...normalMatches,
        ...convertedObfuscated,
      ]
        .map(cleanEmail)
        .filter(isValidEmail)
    ),
  ];
};

const extractMailtoEmails = (html = "") => {
  const matches =
    html.match(
      /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
    ) || [];

  return [
    ...new Set(
      matches
        .map(cleanEmail)
        .filter(isValidEmail)
    ),
  ];
};

const extractJsonLdEmails = (html = "") => {
  const emails = [];

  const scripts =
    html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi
    ) || [];

  for (const script of scripts) {
    try {
      const jsonText = script
        .replace(
          /<script[^>]*>/i,
          ""
        )
        .replace(
          /<\/script>/i,
          ""
        )
        .trim();

      const data = JSON.parse(jsonText);

      const collectEmails = (value) => {
        if (!value) return;

        if (typeof value === "string") {
          const email = cleanEmail(value);

          if (isValidEmail(email)) {
            emails.push(email);
          }

          return;
        }

        if (Array.isArray(value)) {
          value.forEach(collectEmails);
          return;
        }

        if (
          typeof value === "object"
        ) {
          Object.entries(value).forEach(
            ([key, nestedValue]) => {
              if (
                key.toLowerCase() ===
                  "email" &&
                typeof nestedValue ===
                  "string"
              ) {
                const email =
                  cleanEmail(
                    nestedValue
                  );

                if (
                  isValidEmail(email)
                ) {
                  emails.push(email);
                }
              } else {
                collectEmails(
                  nestedValue
                );
              }
            }
          );
        }
      };

      collectEmails(data);
    } catch {
      // Ignore invalid JSON-LD
    }
  }

  return [
    ...new Set(emails),
  ];
};

const getWebsiteUrl = (url = "") => {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return "";
    }

    return parsed.origin;
  } catch {
    return "";
  }
};

const getDomain = (url = "") => {
  try {
    return new URL(url)
      .hostname
      .replace(/^www\./i, "");
  } catch {
    return "";
  }
};

const fetchPage = async (url) => {
  try {
    const response =
      await axios.get(url, {
        timeout: 7000,
        maxRedirects: 5,

        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36",

          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },

        validateStatus:
          (status) =>
            status >= 200 &&
            status < 400,
      });

    return typeof response.data ===
      "string"
      ? response.data
      : "";
  } catch {
    return "";
  }
};

const findWebsiteEmail = async (
  website
) => {
  const baseUrl =
    getWebsiteUrl(website);

  if (!baseUrl) {
    return "";
  }

  const pages = [
    baseUrl,
    `${baseUrl}/contact`,
    `${baseUrl}/contact-us`,
    `${baseUrl}/contactus`,
    `${baseUrl}/about`,
    `${baseUrl}/about-us`,
    `${baseUrl}/pages/contact`,
    `${baseUrl}/pages/contact-us`,
    `${baseUrl}/contact.html`,
    `${baseUrl}/about.html`,
  ];

  const uniquePages = [
    ...new Set(pages),
  ];

  for (const pageUrl of uniquePages) {
    console.log(
      `Checking page for email: ${pageUrl}`
    );

    const html =
      await fetchPage(pageUrl);

    if (!html) {
      continue;
    }

    const emails =
      extractEmails(html);

    if (emails.length > 0) {
      console.log(
        `Email found: ${emails[0]}`
      );

      return emails[0];
    }

    const mailtoEmails =
      extractMailtoEmails(html);

    if (mailtoEmails.length > 0) {
      console.log(
        `Mailto email found: ${mailtoEmails[0]}`
      );

      return mailtoEmails[0];
    }

    const jsonLdEmails =
      extractJsonLdEmails(html);

    if (jsonLdEmails.length > 0) {
      console.log(
        `JSON-LD email found: ${jsonLdEmails[0]}`
      );

      return jsonLdEmails[0];
    }
  }

  return "";
};

const findEmailWithSerpApi = async ({
  companyName,
  website,
}) => {
  if (!process.env.SERPAPI_KEY) {
    return "";
  }

  const domain =
    getDomain(website);

  if (!domain) {
    return "";
  }

  const queries = [
    `site:${domain} email`,
    `"${companyName}" email`,
  ];

  for (const query of queries) {
    try {
      console.log(
        `SerpApi email search: ${query}`
      );

      const response =
        await axios.get(
          "https://serpapi.com/search.json",
          {
            params: {
              engine: "google",
              q: query,
              gl: "us",
              hl: "en",
              num: 10,
              api_key:
                process.env.SERPAPI_KEY,
            },

            timeout: 10000,
          }
        );

      const results =
        response.data
          ?.organic_results || [];

      for (const result of results) {
        const text = [
          result.title || "",
          result.snippet || "",
          result.displayed_link ||
            "",
          result.link || "",
          JSON.stringify(
            result.rich_snippet ||
              {}
          ),
        ].join(" ");

        const emails =
          extractEmails(text);

        if (emails.length > 0) {
          console.log(
            `SerpApi email found: ${emails[0]}`
          );

          return emails[0];
        }
      }
    } catch (error) {
      console.error(
        "SerpApi email fallback error:",
        error.response?.data ||
          error.message
      );
    }
  }

  return "";
};

export const searchBusinesses = async ({
  category = "Home Decor",
  city = "",
  state = "",
  keyword = "",
}) => {
  if (!process.env.SERPAPI_KEY) {
    throw new Error(
      "SERPAPI_KEY is missing in .env"
    );
  }

  const searchTerms = [
    category,
    keyword,
    "wholesale distributors",
    "buyers",
  ]
    .filter(Boolean)
    .join(" ");

  const location = [
    city,
    state,
    "United States",
  ]
    .filter(Boolean)
    .join(", ");

  const query =
    `${searchTerms} ${location}`.trim();

  try {
    const response =
      await axios.get(
        "https://serpapi.com/search.json",
        {
          params: {
            engine: "google",
            q: query,
            gl: "us",
            hl: "en",
            num: 100,
            api_key:
              process.env.SERPAPI_KEY,
          },
        }
      );

    const results =
      response.data
        ?.organic_results || [];

    console.log(
      `SerpApi returned ${results.length} results`
    );

    const businesses = [];

    for (
      let index = 0;
      index < results.length;
      index++
    ) {
      const item = results[index];

      if (
        !item.title ||
        !item.link
      ) {
        continue;
      }

      const website =
        getWebsiteUrl(item.link);

      const searchText = [
        item.title,
        item.snippet || "",
        item.displayed_link ||
          "",
        JSON.stringify(
          item.rich_snippet ||
            {}
        ),
      ].join(" ");

      const snippetEmail =
        extractEmails(
          searchText
        )[0] || "";

      let email =
        snippetEmail;

      if (!email && website) {
        console.log(
          `Checking website for email: ${item.title}`
        );

        email =
          await findWebsiteEmail(
            website
          );
      }

      /*
       * Final fallback:
       * Search Google through SerpApi
       * for the company's public email.
       *
       * Only runs when the website
       * extraction found nothing.
       */
      if (!email && website) {
        email =
          await findEmailWithSerpApi({
            companyName:
              item.title,
            website,
          });
      }

      businesses.push({
        companyName:
          item.title,

        category,

        country:
          "United States",

        state,

        city,

        address:
          location,

        website:
          item.link,

        phone: "",

        email,

        emailStatus:
          email
            ? "found"
            : "not_found",

        placeId:
          `serpapi-${Date.now()}-${index}`,

        source:
          "SerpApi",
      });
    }

    console.log(
      `Businesses processed: ${businesses.length}`
    );

    console.log(
      `Emails found: ${
        businesses.filter(
          (business) =>
            business.email
        ).length
      }`
    );

    return businesses;
  } catch (error) {
    console.error(
      "SerpApi search error:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "SerpApi search failed"
    );
  }
};




