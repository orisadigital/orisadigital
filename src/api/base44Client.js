// Base44-compatible API layer backed by Supabase.
// Pages keep calling base44.entities.X / base44.auth.* unchanged; everything
// routes to Postgres (PostgREST), Supabase Auth, and Supabase Storage.
import { supabase } from '@/api/supabaseClient';

const TABLES = {
  Client: 'clients',
  Deal: 'deals',
  Prospect: 'prospects',
  Project: 'projects',
  DomainHosting: 'domain_hosting',
  FollowUp: 'follow_ups',
  Payroll: 'payroll',
  SoftwarePlugin: 'software_plugins',
  Subscription: 'subscriptions',
  Task: 'tasks',
};

function applySort(query, sort) {
  if (!sort) return query;
  const desc = sort.startsWith('-');
  return query.order(desc ? sort.slice(1) : sort, { ascending: !desc });
}

function unwrap({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

function makeEntity(table) {
  return {
    async list(sort) {
      return unwrap(await applySort(supabase.from(table).select('*'), sort));
    },
    async filter(query, sort) {
      return unwrap(
        await applySort(supabase.from(table).select('*').match(query ?? {}), sort)
      );
    },
    async get(id) {
      return unwrap(await supabase.from(table).select('*').eq('id', id).single());
    },
    async create(fields) {
      return unwrap(await supabase.from(table).insert(fields).select().single());
    },
    async update(id, fields) {
      return unwrap(
        await supabase.from(table).update(fields).eq('id', id).select().single()
      );
    },
    async delete(id) {
      unwrap(await supabase.from(table).delete().eq('id', id));
      return { id };
    },
  };
}

const entities = Object.fromEntries(
  Object.entries(TABLES).map(([name, table]) => [name, makeEntity(table)])
);

const auth = {
  async me() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) throw new Error('Not authenticated');
    const { user } = data;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .maybeSingle();
    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'user',
    };
  },

  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  async loginWithProvider(provider, next = '/') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${next}` },
    });
    if (error) throw new Error(error.message);
  },

  // Returns { session } — session is non-null when email confirmation is
  // disabled in Supabase, in which case the caller can skip the OTP step.
  async register({ email, password }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'signup',
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw new Error(error.message);
  },

  // Supabase manages its own session storage; kept for call-site compatibility.
  setToken() {},

  async resetPasswordRequest(email) {
    const address = typeof email === 'string' ? email : email?.email;
    const { error } = await supabase.auth.resetPasswordForEmail(address, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  },

  // The recovery link signs the user in; only the new password is needed.
  async resetPassword({ newPassword }) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

  // Signed-in password change. Supabase's updateUser does NOT ask for the old
  // password, so re-authenticate first: without that, anyone with access to an
  // open session could set a new password without knowing the current one.
  async changePassword({ currentPassword, newPassword }) {
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data?.user?.email) throw new Error('Not authenticated');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.user.email,
      password: currentPassword,
    });
    if (signInError) throw new Error('Current password is incorrect');

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) window.location.href = '/login';
  },

  redirectToLogin(next) {
    window.location.href = next ? `/login?next=${encodeURIComponent(next)}` : '/login';
  },
};

const integrations = {
  Core: {
    async UploadFile({ file }) {
      const path = `${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`;
      const { error } = await supabase.storage.from('uploads').upload(path, file);
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from('uploads').getPublicUrl(path);
      return { file_url: data.publicUrl };
    },
    async ExtractDataFromUploadedFile() {
      throw new Error('AI document extraction is not configured yet.');
    },
    async InvokeLLM() {
      throw new Error('The AI assistant is not configured yet.');
    },
  },
};

export const base44 = { entities, auth, integrations };
