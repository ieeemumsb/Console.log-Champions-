import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";




export async function fetchFileFromConvex(
  storageId: Id<"_storage">
): Promise<Blob> {
  const { url } = await fetchQuery(api.files.getFileUrl, { storageId });

  if (!url) {
    throw new Error("File not found");
  }



  // Now you can fetch the file using the URL, or return it to the client
  const response = await fetch(url);

  const blob = await response.blob();
  

  return blob;
}
