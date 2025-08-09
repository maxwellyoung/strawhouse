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

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uploadImageFromUrl(url, filenameHint = "image.jpg") {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image ${url}: ${res.status}`);
  const contentType = res.headers.get("content-type") || undefined;
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = path.basename(new URL(url).pathname) || filenameHint;
  const asset = await client.assets.upload("image", buf, {
    filename,
    contentType,
  });
  return asset; // contains _id
}

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

  // Create a few shows with images pulled from Unsplash (placeholder)
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
      heroUrl:
        "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=2000",
      galleryUrls: [
        "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=2000",
        "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=2000",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=2000",
      ],
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
      heroUrl:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=2000",
      galleryUrls: [
        "https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=2000",
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=2000",
      ],
      year: 2025,
    },
  ];

  for (const raw of shows) {
    const id = `seed-show-${raw.slug?.current || slugify(raw.title)}`;

    // Upload hero
    let hero;
    if (raw.heroUrl) {
      const asset = await uploadImageFromUrl(
        raw.heroUrl,
        `${raw.title}-hero.jpg`,
      );
      hero = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
    }

    // Upload gallery
    const gallery = [];
    for (const url of raw.galleryUrls || []) {
      const asset = await uploadImageFromUrl(url, `${raw.title}-gallery.jpg`);
      gallery.push({
        _type: "image",
        _key: randomUUID(),
        asset: { _type: "reference", _ref: asset._id },
      });
    }

    const doc = {
      _id: id,
      _type: "show",
      title: raw.title,
      subtitle: raw.subtitle,
      artists: raw.artists,
      start: raw.start,
      end: raw.end,
      venue: raw.venue,
      press: raw.press,
      links: raw.links,
      slug: raw.slug || { _type: "slug", current: slugify(raw.title) },
      year: raw.year,
      hero,
      gallery,
    };

    // Ensure keys in arrays
    doc.links = (doc.links || []).map((l) => ({
      _key: l._key || randomUUID(),
      ...l,
    }));
    doc.press = (doc.press || []).map((b) => ({
      ...b,
      _key: b._key || randomUUID(),
      children: (b.children || []).map((c) => ({
        ...c,
        _key: c._key || randomUUID(),
      })),
    }));

    await client.createOrReplace(doc);
  }

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
