import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

// Prefer SANITY_STUDIO_* (available in Studio runtime via import.meta.env),
// fall back to NEXT_PUBLIC_* for local dev.
const studioProjectId = (import.meta as any)?.env?.SANITY_STUDIO_PROJECT_ID as
  | string
  | undefined;
const studioDataset = (import.meta as any)?.env?.SANITY_STUDIO_DATASET as
  | string
  | undefined;

const projectId =
  studioProjectId || (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string);
const dataset =
  studioDataset || (process.env.NEXT_PUBLIC_SANITY_DATASET as string);

export default defineConfig({
  name: "strawhouse",
  title: "Strawhouse",
  projectId: projectId!,
  dataset: dataset!,
  basePath: "/studio",
  plugins: [deskTool(), visionTool()],
  schema: { types: schemaTypes },
});
