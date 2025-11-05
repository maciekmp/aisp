import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Settings() {
  const { t } = useTranslation()

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t('settings.title')}
        </h1>
        <LanguageSwitcher />
      </div>
    </div>
  )
}

