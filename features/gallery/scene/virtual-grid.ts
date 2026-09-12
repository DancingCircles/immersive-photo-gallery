type Cell = { row: number; column: number };
type Pool = { columns: number; rows: number };

const positiveModulo = (value: number, span: number) =>
  ((value % span) + span) % span;

// Offsets are measured in cells. The half cell matches the scene's centered wrap.
export function virtualCellForOffset(
  cell: Cell,
  offset: { x: number; y: number },
  pool: Pool,
): Cell {
  return {
    row:
      cell.row -
      Math.floor((cell.row + 0.5 + offset.y) / pool.rows) * pool.rows,
    column:
      cell.column -
      Math.floor((cell.column + 0.5 + offset.x) / pool.columns) * pool.columns,
  };
}

// Each successive wrap window owns a sequential page; reversing returns to it.
export function catalogIndexForCell(cell: Cell, pool: Pool): number {
  const page = Math.max(
    Math.abs(Math.floor(cell.column / pool.columns)),
    Math.abs(Math.floor(cell.row / pool.rows)),
  );
  return (
    page * pool.columns * pool.rows +
    positiveModulo(cell.row, pool.rows) * pool.columns +
    positiveModulo(cell.column, pool.columns)
  );
}

export function catalogItemForIndex<T>(
  catalog: readonly T[],
  index: number,
): T | undefined {
  if (catalog.length === 0) return undefined;
  return catalog[positiveModulo(index, catalog.length)];
}

export function shouldPrefetchCatalog(
  index: number,
  loaded: number,
  hasMore: boolean,
): boolean {
  return hasMore && loaded > 0 && index >= Math.max(0, loaded - 12);
}

export function createBindingGeneration() {
  let generation = 0;
  return {
    next: () => ++generation,
    isCurrent: (candidate: number) => candidate === generation,
  };
}
