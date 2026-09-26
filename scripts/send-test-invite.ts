import { sendCredentialsInviteEmail } from "../src/lib/email/postmark";
import { upsertDemoLearnerInvite } from "../src/lib/data/demo-store";

const to = process.argv[2] ?? "kalpitpatel751@gmail.com";
const temporaryPassword = "Demo-Temp-9xK!";

async function main() {
  upsertDemoLearnerInvite({
    email: to,
    password: temporaryPassword,
    full_name: "Kalpit Patel",
    company: "Maxpro Infotech",
    job_title: "Academy Admin",
    phone: null,
  });

  const result = await sendCredentialsInviteEmail({
    to,
    fullName: "Kalpit Patel",
    email: to,
    temporaryPassword,
    company: "Maxpro Infotech",
    position: "Academy Admin",
  });

  if (!result.ok) {
    console.error("Failed:", result.error);
    process.exit(1);
  }

  console.log("Sent test invite to", to, "MessageID:", result.messageId);
}

main();
