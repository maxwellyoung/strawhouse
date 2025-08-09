import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

// Use SANITY_STUDIO_* set by Sanity Studio hosting; fall back to NEXT_PUBLIC_* for local dev
const projectId = (process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) as string;
const dataset = (process.env.SANITY_STUDIO_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET) as string;

export default defineConfig({
  name: "strawhouse",
  title: "Strawhouse",
  projectId: projectId!,
  dataset: dataset!,
  basePath: "/studio",
  plugins: [deskTool(), visionTool()],
  schema: { types: schemaTypes },
});
