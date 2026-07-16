'use client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { flexsearchStaticClient } from 'fumadocs-core/search/client/flexsearch-static';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { defaultLocale, isLocale } from '@/lib/i18n';

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n();
  const searchLocale = locale !== undefined && isLocale(locale) ? locale : defaultLocale;
  const { search, setSearch, query } = useDocsSearch({
    client: flexsearchStaticClient({
      from: `/api/search/${searchLocale}`,
      locale: searchLocale,
    }),
  });

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
