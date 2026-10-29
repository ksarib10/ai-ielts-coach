import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import {
  createRealResourceBankProvider,
  type RealResourceBankProvider
} from '../../../types/realResourceBankProvider';
import {
  type AccessTier,
  type CompactSearchItem,
  type IResourceBankProvider,
  type SearchFilters,
  type SearchResultPage,
  type SourceAttributionRegistry,
  type UIAWLStudyGroup,
  type UIOxfordCard
} from '../../../types/resourceBank';
import { defaultMockResourceBankProvider } from './syntheticCatalog';

export type ResourceBankDataMode = 'MOCK_DATA_ONLY' | 'PRIVATE_DEV_REAL_DATA';

export interface ResourceBankContextValue {
  mode: ResourceBankDataMode;
  setMode?: (mode: ResourceBankDataMode) => void;
  isPrivateDevRealAvailable: boolean;
  isReady: boolean;
  isLoading: boolean;
  accessTier: AccessTier;
  totalEntities: number;
  error: Error | null;
  provider: IResourceBankProvider;
}

const DEFAULT_PRIVATE_BASE_URL = '/api/private-data';

function resolveDefaultDataMode(): ResourceBankDataMode {
  // Public production builds ALWAYS fail-closed to MOCK_DATA_ONLY
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, unknown> }).env;
    if (metaEnv?.PROD) {
      return 'MOCK_DATA_ONLY';
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
      const forcedMode = params.get('dataMode');
      if (forcedMode === 'real' || forcedMode === 'PRIVATE_DEV_REAL_DATA') {
        return 'PRIVATE_DEV_REAL_DATA';
      }
      if (forcedMode === 'mock' || forcedMode === 'MOCK_DATA_ONLY') {
        return 'MOCK_DATA_ONLY';
      }
      const stored = window.localStorage?.getItem('ielts-resource-bank-mode');
      if (stored === 'PRIVATE_DEV_REAL_DATA' || stored === 'MOCK_DATA_ONLY') {
        return stored;
      }
    }
    if (metaEnv?.VITE_RESOURCE_BANK_MODE === 'MOCK_DATA_ONLY') {
      return 'MOCK_DATA_ONLY';
    }
    // In local development browser, default to PRIVATE_DEV_REAL_DATA
    if (typeof window !== 'undefined') {
      return 'PRIVATE_DEV_REAL_DATA';
    }
  } catch {
    // Fallback to mock
  }
  return 'MOCK_DATA_ONLY';
}

let sharedRealProviderInstance: RealResourceBankProvider | null = null;

export function getSharedRealResourceBankProvider(
  baseUrl = DEFAULT_PRIVATE_BASE_URL
): RealResourceBankProvider {
  if (!sharedRealProviderInstance) {
    sharedRealProviderInstance = createRealResourceBankProvider({
      baseUrl,
      enableCache: true,
      maxShardsInMemory: 5,
      cacheTtlMs: 300_000,
      accessTier: 'INTERNAL_DEV_ONLY'
    });
  }
  return sharedRealProviderInstance;
}

const ResourceBankContext = createContext<ResourceBankContextValue | null>(null);

export interface ResourceBankProviderProps {
  children: ReactNode;
  initialMode?: ResourceBankDataMode;
  customProvider?: IResourceBankProvider;
  privateBaseUrl?: string;
}

