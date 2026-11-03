type DelupaSeoDefaults = {
  title: string
  description: string
}

export function useDelupaSeoDefaults({ title, description }: DelupaSeoDefaults) {
  const siteUrl = useRuntimeConfig().public.siteUrl as string

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogSiteName: 'Delupa · Casal de Lupa',
    ogType: 'website',
    ogUrl: siteUrl,
    ogLocale: 'pt_BR',
    twitterCard: 'summary'
  })

  useHead({
    link: [{ rel: 'canonical', href: siteUrl }]
  })
}
