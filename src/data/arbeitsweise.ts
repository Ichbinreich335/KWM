import type { Schritt } from './typen';

/** Wie ein Meisterstück entsteht, von der Masse bis zum Holzbrand */
export const arbeitsschritte: readonly Schritt[] = [
  {
    titel: 'Masse',
    text: 'Young-Jae Lee verwendet Porzellan- und Steinzeugmassen. Zum Teil mischt sie die Massen, um eine optimale Drehfähigkeit und Tondichte zu erreichen. Porzellan liefert einen weißen oder nahezu weißen Scherben, Steinzeugton einen beigen, eher erdigen Farbton.',
  },
  {
    titel: 'Drehen',
    text: 'Die Gefäße werden auf der elektrischen Scheibe nach der östlichen Drehweise gegen den Uhrzeigersinn gedreht.',
  },
  {
    titel: 'Abdrehen',
    text: 'Das Abdrehen erfolgt nach der westlichen Weise im Uhrzeigersinn: Der lederharte – feuchte, aber nicht mehr weiche – Ton wird mit einem Dreheisen spanweise abgetragen.',
  },
  {
    titel: 'Engobe',
    text: 'Im ungebrannten, noch feuchten Zustand werden die Zylindervasen mit Engoben, dickflüssigem Tonschlicker, bemalt. Sie müssen auf den Schrumpfungsgrad der Tonmasse abgestimmt sein, damit die Bemalung nach dem Trocknen oder dem Brand nicht abplatzt.',
  },
  {
    titel: 'Schrühbrand und Glasur',
    text: 'Nach dem ersten Brand bei etwa 950\u202f°C werden die Gefäße glasiert: größere übergossen, kleinere Schalen zumeist in die Glasur getaucht. Bemalungen mit Kobalt-, Eisen- oder Kupferoxiden werden zuvor mit dem Pinsel aufgetragen. Die Glasuren sind Feldspatglasuren, zum Teil mit Asche versetzt; als färbendes Mittel beschränkt sich Young-Jae Lee auf Eisenoxid.',
  },
  {
    titel: 'Ofenatmosphäre',
    text: 'Eisenoxid färbt in oxidierender Atmosphäre gelb bis braun, in reduzierender grün, während Kupfer von Grün nach Rot umschlägt. Die Glasurbrände erfolgen im Gasofen bei etwa 1300\u202f°C.',
  },
  {
    titel: 'Holzbrand',
    text: 'Eine reichere Tönung und oft nicht zu steuernde Verfärbungen ergeben sich im Holzbrand. Über neun bis zehn Stunden wird kontinuierlich bis auf 1300\u202f°C gefeuert – für einen Brand braucht es etwa 1,5 Festmeter Holz.',
  },
];
