export const CONSTANTS = {

    BASE_TEMP_DIR: './temp_repos',

    GIT: {
        SHALLOW_CLONE_DEPTH: 1,
        RETRY_COUNT: 10,
        RETRY_DELAY_MS: 100,
    },

    COMPLEXITY_THRESHOLDS:{
        LOW: 5,
        MEDIUM: 10,
        HIGH: 15,
    },

    INIT_COMPLEXITY: 1

} as const;


