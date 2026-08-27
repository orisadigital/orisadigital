import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MIN_LENGTH = 8;

function Field({ label, children, hint }) {
  return (
    <div>
      <Label className="text-xs text-slate-500">{label}</Label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default function AccountSettings() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [sessionsMsg, setSessionsMsg] = useState("");
  const [sessionsError, setSessionsError] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDone(false);

    // Checked here as well as by the browser so the messages are specific
    // rather than a generic "please fill in this field".
    if (next.length < MIN_LENGTH) {
      setError(`New password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    if (next === current) {
      setError("New password must be different from the current one.");
      return;
    }

    setSaving(true);
    try {
      await base44.auth.changePassword({ currentPassword: current, newPassword: next });
      reset();
      setDone(true);
    } catch (err) {
      setError(err.message || "Could not change password");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutOthers = async () => {
    setSessionsMsg("");
    setSessionsError("");
    setSigningOut(true);
    try {
      await base44.auth.signOutOtherDevices();
      setSessionsMsg("Signed out everywhere else. This device is still signed in.");
    } catch (err) {
      setSessionsError(err.message || "Could not sign out other devices");
    } finally {
      setSigningOut(false);
    }
  };

  const inputCls = "mt-1 h-9 text-sm";

  return (
    <div className="space-y-4 max-w-lg">
      <div className="border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-600">Account</p>
        <p className="mt-1 text-sm text-slate-900">{user?.email || "—"}</p>
      </div>

      <div className="border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-600">Change Password</p>
        <p className="mt-1 text-xs text-slate-400">
          You will stay signed in on this device. Other devices keep their existing sessions.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm">{error}</div>
        )}
        {done && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 text-sm">
            Password changed. Use the new password next time you sign in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Field label="Current Password">
            <Input
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={inputCls}
              required
            />
          </Field>
          <Field label="New Password" hint={`At least ${MIN_LENGTH} characters.`}>
            <Input
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={inputCls}
              required
            />
          </Field>
          <Field label="Confirm New Password">
            <Input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputCls}
              required
            />
          </Field>
          <div className="pt-1">
            <Button
              type="submit"
              size="sm"
              className="bg-slate-900 hover:bg-slate-800"
              disabled={saving}
            >
              {saving ? "Saving..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>

      <div className="border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-600">Other Devices</p>
        <p className="mt-1 text-xs text-slate-400">
          Signs out every other browser and device. This one stays signed in.
          Changing your password does not do this on its own.
        </p>

        {sessionsError && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm">{sessionsError}</div>
        )}
        {sessionsMsg && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 text-sm">{sessionsMsg}</div>
        )}

        <div className="mt-4">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSignOutOthers}
            disabled={signingOut}
          >
            {signingOut ? "Signing out..." : "Sign Out Other Devices"}
          </Button>
        </div>
      </div>
    </div>
  );
}
