import { RoleHome } from '../components/RoleHome';
import { useI18n } from '../i18n/I18nProvider';

export function ProviderHome() {
  const { t } = useI18n();
  return (
    <RoleHome
      title={t('provider.title')}
      lead={t('provider.lead')}
      badge={t('roles.provider.title')}
    />
  );
}
