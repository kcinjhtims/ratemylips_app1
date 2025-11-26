
import { LipFeatures, ScoringResult, LipArchetype, DetailedScores } from '../types';
import { ImageStats } from './imageAnalysis';

// --- Helper Math Functions ---
const max = (...args: number[]) => Math.max(...args);
const min = (...args: number[]) => Math.min(...args);
const abs = Math.abs;
const exp = Math.exp;

// Helper for normalization 0-100
const norm = (val: number) => max(0, min(100, val));

// --- CONSISTENCY ENGINE ---
// Simple hash function to turn string (email + image) into a number seed
function cyrb128(str: string): number[] {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    // Return a single float 0-1 derived from hash
    return [(h1^h2^h3^h4)>>>0, h2]; 
}

// Seeded Random Number Generator
let seedState = 1;
export function seedRandom(seedString: string) {
    const hashes = cyrb128(seedString);
    seedState = hashes[0];
}

function random(): number {
    const x = Math.sin(seedState++) * 10000;
    return x - Math.floor(x);
}

// --- ROAST / TOAST GENERATOR ---
export function generateNickname(score: number, f: LipFeatures): string {
    // TOASTS (High Score)
    if (score > 9000) {
        const names = ["The Standard", "God Tier", "Velvet Rope", "The Blueprint", "Golden Ratio", "Kissable", "Lip Legend"];
        return names[Math.floor(random() * names.length)];
    }
    if (score > 8000) {
        return ["Solid 8", "Cute Pout", "Selfie Ready", "Better Than Avg", "Valid"].sort(() => random() - 0.5)[0];
    }

    // ROASTS (Specific Flaws)
    // 1. Duck Lips
    if (f.duck_lip_index > 0.6 || f.lip_projection_index > 0.7) {
        const names = ["Quack Attack", "Trout Pout", "Filler Up", "Duck Dynasty", "The Shelf", "Overinflated"];
        return names[Math.floor(random() * names.length)];
    }
    // 2. Lumpy/Bad Filler
    if (f.lumpy_texture_index > 0.5 || f.filler_migration_index > 0.4) {
        const names = ["Lumpy Space", "Botched", "Migration Pattern", "Bumpy Road", "Refund Please"];
        return names[Math.floor(random() * names.length)];
    }
    // 3. Dry/Crusty
    if (f.dryness_index > 0.7) {
        const names = ["Sahara", "Chapstick Debt", "Thirsty", "Crust Fund", "Gator Skin"];
        return names[Math.floor(random() * names.length)];
    }
    // 4. Thin/No Shape
    if (f.lip_area < 3.5 || f.border_sharpness_index < 0.3) {
        const names = ["Flatline", "Ghost Lips", "Where Are They?", "Paper Cut", "Invisible"];
        return names[Math.floor(random() * names.length)];
    }
    
    // Generic Low Score
    const generics = ["Try Again", "Rough Day", "Unlucky", "Meh", "Mid", "NPC Lips"];
    return generics[Math.floor(random() * generics.length)];
}


// --- Archetype Logic ---
function determineArchetype(f: LipFeatures): LipArchetype {
    // Botched checks first
    if (f.duck_lip_index > 0.7 || f.lip_projection_index > 0.8) return 'The Trout';
    if (f.lumpy_texture_index > 0.6 || f.filler_migration_index > 0.5) return 'Botched Job';

    const ratio = f.upper_lip_height / f.lower_lip_height;
    const bowDepth = f.cupid_bow_depth; 
    const width = f.mouth_width;
    const fullness = f.lip_area;

    if (bowDepth > 1.3 && ratio > 0.6) return 'The Cupid'; 
    if (ratio > 0.8) return 'The Pillowy'; 
    if (width > 5.5) return 'The Wide Smile'; 
    if (width < 4.0 && fullness > 5.0) return 'The Rosebud'; 
    if (bowDepth > 1.0 && f.border_sharpness_index > 0.8) return 'The Hollywood'; 
    if (f.dryness_index < 0.3 && f.vertical_crease_density < 0.3) return 'The Natural'; 
    return 'The Classic'; 
}

// --- Scoring Functions ---

function symmetry_score(f: LipFeatures): number {
    const asym = abs(f.left_lip_area - f.right_lip_area) / max(f.left_lip_area, f.right_lip_area, 1e-6);
    // Strict penalties
    if (asym <= 0.05) return 100.0;
    if (asym >= 0.20) return 30.0; // Harsh penalty for asymmetry (common in bad filler)
    return 100.0 - (asym - 0.05) * (70.0 / 0.15);
}

function horizontal_proportion_score(f: LipFeatures): number {
    const ratio = f.mouth_width / max(f.face_width, 1e-6);
    const ideal = 0.40; 
    const deviation = abs(ratio - ideal);
    return 100.0 * exp(-20.0 * deviation * deviation); // Stricter curve
}

