'use client'

import { useI18nStore, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const languages: { code: Locale; label: string; short: string }[] = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'en', label: 'English', short: 'EN' },
]

export function LanguageSelector() {
  const { locale, setLocale } = useI18nStore()

  return (
    <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 gap-0.5">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          title={lang.label}
          className={cn(
            'relative px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200',
            locale === lang.code
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {lang.short}
          {locale === lang.code && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-emerald-500" />
          )}
        </button>
      ))}
    </div>
  )
}
