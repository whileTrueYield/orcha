import React, { useEffect, useState } from "react";
import cn from "classnames";
import { ListFilter, RecordFilterElement } from "types/filter";
import { find, uniqBy } from "lodash";
import { MiniProduct } from "types/graphql";
import { ProductSelect } from "components/fields/ProductSelect";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
}

export function ExplorerProductFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, ...divProps } = props;
  const { products } = filter.recordSets;
  const [lastSelected, setLastSelected] = useState<MiniProduct | undefined>();

  useEffect(() => {
    if (lastSelected && !find(products, { id: lastSelected.id })) {
      setLastSelected(undefined);
    }
  }, [products, lastSelected, setLastSelected]);

  divProps.className = cn(divProps.className);

  const onAddFilter = (product?: MiniProduct) => {
    setLastSelected(product);
    if (product) {
      const filterElt: RecordFilterElement = {
        id: product.id,
        label: product.name,
      };

      onFilterChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          products: uniqBy([...filter.recordSets.products, filterElt], "id"),
        },
      });
    }
  };

  return (
    <div {...divProps}>
      <ProductSelect
        tabIndex={1}
        onChange={(product) => onAddFilter(product)}
        placeholder="Filter by product..."
        includeDraft
        value={lastSelected}
      />
    </div>
  );
}
