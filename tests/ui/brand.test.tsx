import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrandLoader } from '../../src/components/BrandLoader';
import { Logo } from '../../src/components/Logo';
import { I18nProvider } from '../../src/i18n/I18nProvider';

describe('brand assets', () => {
  it('renders the mark next to the wordmark', () => {
    const { container } = render(
      <I18nProvider>
        <Logo />
      </I18nProvider>,
    );

    expect(screen.getByText('حاضر')).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('uses the animated mark as the loading state', () => {
    const { container } = render(
      <I18nProvider>
        <BrandLoader />
      </I18nProvider>,
    );

    expect(screen.getByRole('status')).toHaveAccessibleName('جارٍ التحميل…');
    expect(container.querySelector('.hadir-beam')).not.toBeNull();
    expect(container.querySelector('.hadir-check')).not.toBeNull();
  });
});