function vertical_proportion_score(f: LipFeatures): number {
    const ratio = f.upper_lip_height / max(f.lower_lip_height, 1e-6);
    const ideal = 0.618; // Golden Ratio
    const deviation = abs(ratio - ideal);
    let score = 100.0 * exp(-10.0 * deviation * deviation);
    
    if (ratio > 1.0) {
        // Penalty for upper lip being larger than lower (common filler mistake)
        score *= 0.5; 
    }
    return max(0.0, min(100.0, score));
}

function shape_definition_score(f: LipFeatures): number {
    // Migration penalty: if filler migrated, definition is destroyed
    if (f.filler_migration_index > 0.5) return 20;

    const depth_score = 100.0 * min(1.0, f.cupid_bow_depth / 1.2);
    const sym_score = 100.0 * f.cupid_bow_symmetry;
    const philtrum_score = f.philtrum_definition_index * 100;
    
    return (0.4 * depth_score) + (0.3 * sym_score) + (0.3 * philtrum_score);
}

function texture_border_score(f: LipFeatures): number {
    // Massive penalties for bad filler texture
    if (f.lumpy_texture_index > 0.4) return 30;
    if (f.lumpy_texture_index > 0.7) return 10;

    const border = 100.0 * f.border_sharpness_index;
    const dryness_penalty = 120.0 * f.dryness_index; 
    const wrinkle_penalty = 80.0 * f.wrinkle_roughness;
    
    let base = border - (dryness_penalty * 0.6) - (wrinkle_penalty * 0.4);
    return max(0.0, min(100.0, base));
}

function color_score(f: LipFeatures): number {
    const redness = f.redness;
    let redness_component = 100.0 * (1 - abs(redness - 0.5) / 0.5);
    if (f.discoloration_index > 0.4) redness_component *= 0.5;
    
    const uniformity = 100.0 * f.color_uniformity;
    return (0.5 * redness_component) + (0.5 * uniformity);
}

function naturalness_score(f: LipFeatures): number {
    // The "Botched" Detector
    if (f.duck_lip_index > 0.5) return 20;
    if (f.lip_projection_index > 0.6) return 30;
    if (f.filler_migration_index > 0.4) return 25;

    const ratio = f.lip_to_lower_face_area_ratio;
    const ideal = 0.22;
    const deviation = abs(ratio - ideal);
    
    return 100.0 * exp(-10.0 * deviation * deviation);
}

function combine_to_0_100(f: LipFeatures): number {
    const s_sym = symmetry_score(f);
    const s_horiz = horizontal_proportion_score(f);
    const s_vert = vertical_proportion_score(f);
    const s_shape = shape_definition_score(f);
    const s_tex = texture_border_score(f);
    const s_col = color_score(f);
    const s_nat = naturalness_score(f);
    
    // Weights
    let base = (
        0.15 * s_sym +
        0.10 * s_horiz +
        0.10 * s_vert +
        0.15 * s_shape +
        0.15 * s_tex +
        0.10 * s_col +
        0.25 * s_nat // Naturalness is key for distinguishing bad filler
    );
    
    // Override Penalties for "Ugly" features
    // If lumpy or migrated or ducky, cap the score significantly
    if (f.lumpy_texture_index > 0.5 || f.filler_migration_index > 0.5 || f.duck_lip_index > 0.6) {
        base = min(base, 45.0); // Automatic "Fail" grade
    }
    // Dryness penalty cap
    if (f.dryness_index > 0.8) {
        base = min(base, 60.0);
    }

    return max(0.0, min(100.0, base));
}

export function calculateLipScore(f: LipFeatures): ScoringResult {
    const finalScore0to100 = combine_to_0_100(f);
    const totalScore = Math.round(finalScore0to100 / 100.0 * 10000);

    // Detailed Calc
    const currentRatio = f.upper_lip_height / max(f.lower_lip_height, 0.1);
    const goldenRatio = 0.618;
    const ratioDiff = abs(currentRatio - goldenRatio);
    const goldenRatioMatch = norm(100 * exp(-8.0 * ratioDiff));

    const balanceRatio = f.upper_lip_height / max(f.lower_lip_height, 0.1);
    const balanceDev = abs(balanceRatio - 0.618);
    const upperLowerBalance = norm(100 * exp(-2.0 * balanceDev));

    // Cosmetic Integrity (How likely is it botched?)
    // 100 = Natural, 0 = Totally Botched
    let integrity = 100;
    integrity -= (f.lumpy_texture_index * 40);
    integrity -= (f.filler_migration_index * 40);
    integrity -= (f.duck_lip_index * 30);
    integrity = norm(integrity);

    return {
        totalScore,
        rankScore: finalScore0to100,
        lipArchetype: determineArchetype(f),
        goldenRatioMatch: goldenRatioMatch,
        cosmeticIntegrity: integrity,
        dimensionScores: {
            symmetry: symmetry_score(f),
            proportionHorizontal: horizontal_proportion_score(f),
            proportionVertical: vertical_proportion_score(f),
            shape: shape_definition_score(f),
            texture: texture_border_score(f),
            color: color_score(f),
            naturalness: naturalness_score(f),
            pose: 100 // simplified
        },
        details: {
            // Architecture
            cupidBowPrecision: norm(f.cupid_bow_depth * 100 / 1.2),
            cornerDefinition: norm((1 - abs(f.corner_taper_ratio - 0.6)/0.6) * 100),
            philtrumDepth: norm(f.philtrum_definition_index * 100),
            vermilionContrast: norm(f.vermilion_contrast_index * 100),
            lateralVolume: norm((f.lateral_upper_height / f.upper_lip_height) * 100), 
            lowerLipPout: norm((f.lower_lip_central_height / f.lower_lip_height) * 100), 

            // Surface Ecology
            smoothness: norm((1 - f.wrinkle_roughness) * 100),
            hydration: norm((1 - f.dryness_index) * 100),
            borderDefinition: norm(f.border_sharpness_index * 100),
            verticalLineScore: norm((1 - f.vertical_crease_density) * 100),
            naturalGloss: norm(f.glossiness_index * 100),
            skinHealth: norm((1 - (f.dryness_index * 0.5 + f.discoloration_index * 0.5)) * 100),

            // Chromatic Depth
            vitality: norm(f.redness * 100),
            uniformity: norm(f.color_uniformity * 100),
            pigmentationDepth: norm(f.pigmentation_saturation * 100),
            gradientSmoothness: norm(f.gradient_smoothness_index * 100),

            // Harmonic Ratios
            symmetryBalance: symmetry_score(f),
            widthProportion: horizontal_proportion_score(f),
            verticalRatio: vertical_proportion_score(f),
            upperLowerBalance: upperLowerBalance,
            cornerUplift: norm(((f.corner_uplift_angle_deg + 10) / 40) * 100)
        }
    };
}

