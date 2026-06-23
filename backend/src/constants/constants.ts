export const CONSTANTS = {

    CHUNK_SIZE: 50,

    COMPLEXITY_THRESHOLDS: {
        LOW: 5,
        MEDIUM: 10,
        HIGH: 15,
    },

    NESTING_THRESHOLDS: {
        MEDIUM: 4,
        HIGH: 6,
    },

    METRICS:{
        COMPLEXITY: 'Complexity',
        DUPLICATION: 'Duplication',
        TYPE_SAFETY: 'Type Safety',
        COUPLING: 'Coupling'
    },

} as const;


