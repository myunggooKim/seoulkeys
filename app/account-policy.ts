export type SignupRole = "student" | "teacher";
export type SignInKind = "signup" | "returning";

export function normalizeAccountEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeSignupRole(value: unknown): SignupRole | null {
  return value === "teacher" || value === "student" ? value : null;
}

export function classifySignIn(hasExistingAccount: boolean): SignInKind {
  return hasExistingAccount ? "returning" : "signup";
}

/**
 * Role choice is accepted only while creating an account. A returning learner
 * cannot promote the stored account by editing the sign-in request payload.
 */
export function resolveMemberRole(
  existingRole: string | null,
  requestedRole: SignupRole | null,
): SignupRole {
  if (existingRole !== null) {
    return existingRole === "teacher" || existingRole === "org_admin"
      ? "teacher"
      : "student";
  }
  return requestedRole ?? "student";
}

export function isTeacherRole(role: string): role is "teacher" | "org_admin" {
  return role === "teacher" || role === "org_admin";
}

/**
 * A verified Google email is the account's stable ownership proof. Google can
 * legitimately issue a new subject after an account migration, so an old
 * subject may be replaced as long as the new one is not owned by another
 * Seoul Keys account.
 */
export function googleSubjectHasDifferentOwner(
  subjectOwnerEmail: string | null | undefined,
  verifiedEmail: string,
): boolean {
  return Boolean(
    subjectOwnerEmail
    && normalizeAccountEmail(subjectOwnerEmail) !== normalizeAccountEmail(verifiedEmail),
  );
}
