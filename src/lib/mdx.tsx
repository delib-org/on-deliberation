import type { Locale } from "@/data/book";
import { Citation } from "@/src/components/citation";
import { ReferencesList } from "@/src/components/references-list";
import { ConsensusCalculator } from "@/src/components/mdx/consensus-calculator";
import { SonGraph } from "@/src/components/mdx/son-graph";

export function getMDXComponents(locale: Locale) {
  return {
    Citation: ({ id }: { id: string }) => <Citation id={id} locale={locale} />,
    ReferencesList: () => <ReferencesList locale={locale} />,
    ConsensusCalculator,
    SonGraph
  };
}

