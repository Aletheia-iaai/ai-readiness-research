// v2 — bumped so Netlify's diff check redeploys this function with current env vars
const PRIORITY_KEYS = [
  "Continuous control monitoring / testing",
  "SOX walkthroughs & evidence gathering",
  "Investigation & fraud triage",
  "Thematic / board & audit committee reporting",
  "Data quality & source-of-truth reconciliation",
  "Risk assessment & audit planning",
  "Upskilling the team",
  "Other",
];

const CONFIDENCE_KEYS = [
  "Low — we haven’t really started",
  "Developing — piloting, unsure of governance",
  "Confident — in production, refining controls",
  "Very confident — embedded and defensible",
];

const REGION_KEYS = ["APAC", "EMEA", "Americas", "Global", "Other"];

exports.handler = async function () {
  const token = process.env.NETLIFY_ACCESS_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID;

  const empty = () => ({
    total: 0,
    priorities: Object.fromEntries(PRIORITY_KEYS.map((k) => [k, 0])),
    confidence: Object.fromEntries(CONFIDENCE_KEYS.map((k) => [k, 0])),
    region: Object.fromEntries(REGION_KEYS.map((k) => [k, 0])),
  });

  if (!token || !siteId) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Missing NETLIFY_ACCESS_TOKEN or NETLIFY_SITE_ID environment variable.",
      }),
    };
  }

  try {
    const formsRes = await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/forms`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!formsRes.ok) {
      throw new Error(`Forms lookup failed: HTTP ${formsRes.status}`);
    }
    const forms = await formsRes.json();
    const form = forms.find((f) => f.name === "ai-enquiry");

    if (!form) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify(empty()),
      };
    }

    const subsRes = await fetch(
      `https://api.netlify.com/api/v1/forms/${form.id}/submissions`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!subsRes.ok) {
      throw new Error(`Submissions lookup failed: HTTP ${subsRes.status}`);
    }
    const submissions = await subsRes.json();

    const result = empty();
    result.total = submissions.length;

    submissions.forEach((sub) => {
      const data = sub.data || {};

      let picked = data.priorities || [];
      if (!Array.isArray(picked)) picked = [picked];
      picked.forEach((p) => {
        if (Object.prototype.hasOwnProperty.call(result.priorities, p)) {
          result.priorities[p] += 1;
        }
      });

      if (Object.prototype.hasOwnProperty.call(result.confidence, data.confidence)) {
        result.confidence[data.confidence] += 1;
      }
      if (Object.prototype.hasOwnProperty.call(result.region, data.region)) {
        result.region[data.region] += 1;
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(err && err.message ? err.message : err) }),
    };
  }
};