// --- REAL PIXEL EXTRACTION (Using Image Stats) ---
export function extractFeaturesFromImage(stats: ImageStats): LipFeatures {
    // Base random factors still exist for things we can't measure (like exact shape dimensions)
    // BUT, we now skew them heavily based on REAL pixel data.
    
    const isBlurry = stats.sharpness < 0.3;
    const isPale = stats.redness < 0.4;
    const isLowContrast = stats.contrast < 0.2;
    
    // Determine Quality based on real data
    // High sharpness + High Redness = Good
    const qualityScore = (stats.sharpness * 0.4) + (stats.redness * 0.4) + (stats.contrast * 0.2);
    
    const features: LipFeatures = {
        // Dimensions (Randomized but influenced by seed in main app)
        upper_lip_height: 0.8 + (random() * 0.4),
        lower_lip_height: 1.2 + (random() * 0.5),
        mouth_width: 4.0 + (random() * 2.0),
        face_width: 12.0,
        lip_area: 4.0 + random() * 3.0,
        lower_face_area: 20.0,
        left_lip_area: 2.5 + (random() * 0.1),
        right_lip_area: 2.5,
        lower_lip_central_height: 1.0,
        lateral_upper_height: 0.5,

        // Shape (Partially Random)
        cupid_bow_depth: 0.8 + random() * 0.5,
        cupid_bow_symmetry: 0.9 + (random() * 0.1),
        corner_taper_ratio: 0.6,
        philtrum_definition_index: 0.8,
        vermilion_contrast_index: stats.contrast, // REAL: Use contrast for border def
        corner_uplift_angle_deg: (random() * 20) - 5,

        // Texture (REAL)
        border_sharpness_index: stats.sharpness, // REAL
        dryness_index: 1 - stats.saturation, // REAL: Low sat often means dry/pale
        wrinkle_roughness: isBlurry ? 0.8 : 0.2, // Blurry often means lack of texture/smoothness in bad way, or we assume noise is roughness
        vertical_crease_density: random() * 0.5,
        glossiness_index: stats.brightness, // REAL: Brightness as proxy for gloss

        // Botched Metrics (Inferred)
        // If contrast is super low but brightness high, might be "overfilled balloon" look
        lumpy_texture_index: isLowContrast && stats.brightness > 0.7 ? 0.6 : 0.1,
        filler_migration_index: 0.1,

        // Color (REAL)
        redness: stats.redness, // REAL
        color_uniformity: stats.contrast > 0.5 ? 0.9 : 0.6,
        discoloration_index: isPale ? 0.7 : 0.1,
        pigmentation_saturation: stats.saturation, // REAL
        gradient_smoothness_index: 0.8,

        // Volumetrics
        lip_to_lower_face_area_ratio: 0.22,
        lip_projection_index: 0.2,
        duck_lip_index: 0.0,

        yaw_deviation_deg: 0,
        pitch_deviation_deg: 0,
        roll_deviation_deg: 0,
        occlusion_fraction: 0,
        blur_index: isBlurry ? 0.8 : 0.1
    };
    
    return features;
}

// --- LEGACY SIMULATOR (Fallback) ---
export function simulateExtraction(): LipFeatures {
    const stats: ImageStats = {
        redness: 0.5 + (random() * 0.5),
        brightness: 0.5,
        contrast: 0.5,
        sharpness: 0.5,
        saturation: 0.5
    };
    return extractFeaturesFromImage(stats);
}