export function ResourceBankContextProvider({
  children,
  initialMode,
  customProvider,
  privateBaseUrl = DEFAULT_PRIVATE_BASE_URL
}: ResourceBankProviderProps) {
  const [mode, setModeState] = useState<ResourceBankDataMode>(
    () => initialMode ?? resolveDefaultDataMode()
  );
  const [isPrivateDevRealAvailable, setIsPrivateDevRealAvailable] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(() => mode === 'MOCK_DATA_ONLY');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalEntities, setTotalEntities] = useState<number>(() =>
    mode === 'MOCK_DATA_ONLY' ? 20 : 11797
  );
  const [error, setError] = useState<Error | null>(null);

  const realProvider = useMemo(
    () =>
      createRealResourceBankProvider({
        baseUrl: privateBaseUrl,
        enableCache: true,
        maxShardsInMemory: 5,
        cacheTtlMs: 300_000,
        accessTier: 'INTERNAL_DEV_ONLY'
      }),
    [privateBaseUrl]
  );

  const activeProvider: IResourceBankProvider = useMemo(() => {
    if (customProvider) return customProvider;
    return mode === 'PRIVATE_DEV_REAL_DATA' ? realProvider : defaultMockResourceBankProvider;
  }, [customProvider, mode, realProvider]);

  const setMode = useCallback((nextMode: ResourceBankDataMode) => {
    setModeState(nextMode);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('ielts-resource-bank-mode', nextMode);
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  // Probe private dev real endpoint availability in DEV mode without downloading data shards
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function probeManifest() {
      try {
        const metaEnv = (import.meta as unknown as { env?: Record<string, unknown> }).env;
        if (metaEnv?.PROD && !customProvider) {
          return;
        }
        const manifest = await realProvider.getSearchIndexManifest({
          signal: controller.signal
        });
        if (cancelled) return;
        if (manifest?.metadata?.total_indexed_entities) {
          setIsPrivateDevRealAvailable(true);
          if (mode === 'PRIVATE_DEV_REAL_DATA') {
            setTotalEntities(manifest.metadata.total_indexed_entities);
            setIsReady(true);
            setError(null);
          }
        }
      } catch (err) {
        if (cancelled) return;
        setIsPrivateDevRealAvailable(false);
        if (mode === 'PRIVATE_DEV_REAL_DATA') {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (mode === 'PRIVATE_DEV_REAL_DATA') {
      setIsLoading(true);
      void probeManifest();
    } else {
      setTotalEntities(20);
      setIsReady(true);
      setError(null);
      void probeManifest();
    }

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [mode, realProvider, customProvider]);

  const value = useMemo<ResourceBankContextValue>(
    () => ({
      mode,
      setMode,
      isPrivateDevRealAvailable,
      isReady,
      isLoading,
      accessTier: 'INTERNAL_DEV_ONLY',
      totalEntities,
      error,
      provider: activeProvider
    }),
    [mode, setMode, isPrivateDevRealAvailable, isReady, isLoading, totalEntities, error, activeProvider]
  );

  return createElement(ResourceBankContext.Provider, { value }, children);
}

export function useResourceBank(): ResourceBankContextValue {
  const ctx = useContext(ResourceBankContext);
  if (ctx) return ctx;
  return {
    mode: 'MOCK_DATA_ONLY',
    isPrivateDevRealAvailable: false,
    isReady: true,
    isLoading: false,
    accessTier: 'INTERNAL_DEV_ONLY',
    totalEntities: 20,
    error: null,
    provider: defaultMockResourceBankProvider
  };
}

// ============================================================================
// 2. CONTRACT HOOKS (RESOURCE_PROVIDER_CONTRACT.md Section 2)
// ============================================================================

export function useVocabularySearch(
  query: string,
  filters?: SearchFilters,
  initialPage = 1,
  pageSize = 20,
  sortBy: 'relevance' | 'alphabetical' | 'cefr' | 'difficulty' = 'alphabetical',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const { provider } = useResourceBank();
  const [page, setPage] = useState<number>(initialPage);
  const [resultPage, setResultPage] = useState<SearchResultPage<CompactSearchItem>>({
    items: [],
    totalMatches: 0,
    page: initialPage,
    pageSize,
    totalPages: 0,
    hasMore: false,
    facets: { cefr: {}, difficulty: {}, pos: {}, skills: {}, entityTypes: {} }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    const seq = ++requestSeq.current;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    provider
      .search({
        term: query,
        filters,
        page,
        pageSize,
        sortBy,
        sortOrder,
        signal: controller.signal
      })
      .then((res) => {
        if (seq !== requestSeq.current || controller.signal.aborted) return;
        setResultPage(res);
        setIsLoading(false);
      })
      .catch((err) => {
        if (seq !== requestSeq.current || controller.signal.aborted) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [provider, query, filters, page, pageSize, sortBy, sortOrder]);

  return {
    results: resultPage.items,
    totalMatches: resultPage.totalMatches,
    totalPages: resultPage.totalPages,
    isLoading,
    facets: resultPage.facets,
    setPage,
    error
  };
}

export function useWordDetail(entryId: string | null) {
  const { provider } = useResourceBank();
  const [entry, setEntry] = useState<UIOxfordCard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entryId) {
      setEntry(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    provider
      .resolveWordDetail(entryId, { signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return;
        if (res.status === 'FOUND' && res.data) {
          setEntry(res.data);
          setError(null);
        } else {
          setEntry(null);
          setError(res.error ?? `Entry not found: ${entryId}`);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        setEntry(null);
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [provider, entryId]);

  return { entry, isLoading, error };
}

export function useAWLStudyGroups(sublistNumber: number) {
  const { provider } = useResourceBank();
  const [groups, setGroups] = useState<UIAWLStudyGroup[]>([]);
  const [totalFamilies, setTotalFamilies] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    async function loadSublistGroups() {
      try {
        const families = await provider.getAWLSublist(sublistNumber, {
          signal: controller.signal
        });
        if (controller.signal.aborted) return;
        setTotalFamilies(families.length);

        const groupCount = Math.floor(families.length / 10);
        const paddedSub = String(sublistNumber).padStart(2, '0');
        const resolvedGroups: UIAWLStudyGroup[] = [];
        for (let gIdx = 1; gIdx <= groupCount; gIdx++) {
          const paddedGrp = String(gIdx).padStart(2, '0');
          const groupId = ['AWL', 'GRP', `s${paddedSub}`, `g${paddedGrp}`].join('_');
          try {
            const grp = await provider.getAWLStudyGroup(groupId, {
              signal: controller.signal
            });
            resolvedGroups.push(grp);
          } catch {
            // Fallback for mock mode single group
            const mockGrp = await provider.getAWLStudyGroup('MOCK_AWL_GRP_01', {
              signal: controller.signal
            });
            resolvedGroups.push(mockGrp);
            break;
          }
        }
        if (controller.signal.aborted) return;
        setGroups(resolvedGroups);
        setIsLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      }
    }

    void loadSublistGroups();
    return () => {
      controller.abort();
    };
  }, [provider, sublistNumber]);

  return {
    groups,
    sublistSummary: { sublist: sublistNumber, totalFamilies },
    isLoading,
    error
  };
}

export function useAttributionRegistry() {
  const { provider } = useResourceBank();
  const [registry, setRegistry] = useState<SourceAttributionRegistry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    provider
      .getAttributionRequirements({ signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return;
        setRegistry(res);
        setIsLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [provider]);

  return { registry, isLoading, error };
}

