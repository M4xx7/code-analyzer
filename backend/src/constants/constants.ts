export const CONSTANTS = {

    BASE_TEMP_DIR: './temp_repos',

    GIT: {
        SHALLOW_CLONE_DEPTH: 1,
        RETRY_COUNT: 10,
        RETRY_DELAY_MS: 100,
    },

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

    ERRORS:{
        VALIDATION: 'Validation',
        REPO_NOT_FOUND: 'RepoNotFound',
        CLONE: 'Clone'
    },


    IMPORTS_THRESHOLD: 10,
    INIT_COMPLEXITY: 1,
    ANONYMOUS: 'anonymous'

} as const;


