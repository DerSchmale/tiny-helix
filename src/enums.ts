export enum Enums {
    Never = "never",
    Less = "less",
    Equal = "equal",
    LessEqual = "less-equal",
    Greater = "greater",
    NotEqual = "not-equal",
    GreaterEqual = "greater-equal",
    Always = "always"
}

export enum FilterMode {
    Nearest = "nearest",
    Linear = "linear"
}

export enum AddressMode {
    ClampToEdge = "clamp-to-edge",
    Repeat = "repeat",
    MirrorRepeat = "mirror-repeat"
}

/**
 * Face culling modes used by the render pipeline primitive state.
 */
export enum CullMode {
    None = 'none',
    Front = 'front',
    Back = 'back'
}
