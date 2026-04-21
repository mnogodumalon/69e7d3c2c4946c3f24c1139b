// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export interface Fermenter2Livebild {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
  };
}

export const APP_IDS = {
  FERMENTER_2_LIVEBILD: '69e7d3b82dcd3f9ec28882d7',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'fermenter_2_livebild': {
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateFermenter2Livebild = StripLookup<Fermenter2Livebild['fields']>;