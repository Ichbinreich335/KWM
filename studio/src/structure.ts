import { CalendarIcon } from '@sanity/icons/Calendar';
import { ArchiveIcon } from '@sanity/icons/Archive';
import { BellIcon } from '@sanity/icons/Bell';
import { CogIcon } from '@sanity/icons/Cog';
import { DocumentIcon } from '@sanity/icons/Document';
import { PinIcon } from '@sanity/icons/Pin';
import { HomeIcon } from '@sanity/icons/Home';
import type { StructureResolver } from 'sanity/structure';
import { SEITEN, WERKSTATT_ID } from './singletons';

/** Heutiges Datum (YYYY-MM-DD) für die Aufteilung in laufend/kommend und Archiv. */
const heute = () => new Date().toISOString().slice(0, 10);

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Inhalt')
    .items([
      S.listItem()
        .title('Ausstellungen')
        .icon(CalendarIcon)
        .child(
          S.list()
            .title('Ausstellungen')
            .items([
              S.listItem()
                .title('Laufend und kommend')
                .icon(CalendarIcon)
                .child(
                  S.documentList()
                    .title('Laufend und kommend')
                    .schemaType('ausstellung')
                    .filter('_type == "ausstellung" && (!defined(ende) || ende >= $heute)')
                    .params({ heute: heute() })
                    .defaultOrdering([{ field: 'start', direction: 'asc' }]),
                ),
              S.listItem()
                .title('Archiv')
                .icon(ArchiveIcon)
                .child(
                  S.documentList()
                    .title('Archiv')
                    .schemaType('ausstellung')
                    .filter('_type == "ausstellung" && defined(ende) && ende < $heute')
                    .params({ heute: heute() })
                    .defaultOrdering([{ field: 'start', direction: 'desc' }]),
                ),
            ]),
        ),
      S.listItem()
        .title('Orte und Galerien')
        .icon(PinIcon)
        .child(
          S.list()
            .title('Orte und Galerien')
            .items([
              S.documentTypeListItem('ort').title('Orte').icon(PinIcon),
              S.documentTypeListItem('galerie').title('Galerien').icon(HomeIcon),
            ]),
        ),
      S.documentTypeListItem('archivEintrag').title('Vergangene Ausstellungen (Liste)').icon(ArchiveIcon),
      S.documentTypeListItem('hinweis').title('Hinweise').icon(BellIcon),
      S.divider(),
      S.listItem()
        .title('Seiten')
        .icon(DocumentIcon)
        .child(
          S.list()
            .title('Seiten')
            .items(
              SEITEN.map(({ id, titel }) =>
                S.listItem()
                  .id(id)
                  .title(titel)
                  .icon(DocumentIcon)
                  .child(S.document().schemaType('seite').documentId(id).title(titel)),
              ),
            ),
        ),
      S.listItem()
        .title('Werkstatt (Kontakt und Zeiten)')
        .icon(CogIcon)
        .child(S.document().schemaType('werkstatt').documentId(WERKSTATT_ID).title('Werkstatt (Kontakt und Zeiten)')),
    ]);
