import { groq } from "next-sanity";
import { client } from "./client";
import { Project } from "@/lib/types";

export async function getProjects(): Promise<Project> {
  return client.fetch(
    groq`*[_type == "project"] {
      title,
      description,
    }`
  );
}
