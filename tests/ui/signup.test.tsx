import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../helpers/renderApp';
import { fake, resetFake } from '../helpers/fakeSupabase';

vi.mock('../../src/lib/supabase', () => import('../helpers/fakeSupabase'));

beforeEach(() => {
  resetFake();
  localStorage.clear();
});

async function fillCredentials(email = 'new@hadir.test', password = 'secret123') {
  await userEvent.type(screen.getByLabelText('الاسم الأول'), 'سارة');
  await userEvent.type(screen.getByLabelText('اسم العائلة'), 'العتيبي');
  await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), email);
  await userEvent.type(screen.getByLabelText('كلمة المرور'), password);
  await userEvent.type(screen.getByLabelText('تأكيد كلمة المرور'), password);
}

describe('sign up', () => {
  it('blocks submission until a role is chosen', async () => {
    renderApp('/signup');
    await fillCredentials();
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الحساب' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('اختر نوع الحساب للمتابعة.');
    expect(fake.lastSignUpRole).toBeNull();
  });

  it('sends the chosen role and lands a provider on /provider', async () => {
    renderApp('/signup');
    await userEvent.click(screen.getByRole('radio', { name: /المنظم/ }));
    await fillCredentials();
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الحساب' }));

    expect(await screen.findByRole('heading', { name: 'لوحة المنظم' })).toBeInTheDocument();
    expect(fake.lastSignUpRole).toBe('provider');
  });

  it('lands a participant on /participant', async () => {
    renderApp('/signup');
    await userEvent.click(screen.getByRole('radio', { name: /المشارك/ }));
    await fillCredentials();
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الحساب' }));

    expect(await screen.findByRole('heading', { name: 'لوحة المشارك' })).toBeInTheDocument();
    expect(fake.lastSignUpRole).toBe('participant');
  });

  it('shows the confirmation screen when email confirmation is required', async () => {
    fake.signUp.session = false;
    renderApp('/signup');
    await userEvent.click(screen.getByRole('radio', { name: /المشارك/ }));
    await fillCredentials();
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الحساب' }));

    expect(await screen.findByRole('heading', { name: 'تحقق من بريدك' })).toBeInTheDocument();
    expect(screen.getByText('new@hadir.test')).toBeInTheDocument();
  });

  it('rejects mismatched passwords', async () => {
    renderApp('/signup');
    await userEvent.click(screen.getByRole('radio', { name: /المشارك/ }));
    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'new@hadir.test');
    await userEvent.type(screen.getByLabelText('كلمة المرور'), 'secret123');
    await userEvent.type(screen.getByLabelText('تأكيد كلمة المرور'), 'secret124');
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الحساب' }));

    expect(await screen.findByText('كلمتا المرور غير متطابقتين.')).toBeInTheDocument();
    expect(fake.lastSignUpRole).toBeNull();
  });

  it('sends the first and last name with the new account', async () => {
    renderApp('/signup');
    await userEvent.click(screen.getByRole('radio', { name: /المشارك/ }));
    await fillCredentials();
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الحساب' }));

    expect(await screen.findByRole('heading', { name: 'لوحة المشارك' })).toBeInTheDocument();
    expect(fake.lastSignUpData).toMatchObject({
      role: 'participant',
      first_name: 'سارة',
      last_name: 'العتيبي',
    });
    expect(screen.getAllByText('سارة العتيبي').length).toBeGreaterThan(0);
  });

  it('requires both names before creating the account', async () => {
    renderApp('/signup');
    await userEvent.click(screen.getByRole('radio', { name: /المشارك/ }));
    await userEvent.type(screen.getByLabelText('الاسم الأول'), 'س');
    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'new@hadir.test');
    await userEvent.type(screen.getByLabelText('كلمة المرور'), 'secret123');
    await userEvent.type(screen.getByLabelText('تأكيد كلمة المرور'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'إنشاء الحساب' }));

    expect(await screen.findByText('أدخل الاسم الأول (حرفان على الأقل).')).toBeInTheDocument();
    expect(screen.getByText('أدخل اسم العائلة (حرفان على الأقل).')).toBeInTheDocument();
    expect(fake.lastSignUpRole).toBeNull();
  });
});
