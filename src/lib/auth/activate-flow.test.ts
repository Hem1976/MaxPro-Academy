import { describe, expect, it } from "vitest";
import {
  registerDemoUser,
  updateDemoUserPassword,
  upsertDemoLearnerInvite,
} from "@/lib/data/demo-store";

describe("external learner activation (demo)", () => {
  it("provisions invite then allows password change with temporary password", () => {
    const email = `activate-test-${Date.now()}@example.com`;
    const temp = "TempPass-9x!";
    const newPass = "NewSecurePass-10!";

    upsertDemoLearnerInvite({
      email,
      password: temp,
      full_name: "Activate Test User",
      company: "Test Co",
      job_title: "Learner",
    });

    const updated = updateDemoUserPassword(email, temp, newPass);
    expect(updated).toBe(true);

    expect(() =>
      registerDemoUser({
        email,
        password: "other",
        full_name: "Duplicate",
      }),
    ).toThrow();
  });
});
