import { readFile } from "node:fs/promises";
import path from "node:path";
import { getLogoUrlForEmail } from "@/lib/email/postmark-config";

const INLINE_LOGO_CID = "maxpro-logo";

export type PostmarkInlineAttachment = {
  Name: string;
  Content: string;
  ContentType: string;
  ContentID: string;
};

/** Prefer CID-embedded logo so Gmail works before static assets are deployed. */
export async function resolveEmailLogoForPostmark(): Promise<{
  logoUrl: string;
  attachments: PostmarkInlineAttachment[];
}> {
  const fileNames = ["MAXPRO-email.png", "MAXPRO.png"];

  for (const fileName of fileNames) {
    try {
      const filePath = path.join(process.cwd(), "public", fileName);
      const buffer = await readFile(filePath);
      const contentId = `cid:${INLINE_LOGO_CID}`;

      return {
        logoUrl: contentId,
        attachments: [
          {
            Name: fileName,
            Content: buffer.toString("base64"),
            ContentType: "image/png",
            ContentID: contentId,
          },
        ],
      };
    } catch {
      // try next file
    }
  }

  return { logoUrl: getLogoUrlForEmail(), attachments: [] };
}
