export type FeaturedPhase = 'idle' | 'leaving-grid' | 'revealing-detail' | 'detail';
export type FeaturedState = { phase: FeaturedPhase; selectedId: number | null };
export type FeaturedAction =
  | { type: 'select'; workId: number }
  | { type: 'grid-left' }
  | { type: 'detail-ready' }
  | { type: 'close' };

export const initialFeaturedState: FeaturedState = { phase: 'idle', selectedId: null };

export function featuredReducer(state: FeaturedState, action: FeaturedAction): FeaturedState {
  if (action.type === 'close') return initialFeaturedState;
  if (action.type === 'select') {
    return state.phase === 'idle'
      ? { phase: 'leaving-grid', selectedId: action.workId }
      : state;
  }
  if (action.type === 'grid-left' && state.phase === 'leaving-grid') {
    return { ...state, phase: 'revealing-detail' };
  }
  if (action.type === 'detail-ready' && state.phase === 'revealing-detail') {
    return { ...state, phase: 'detail' };
  }
  return state;
}
