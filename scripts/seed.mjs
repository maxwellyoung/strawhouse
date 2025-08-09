import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const contents = fs.readFileSync(filePath, "utf8");
    for (const rawLine of contents.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      let value = rawValue.trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {}
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
  process.exit(1);
}
if (!token) {
  console.error("Missing SANITY_API_TOKEN for write access");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-01",
  token,
  useCdn: false,
});

async function seed() {
  // Upsert site singleton
  const siteDoc = {
    _id: "site-singleton",
    _type: "site",
    aboutBlurb: [
      {
        _type: "block",
        _key: randomUUID(),
        style: "normal",
        children: [
          {
            _type: "span",
            _key: randomUUID(),
            text: "Strawhouse is an artist-run gallery in Mt Eden, Auckland.",
          },
        ],
      },
    ],
    address: "15 Tawari St, Mt Eden",
    hours: "Sat–Sun 12–4pm, or by appointment",
    email: "strawhouse1024@gmail.com",
    instagram: "https://instagram.com/strawhouse4",
  };

  await client.transaction().createOrReplace(siteDoc).commit();

  // Create a few shows without assets (images can be uploaded later in Studio)
  const shows = [
    {
      _type: "show",
      title: "Soft Weather",
      subtitle: "Group exhibition",
      artists: ["A. Artist", "B. Maker"],
      start: "2024-11-15",
      end: "2024-12-15",
      venue: "Strawhouse",
      press: [
        {
          _type: "block",
          _key: randomUUID(),
          style: "normal",
          children: [
            {
              _type: "span",
              _key: randomUUID(),
              text: "Press text for Soft Weather.",
            },
          ],
        },
      ],
      links: [
        {
          _type: "object",
          _key: randomUUID(),
          label: "Instagram",
          url: "https://instagram.com/strawhouse4",
        },
      ],
      slug: { _type: "slug", current: "soft-weather" },
      year: 2024,
    },
    {
      _type: "show",
      title: "Afterlight",
      artists: ["C. Nguyen"],
      start: "2025-02-10",
      end: "2025-03-02",
      venue: "Strawhouse",
      press: [
        {
          _type: "block",
          _key: randomUUID(),
          style: "normal",
          children: [
            {
              _type: "span",
              _key: randomUUID(),
              text: "Press text for Afterlight.",
            },
          ],
        },
      ],
      slug: { _type: "slug", current: "afterlight" },
      year: 2025,
    },
  ];

  const tx = client.transaction();
  for (const doc of shows) {
    const id = `seed-show-${doc.slug.current}`;
    // ensure keys for arrays that Sanity expects keys on
    const withKeys = {
      ...doc,
      gallery: (doc.gallery || []).map((img) => ({
        _key: randomUUID(),
        ...img,
      })),
      links: (doc.links || []).map((l) => ({ _key: randomUUID(), ...l })),
      press: (doc.press || []).map((b) => ({
        ...b,
        _key: b._key || randomUUID(),
        children: (b.children || []).map((c) => ({
          ...c,
          _key: c._key || randomUUID(),
        })),
      })),
    };
    tx.createOrReplace({ _id: id, ...withKeys });
  }
  await tx.commit();

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
